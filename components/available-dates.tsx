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
     * Та же логика, что и в календаре бронирования (isBusy):
     * жёстко заняты только дни строго внутри брони. День заезда следующего
     * гостя (r.start) и день выезда предыдущего (r.end) остаются доступными —
     * это транзитные дни (выезд до 12:00, заезд вечером).
     */
    const isFreeDay = (key: string) => !ranges.some((r) => key > r.start && key < r.end)

    const HORIZON = 90
    const found: { s: string; e: string; nights: number }[] = []
    let i = 0
    while (i < HORIZON && found.length < 4) {
      if (!isFreeDay(toDateKey(addDays(today, i)))) {
        i++
        continue
      }
      // непрерывный отрезок доступных дней: i … j-1
      let j = i + 1
      while (j < HORIZON && isFreeDay(toDateKey(addDays(today, j)))) j++
      const lastFree = j - 1
      const nights = lastFree - i
      if (nights >= 2) found.push(formatRange(addDays(today, i), addDays(today, lastFree)))
      i = j
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
