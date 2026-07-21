"use client"

import { useEffect, useState } from "react"
import { CalendarDays, ArrowRight } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(r => r.json())

function addDays(d: Date, n: number) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r
}

function formatRange(start: Date, end: Date) {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }
  const s = start.toLocaleDateString("ru-RU", opts)
  const e = end.toLocaleDateString("ru-RU", opts)
  const nights = Math.round((end.getTime() - start.getTime()) / 86400000)
  return { s, e, nights }
}

export function AvailableDates({ onBook }: { onBook: () => void }) {
  const { data } = useSWR("/api/availability", fetcher)
  const [windows, setWindows] = useState<{ s: string; e: string; nights: number }[]>([])

  useEffect(() => {
    if (!data?.blockedRanges) return
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const booked: Set<string> = new Set()
    for (const r of data.blockedRanges) {
      let cur = new Date(r.start)
      const end = new Date(r.end)
      while (cur < end) {
        booked.add(cur.toISOString().slice(0, 10))
        cur = addDays(cur, 1)
      }
    }
    // Find free windows (3+ nights) in next 90 days
    const found: { s: string; e: string; nights: number }[] = []
    let i = 0
    while (i < 90 && found.length < 4) {
      const start = addDays(today, i)
      if (!booked.has(start.toISOString().slice(0, 10))) {
        let j = i + 1
        while (j < 90 && !booked.has(addDays(today, j).toISOString().slice(0, 10))) j++
        const nights = j - i
        if (nights >= 2) {
          found.push(formatRange(start, addDays(today, j)))
        }
        i = j
      } else {
        i++
      }
    }
    setWindows(found.slice(0, 4))
  }, [data])

  if (!windows.length) return null

  return (
    <section className="border-b border-border bg-muted/40 py-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CalendarDays className="size-4 text-primary" />
            Ближайшие свободные даты:
          </div>
          <div className="flex flex-wrap gap-2">
            {windows.map((w, i) => (
              <button
                key={i}
                onClick={onBook}
                className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-sm text-primary transition hover:bg-primary/10 active:scale-95"
              >
                {w.s} — {w.e}
                <span className="text-xs text-primary/70">({w.nights} {w.nights === 1 ? "ночь" : w.nights < 5 ? "ночи" : "ночей"})</span>
              </button>
            ))}
          </div>
          <button
            onClick={onBook}
            className="ml-auto flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            Забронировать <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>
    </section>
  )
}
