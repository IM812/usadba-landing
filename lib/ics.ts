export interface BusyRange {
  start: string // YYYY-MM-DD
  end: string   // YYYY-MM-DD (exclusive — iCal DTEND convention)
}

let avitoCache: { ranges: BusyRange[]; fetchedAt: number; url: string } | null = null
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

function parseIcalDate(value: string): string | null {
  const raw = value.includes(':') ? value.split(':').pop()! : value
  const digits = raw.replace(/[^0-9]/g, '')
  if (digits.length < 8) return null
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`
}

export async function fetchAvitoRanges(
  icsUrl: string,
): Promise<{ ranges: BusyRange[]; error: string | null; fetchedAt: number | null }> {
  const now = Date.now()
  if (avitoCache && now - avitoCache.fetchedAt < CACHE_TTL_MS && avitoCache.url === icsUrl) {
    return { ranges: avitoCache.ranges, error: null, fetchedAt: avitoCache.fetchedAt }
  }

  if (!icsUrl) {
    return { ranges: [], error: 'AVITO_ICS_URL not configured', fetchedAt: null }
  }

  try {
    const res = await fetch(icsUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 0 },
    })
    if (!res.ok) {
      return { ranges: [], error: `ICS fetch failed: ${res.status}`, fetchedAt: null }
    }
    const text = await res.text()
    const ranges = parseIcs(text)
    avitoCache = { ranges, fetchedAt: now, url: icsUrl }
    return { ranges, error: null, fetchedAt: now }
  } catch (err) {
    return { ranges: [], error: `Network error: ${String(err)}`, fetchedAt: null }
  }
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
