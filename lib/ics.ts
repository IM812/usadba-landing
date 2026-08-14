export interface BusyRange {
  start: string // YYYY-MM-DD
  end: string   // YYYY-MM-DD (exclusive — iCal DTEND convention)
}

let avitoCache: { ranges: BusyRange[]; fetchedAt: number; url: string } | null = null
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes
const FETCH_TIMEOUT_MS = 8_000 // hard cap per attempt — avoid hanging requests piling up
const MAX_ATTEMPTS = 3
const RETRY_BASE_DELAY_MS = 400

// Dedup concurrent calls for the same URL — under load many requests can arrive
// before the cache is refreshed; without this each one would fire its own
// outbound request to Avito in parallel.
let inFlight: { url: string; promise: Promise<{ ranges: BusyRange[]; error: string | null; fetchedAt: number | null }> } | null = null

function log(msg: string, extra?: Record<string, unknown>) {
  console.log(`[v0][avito-ics] ${msg}`, extra ?? '')
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function parseIcalDate(value: string): string | null {
  const raw = value.includes(':') ? value.split(':').pop()! : value
  const digits = raw.replace(/[^0-9]/g, '')
  if (digits.length < 8) return null
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`
}

async function fetchOnce(icsUrl: string, attempt: number): Promise<{ text: string } | { httpError: string } | { networkError: string; timedOut: boolean }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  const startedAt = Date.now()
  try {
    log(`attempt ${attempt}/${MAX_ATTEMPTS} — requesting`, { url: icsUrl })
    const res = await fetch(icsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/calendar, text/plain, */*',
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
      },
      next: { revalidate: 0 },
      cache: 'no-store',
      signal: controller.signal,
    })
    const durationMs = Date.now() - startedAt
    if (!res.ok) {
      log(`attempt ${attempt}/${MAX_ATTEMPTS} — bad status`, { status: res.status, durationMs })
      return { httpError: `ICS fetch failed: ${res.status}` }
    }
    const text = await res.text()
    log(`attempt ${attempt}/${MAX_ATTEMPTS} — success`, { durationMs, bytes: text.length })
    return { text }
  } catch (err) {
    const durationMs = Date.now() - startedAt
    const timedOut = err instanceof Error && err.name === 'AbortError'
    log(`attempt ${attempt}/${MAX_ATTEMPTS} — network error`, {
      durationMs,
      timedOut,
      message: String(err),
    })
    return { networkError: String(err), timedOut }
  } finally {
    clearTimeout(timer)
  }
}

async function fetchAvitoRangesUncached(
  icsUrl: string,
): Promise<{ ranges: BusyRange[]; error: string | null; fetchedAt: number | null }> {
  let lastError = 'Unknown error'

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const result = await fetchOnce(icsUrl, attempt)

    if ('text' in result) {
      const now = Date.now()
      const ranges = parseIcs(result.text)
      avitoCache = { ranges, fetchedAt: now, url: icsUrl }
      log('parsed ranges', { count: ranges.length })
      return { ranges, error: null, fetchedAt: now }
    }

    lastError = 'httpError' in result ? result.httpError : result.networkError

    // Don't retry on a clean HTTP error response (e.g. 404/410 — the ICS link
    // was deleted/rotated on Avito's side, retrying won't help).
    if ('httpError' in result) break

    if (attempt < MAX_ATTEMPTS) {
      const delay = RETRY_BASE_DELAY_MS * attempt
      log(`retrying in ${delay}ms`, { attempt })
      await sleep(delay)
    }
  }

  log('all attempts failed', { error: lastError })

  // Serve stale cache rather than an empty list on failure — an empty list
  // would make Avito-booked dates look available on the site.
  if (avitoCache && avitoCache.url === icsUrl) {
    const staleAgeMs = Date.now() - avitoCache.fetchedAt
    log('serving stale cache after failure', { staleAgeMs, count: avitoCache.ranges.length })
    return { ranges: avitoCache.ranges, error: `${lastError} (serving stale cache, ${Math.round(staleAgeMs / 1000)}s old)`, fetchedAt: avitoCache.fetchedAt }
  }

  return { ranges: [], error: lastError, fetchedAt: null }
}

export async function fetchAvitoRanges(
  icsUrl: string,
): Promise<{ ranges: BusyRange[]; error: string | null; fetchedAt: number | null }> {
  const now = Date.now()
  if (avitoCache && now - avitoCache.fetchedAt < CACHE_TTL_MS && avitoCache.url === icsUrl) {
    log('cache hit', { ageMs: now - avitoCache.fetchedAt, count: avitoCache.ranges.length })
    return { ranges: avitoCache.ranges, error: null, fetchedAt: avitoCache.fetchedAt }
  }

  if (!icsUrl) {
    log('no ICS url configured, skipping')
    return { ranges: [], error: 'AVITO_ICS_URL not configured', fetchedAt: null }
  }

  if (inFlight && inFlight.url === icsUrl) {
    log('joining in-flight request')
    return inFlight.promise
  }

  const promise = fetchAvitoRangesUncached(icsUrl).finally(() => {
    if (inFlight?.url === icsUrl) inFlight = null
  })
  inFlight = { url: icsUrl, promise }
  return promise
}

export function parseIcs(text: string): BusyRange[] {
  const lines = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n[ \t]/g, '')
    .split('\n')

  const ranges: BusyRange[] = []
  let inVEvent = false
  let start: string | null = null
  let end: string | null = null

  for (const line of lines) {
    const upper = line.trimEnd()
    if (upper === 'BEGIN:VEVENT') { inVEvent = true; start = null; end = null; continue }
    if (upper === 'END:VEVENT') {
      inVEvent = false
      if (start && end) ranges.push({ start, end })
      continue
    }
    if (!inVEvent) continue
    if (upper.startsWith('DTSTART')) start = parseIcalDate(upper)
    else if (upper.startsWith('DTEND')) end = parseIcalDate(upper)
  }
  return ranges
}

export function generateIcs(bookings: { id: string; check_in: string; check_out: string }[]): string {
  const now = new Date()
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')

  const events = bookings.map((b) => {
    const dtstart = b.check_in.replace(/-/g, '')
    const dtend = b.check_out.replace(/-/g, '')
    return [
      'BEGIN:VEVENT',
      `UID:${b.id}@usadba-antropkovo`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${dtstart}`,
      `DTEND;VALUE=DATE:${dtend}`,
      'SUMMARY:Booked',
      'END:VEVENT',
    ].join('\r\n')
  })

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Usadba Antropkovo//Booking//RU',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')
}

export function rangesOverlap(a: string, b: string, c: string, d: string): boolean {
  // [a,b) vs [c,d) — departure === c is allowed (morning checkout, evening checkin)
  return a < d && b > c && b !== c
}
