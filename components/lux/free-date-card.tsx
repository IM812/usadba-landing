"use client"

import { ArrowRight } from "lucide-react"
import { useBooking } from "@/components/lux/booking-provider"
import { money, nightsWord } from "@/lib/availability"
import type { FreeWindow } from "@/lib/free-windows"

const MONTHS = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
]

/** «10 — 13 августа» или «29 августа — 2 сентября» */
function formatRange(start: string, end: string) {
  const a = new Date(`${start}T00:00:00`)
  const b = new Date(`${end}T00:00:00`)
  const sameMonth = a.getMonth() === b.getMonth()

  return sameMonth
    ? `${a.getDate()} — ${b.getDate()} ${MONTHS[a.getMonth()]}`
    : `${a.getDate()} ${MONTHS[a.getMonth()]} — ${b.getDate()} ${MONTHS[b.getMonth()]}`
}

function whenLabel(inDays: number) {
  if (inDays <= 0) return "можно сегодня"
  if (inDays === 1) return "уже завтра"
  if (inDays < 7) return `через ${inDays} дн.`
  if (inDays < 14) return "через неделю"
  return `через ${Math.round(inDays / 7)} нед.`
}

export function FreeDateCard({ window: w }: { window: FreeWindow }) {
  const { openBooking } = useBooking()

  return (
    <button
      type="button"
      onClick={() =>
        openBooking({ arrival: w.start, departure: w.end })
      }
      className="group flex w-full flex-col gap-5 border-t border-border pt-5 text-left transition-colors hover:border-accent/70 sm:gap-6 sm:pt-6"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="eyebrow text-accent">{w.label}</span>
        <span className="text-[11px] tracking-wide text-muted-foreground">
          {whenLabel(w.inDays)}
        </span>
      </div>

      <span className="text-balance font-serif text-[1.75rem] font-light leading-[1.05] text-foreground transition-colors group-hover:text-accent sm:text-[2rem]">
        {formatRange(w.start, w.end)}
      </span>

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-serif text-xl font-light text-foreground">
          {money(w.total)} ₽
        </span>
        <span className="text-[13px] text-muted-foreground">
          {w.nights} {nightsWord(w.nights)} · {money(w.perNight)} ₽ в сутки
        </span>
      </div>

      <span className="mt-auto inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground transition-colors group-hover:text-accent">
        Занять эти даты
        <ArrowRight
          className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden
        />
      </span>
    </button>
  )
}
