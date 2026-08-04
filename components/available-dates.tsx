"use client"

import { useEffect, useState } from "react"
import { CalendarDays, ArrowRight } from "lucide-react"
import useSWR from "swr"

import { addDays, nightsBetween, startOfToday, toDateKey } from "@/lib/date"

const fetcher = (url: string) => fetch(url).then(r => r.json())

function formatRange(start: Date, end: Date) {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }
  const s = start.toLocaleDateString("ru-RU", opts)
  const e = end.toLocaleDateString("ru-RU", opts)
  return { s, e, nights: nightsBetween(start, end) }
}

export function AvailableDates({ onBook }: { onBook: () => void }) {
  const { data } = useSWR("/api/availability", fetcher)
  const [windows, setWindows] = useState<{ s: string; e: string; nights: number }[]>([])

  useEffect(() => {
    const ranges: { start: string; end: string }[] = data?.blockedRanges ?? data?.ranges ?? []
    if (!ranges.length) return
    const today = startOfToday()

    /**
     * Ночь занята, если её дата попадает в [start, end).
     * День выезда (end) свободен для заезда нового гостя, а день заезда
     * следующего гостя (start) можно использовать как день выезда — поэтому
     * окно "5–8" означает: заезд 5-го (после выезда предыдущих), выезд 8-го.
     */
    const isBookedNight = (key: string) => ranges.some((r) => key >= r.start && key < r.end)

    const found: { s: string; e: string; nights: number }[] = []
    let i = 0
    while (i < 90 && found.length < 4) {
      const start = addDays(today, i)
      if (!isBookedNight(toDateKey(start))) {
        let j = i + 1
        while (j < 90 && !isBookedNight(toDateKey(addDays(today, j)))) j++
        const nights = j - i
        if (nights >= 2) found.push(formatRange(start, addDays(today, j)))
        i = j
      } else {
        i++
      }
    }
    setWindows(found.slice(0, 4))
  }, [data])

  if (!windows.length) return null

  return (
    <section className="border-b border-border bg-muted/40 py-4 sm:py-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <CalendarDays className="size-4 shrink-0 text-primary" />
              Ближайшие свободные даты
            </div>
            <button
              onClick={onBook}
              className="flex items-center gap-1 text-sm font-semibold text-primary sm:hidden"
            >
              Все даты <ArrowRight className="size-3.5" />
            </button>
          </div>

          {/* На телефоне — горизонтальная прокрутка, чтобы плашки не ломали строку */}
          <div className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:flex-wrap sm:px-0">
            {windows.map((w, i) => (
              <button
                key={i}
                onClick={onBook}
                className="flex min-h-10 shrink-0 snap-start items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-4 text-sm text-primary transition hover:bg-primary/10 active:scale-95 sm:min-h-0 sm:px-3 sm:py-1"
              >
                {w.s} — {w.e}
                <span className="text-xs text-primary/70">
                  ({w.nights} {w.nights === 1 ? "ночь" : w.nights < 5 ? "ночи" : "ночей"})
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={onBook}
            className="ml-auto hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:flex"
          >
            Забронировать <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>
    </section>
  )
}
