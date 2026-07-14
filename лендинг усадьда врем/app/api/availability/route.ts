import { NextResponse } from "next/server"

export interface BusyRange {
  start: string // YYYY-MM-DD
  end: string   // YYYY-MM-DD (exclusive — the DTEND from iCal means "up to but not including" this date)
}

// ---------------------------------------------------------------------------
// In-memory cache — no database required
// ---------------------------------------------------------------------------
let cache: { ranges: BusyRange[]; fetchedAt: number } | null = null
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

/** Parse an iCal DTSTART / DTEND value to YYYY-MM-DD.
 *  Handles both date-only (VALUE=DATE:20250701) and datetime (20250701T140000Z) formats. */
function parseIcalDate(value: string): string | null {
  // Remove any TZID parameter noise, keep only the actual value after the final colon
  const raw = value.includes(":") ? value.split(":").pop()! : value
  const digits = raw.replace(/[^0-9]/g, "")
  if (digits.length < 8) return null
  const y = digits.slice(0, 4)
  const m = digits.slice(4, 6)
  const d = digits.slice(6, 8)
  return `${y}-${m}-${d}`
}

export async function fetchBusyRanges(): Promise<{ ranges: BusyRange[]; error: string | null }> {
  const now = Date.now()
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return { ranges: cache.ranges, error: null }
  }

  const icsUrl = process.env.AVITO_ICAL_URL
  if (!icsUrl) {
    return { ranges: [], error: "AVITO_ICAL_URL is not set" }
  }

  try {
    const res = await fetch(icsUrl, {
      next: { revalidate: 0 }, // always fresh when cache is stale
      headers: { "User-Agent": "Mozilla/5.0" },
    })

    if (!res.ok) {
      return { ranges: [], error: `ICS fetch failed: ${res.status}` }
    }

    const text = await res.text()
    const ranges: BusyRange[] = []

    // Simple line-by-line parser — no external dependencies needed
    const lines = text
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      // Unfold continued lines (RFC 5545 §3.1)
      .replace(/\n[ \t]/g, "")
      .split("\n")

    let inVEvent = false
    let start: string | null = null
    let end: string | null = null

    for (const line of lines) {
      const upper = line.trimEnd()
      if (upper === "BEGIN:VEVENT") {
        inVEvent = true
        start = null
        end = null
        continue
      }
      if (upper === "END:VEVENT") {
        inVEvent = false
        if (start && end) ranges.push({ start, end })
        continue
      }
      if (!inVEvent) continue

      if (upper.startsWith("DTSTART")) {
        start = parseIcalDate(upper)
      } else if (upper.startsWith("DTEND")) {
        end = parseIcalDate(upper)
      }
    }

    cache = { ranges, fetchedAt: now }
    return { ranges, error: null }
  } catch (err) {
    console.error("[availability] Fetch error:", err)
    return { ranges: [], error: "Network error fetching ICS" }
  }
}

// ---------------------------------------------------------------------------
// GET /api/availability
// ---------------------------------------------------------------------------
export async function GET() {
  const { ranges, error } = await fetchBusyRanges()

  if (error && ranges.length === 0) {
    return NextResponse.json({ ok: false, error, ranges: [] }, { status: 503 })
  }

  return NextResponse.json({ ok: true, ranges })
}
