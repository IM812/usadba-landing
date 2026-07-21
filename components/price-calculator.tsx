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

  useEffect(() => {
    fetch("/api/availability")
      .then(r => r.json())
      .then(d => {
        if (d.blockedRanges) setBookedRanges(d.blockedRanges)
        if (d.settings) setSettings(d.settings)
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

  const calcPrice = () => {
    if (!checkIn || !checkOut) return null
    const nights = daysBetween(checkIn, checkOut)
    let total = 0
    for (let i = 0; i < nights; i++) {
      const d = addDays(checkIn, i)
      total += isWeekend(d) ? settings.weekend_price : settings.base_price
    }
    total += settings.cleaning_fee
    return { nights, total }
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
              <span className="flex items-center gap-1.5"><span className="inline-block size-3 rounded-full bg-rose-200 dark:bg-rose-950" />Занято</span>
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
                <button onClick={() => setGuests(g => Math.max(1, g - 1))} className="flex size-9 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors text-lg font-bold">−</button>
                <span className="w-8 text-center text-xl font-serif text-foreground">{guests}</span>
                <button onClick={() => setGuests(g => Math.min(12, g + 1))} className="flex size-9 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors text-lg font-bold">+</button>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="flex-1 rounded-2xl border border-border bg-background p-5">
              {price ? (
                <>
                  <p className="text-sm font-semibold text-muted-foreground">Итого</p>
                  <p className="mt-1 font-serif text-4xl text-foreground">
                    {price.total.toLocaleString("ru-RU")} ₽
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{price.nights} {price.nights === 1 ? "ночь" : price.nights < 5 ? "ночи" : "ночей"}</p>
                  {settings.cleaning_fee > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">Включая уборку {settings.cleaning_fee.toLocaleString("ru-RU")} ₽</p>
                  )}
                  {price.nights >= 5 && (
                    <p className="mt-2 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">Скидка 10% при бронировании от 5 ночей</p>
                  )}
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
