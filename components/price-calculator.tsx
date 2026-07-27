"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, Users, CalendarDays, ArrowRight } from "lucide-react"

const MONTHS_RU = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"]
const DAYS_RU = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"]

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

function addDays(d: Date, n: number) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

function isWeekend(d: Date) {
  const day = d.getDay()
  return day === 5 || day === 6 // пт-сб как "выходные" для цены
}

type SeasonalPrice = {
  id: string
  name: string
  date_from: string // MM-DD
  date_to: string   // MM-DD
  base_price: number
  weekend_price: number
  active: boolean
}

function getSeasonalPrice(
  d: Date,
  seasons: SeasonalPrice[],
  fallbackBase: number,
  fallbackWeekend: number,
): number {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const key = `${mm}-${dd}`

  for (const s of seasons) {
    const from = s.date_from
    const to = s.date_to
    // Handle year wrap-around (e.g. Зима: 12-01 — 02-28)
    const inRange = from <= to ? key >= from && key <= to : key >= from || key <= to
    if (inRange) {
      return isWeekend(d) ? s.weekend_price : s.base_price
    }
  }

  return isWeekend(d) ? fallbackWeekend : fallbackBase
}

export function PriceCalculator({ onBook }: { onBook: () => void }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [guests, setGuests] = useState(2)
  const [bookedRanges, setBookedRanges] = useState<{ start: string; end: string }[]>([])
  const [settings, setSettings] = useState({ base_price: 20000, weekend_price: 24000, extra_guest_price: 0, cleaning_fee: 0, minimum_nights: 1 })
  const [seasonalPrices, setSeasonalPrices] = useState<SeasonalPrice[]>([])

  useEffect(() => {
    fetch("/api/availability")
      .then(r => r.json())
      .then(d => {
        if (d.blockedRanges) setBookedRanges(d.blockedRanges)
        else if (d.ranges) setBookedRanges(d.ranges)
        if (d.settings) setSettings(d.settings)
        if (d.seasonalPrices) setSeasonalPrices(d.seasonalPrices)
      })
      .catch(() => {})
  }, [])

  const isBooked = useCallback((d: Date) => {
    const key = toDateKey(d)
    return bookedRanges.some(r => key >= r.start && key < r.end)
  }, [bookedRanges])

  const isPast = (d: Date) => d < today

  const handleDayClick = (d: Date) => {
    if (isPast(d) || isBooked(d)) return
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(d)
      setCheckOut(null)
    } else {
      if (d <= checkIn) { setCheckIn(d); setCheckOut(null); return }
      // Check no booked days in range
      let cur = addDays(checkIn, 1)
      while (cur < d) {
        if (isBooked(cur)) { setCheckIn(d); setCheckOut(null); return }
        cur = addDays(cur, 1)
      }
      setCheckOut(d)
    }
  }

  const BASE_GUESTS = 6
  const MAX_GUESTS = 14

  const calcPrice = () => {
    if (!checkIn || !checkOut) return null
    const nights = daysBetween(checkIn, checkOut)
    let subtotal = 0
    for (let i = 0; i < nights; i++) {
      const d = addDays(checkIn, i)
      subtotal += getSeasonalPrice(d, seasonalPrices, settings.base_price, settings.weekend_price)
    }
    const extraGuests = Math.max(0, guests - BASE_GUESTS)
    const extraGuestFee = extraGuests * nights * (settings.extra_guest_price ?? 0)
    const cleaningFee = settings.cleaning_fee ?? 0
    const total = subtotal + extraGuestFee + cleaningFee
    return { nights, subtotal, extraGuestFee, cleaningFee, total }
  }

  const price = calcPrice()

  // Build calendar days
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  // offset: Monday=0
  const startOffset = (firstDay.getDay() + 6) % 7

  const days: (Date | null)[] = []
  for (let i = 0; i < startOffset; i++) days.push(null)
  for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i))

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const getDayClass = (d: Date) => {
    const key = toDateKey(d)
    const isIn = checkIn && toDateKey(checkIn) === key
    const isOut = checkOut && toDateKey(checkOut) === key
    const inRange = checkIn && checkOut && d > checkIn && d < checkOut
    const booked = isBooked(d)
    const past = isPast(d)

    if (isIn || isOut) return "bg-primary text-primary-foreground font-semibold rounded-full cursor-pointer"
    if (inRange) return "bg-primary/15 text-foreground cursor-pointer"
    if (booked) return "bg-rose-100 text-rose-400 line-through rounded-full cursor-not-allowed dark:bg-rose-950/40 dark:text-rose-400"
    if (past) return "text-muted-foreground/40 cursor-not-allowed"
    return "hover:bg-primary/10 rounded-full cursor-pointer transition-colors"
  }

  const formatDate = (d: Date) =>
    d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })

  return (
    <section id="calculator" className="bg-card py-16 sm:py-24">
      <div data-reveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Цена поездки</p>
          <h2 className="mt-3 font-serif text-3xl text-foreground sm:text-4xl">Рассчитайте стоимость</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Выберите даты и количество гостей — сразу увидите итоговую сумму
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Calendar */}
          <div className="rounded-2xl border border-border bg-background p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <button onClick={prevMonth} className="flex size-9 items-center justify-center rounded-full hover:bg-muted transition-colors" aria-label="Предыдущий месяц">
                <ChevronLeft className="size-5" />
              </button>
              <span className="font-serif text-lg text-foreground">
                {MONTHS_RU[month]} {year}
              </span>
              <button onClick={nextMonth} className="flex size-9 items-center justify-center rounded-full hover:bg-muted transition-colors" aria-label="Следующий месяц">
                <ChevronRight className="size-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {DAYS_RU.map(d => (
                <div key={d} className="py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{d}</div>
              ))}
              {days.map((d, i) =>
                d ? (
                  <button
                    key={i}
                    onClick={() => handleDayClick(d)}
                    disabled={isPast(d) || isBooked(d)}
                    className={`flex aspect-square w-full items-center justify-center text-sm ${getDayClass(d)}`}
                  >
                    {d.getDate()}
                  </button>
                ) : <div key={i} />
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="inline-block size-3 rounded-full bg-rose-200 dark:bg-rose-950" />З��нято</span>
              <span className="flex items-center gap-1.5"><span className="inline-block size-3 rounded-full bg-primary" />Ваши даты</span>
              <span className="flex items-center gap-1.5"><span className="inline-block size-3 rounded-full bg-primary/15" />Выбранный период</span>
            </div>
          </div>

          {/* Summary */}
          <div className="flex flex-col gap-4">
            {/* Dates */}
            <div className="rounded-2xl border border-border bg-background p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <CalendarDays className="size-4" /> Даты
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Заезд</p>
                  <p className="mt-0.5 font-medium text-foreground">{checkIn ? formatDate(checkIn) : "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Выезд</p>
                  <p className="mt-0.5 font-medium text-foreground">{checkOut ? formatDate(checkOut) : "—"}</p>
                </div>
              </div>
            </div>

            {/* Guests */}
            <div className="rounded-2xl border border-border bg-background p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Users className="size-4" /> Гостей
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setGuests(g => Math.max(1, g - 1))}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors text-lg font-bold"
                  aria-label="Уменьшить"
                >−</button>
                <input
                  type="number"
                  min={1}
                  max={MAX_GUESTS}
                  value={guests}
                  onChange={e => {
                    const v = Math.min(MAX_GUESTS, Math.max(1, Number(e.target.value) || 1))
                    setGuests(v)
                  }}
                  className="w-14 rounded-lg border border-input bg-background py-1.5 text-center text-xl font-serif text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() => setGuests(g => Math.min(MAX_GUESTS, g + 1))}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors text-lg font-bold"
                  aria-label="Увеличить"
                >+</button>
                <span className="text-xs text-muted-foreground leading-tight">
                  макс.{" "}{MAX_GUESTS}
                </span>
              </div>
              {guests > BASE_GUESTS && settings.extra_guest_price > 0 && (
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                  + {settings.extra_guest_price.toLocaleString("ru-RU")} ₽/гость/ночь за {guests - BASE_GUESTS} доп. {guests - BASE_GUESTS === 1 ? "гостя" : "гостей"}
                </p>
              )}
            </div>

            {/* Price breakdown */}
            <div className="flex-1 rounded-2xl border border-border bg-background p-5">
              {price ? (
                <>
                  <p className="text-sm font-semibold text-muted-foreground">Итого</p>
                  <p className="mt-1 font-serif text-4xl text-foreground">
                    {price.total.toLocaleString("ru-RU")} ₽
                  </p>
                  <div className="mt-2 flex flex-col gap-0.5 text-xs text-muted-foreground">
                    <span>
                      {price.nights} {price.nights === 1 ? "ночь" : price.nights < 5 ? "ночи" : "ночей"} — {price.subtotal.toLocaleString("ru-RU")} ₽
                    </span>
                    {price.extraGuestFee > 0 && (
                      <span className="text-amber-600 dark:text-amber-400">
                        + доп. гости — {price.extraGuestFee.toLocaleString("ru-RU")} ₽
                      </span>
                    )}
                    {price.cleaningFee > 0 && (
                      <span>+ уборка — {price.cleaningFee.toLocaleString("ru-RU")} ₽</span>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {!checkIn ? "Выберите дату заезда на календаре" : "Теперь выберите дату выезда"}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onBook}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-semibold text-primary-foreground transition hover:opacity-90 active:scale-95"
            >
              Забронировать <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
