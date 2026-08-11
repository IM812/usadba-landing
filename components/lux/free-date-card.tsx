"use client"

import { ArrowRight, Moon } from "lucide-react"
import { useBooking } from "@/components/lux/booking-provider"
import { money, nightsWord } from "@/lib/availability"
import { cn } from "@/lib/utils"
import type { FreeWindow } from "@/lib/free-windows"

const MONTHS = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
]

/** Разбирает диапазон на части, чтобы крупно показать числа, а месяц — тихо. */
function splitRange(start: string, end: string) {
  const a = new Date(`${start}T00:00:00`)
  const b = new Date(`${end}T00:00:00`)
  const sameMonth = a.getMonth() === b.getMonth()

  return {
    days: `${a.getDate()} — ${b.getDate()}`,
    month: sameMonth
      ? MONTHS[a.getMonth()]
      : `${MONTHS[a.getMonth()]} — ${MONTHS[b.getMonth()]}`,
    sameMonth,
    startDay: a.getDate(),
    endDay: b.getDate(),
  }
}

function whenLabel(inDays: number) {
  if (inDays <= 0) return "можно сегодня"
  if (inDays === 1) return "уже завтра"
  if (inDays < 7) return `через ${inDays} дн.`
  if (inDays < 14) return "через неделю"
  return `через ${Math.round(inDays / 7)} нед.`
}

export function FreeDateCard({
  window: w,
  featured = false,
}: {
  window: FreeWindow
  featured?: boolean
}) {
  const { openBooking } = useBooking()
  const range = splitRange(w.start, w.end)

  return (
    <button
      type="button"
      onClick={() => openBooking({ arrival: w.start, departure: w.end })}
      className={cn(
        // surface даёт верхний отблеск и собственную тень БЕЗ hover: на
        // телефоне наведения не бывает, а прежняя тень висела только на
        // hover — поэтому все карточки там выглядели плоскими наклейками.
        "group relative flex w-full flex-col overflow-hidden rounded-2xl border bg-card p-5 text-left transition-all duration-500 sm:p-6",
        "surface hover:-translate-y-0.5 hover:shadow-elev-3",
        featured ? "border-accent/45 shadow-elev-2" : "border-border hover:border-accent/40",
      )}
    >
      {/* Латунная нить сверху: у ближайшего окна горит сразу, у остальных — при наведении */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-px origin-left bg-accent transition-transform duration-500",
          featured ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
        )}
      />

      <div className="flex items-start justify-between gap-3">
        <span className="eyebrow text-accent">{w.label}</span>
        <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {whenLabel(w.inDays)}
        </span>
      </div>

      {/* Крупные числа — главный носитель смысла, месяц подписью */}
      <span className="mt-5 font-display text-[2.6rem] font-semibold leading-[0.95] tracking-tight text-foreground transition-colors group-hover:text-accent sm:text-[3rem]">
        {range.days}
      </span>
      <span className="mt-2 text-[13px] lowercase tracking-wide text-muted-foreground">
        {range.month}
      </span>

      <div className="mt-5 flex items-center gap-2 text-[12px] text-muted-foreground">
        <Moon className="size-3.5 text-accent/70" aria-hidden />
        {w.nights} {nightsWord(w.nights)} · {money(w.perNight)} ₽ в сутки
      </div>

      <div className="mt-5 flex items-end justify-between gap-3 border-t border-border pt-4">
        <span className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            За всё проживание
          </span>
          <span className="mt-1 font-display text-[1.6rem] font-semibold leading-none text-foreground">
            {money(w.total)} ₽
          </span>
        </span>

        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-accent/40 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground"
        >
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>

      <span className="sr-only">Забронировать эти даты</span>
    </button>
  )
}
