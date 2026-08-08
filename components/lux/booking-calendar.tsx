"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react"

import { useBooking } from "@/components/lux/booking-provider"
import { LuxButton } from "@/components/lux/ui"
import { addDays, startOfToday, toDateKey } from "@/lib/date"
import {
  DEFAULT_SETTINGS,
  guestsWord,
  isDayBusy,
  isRangeFree,
  money,
  nightsWord,
  quoteStay,
  type AvailabilitySettings,
  type BusyRange,
  type SeasonalPrice,
} from "@/lib/availability"

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
]
const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const longDate = (d: Date) =>
  d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })

function MonthGrid({
  year,
  month,
  today,
  checkIn,
  checkOut,
  ranges,
  onPick,
}: {
  year: number
  month: number
  today: Date
  checkIn: Date | null
  checkOut: Date | null
  ranges: BusyRange[]
  onPick: (d: Date) => void
}) {
  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const offset = (first.getDay() + 6) % 7

  const cells: (Date | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ]

  return (
    <div>
      <p className="mb-5 text-center font-serif text-xl font-light text-foreground">
        {MONTHS[month]} <span className="text-muted-foreground">{year}</span>
      </p>

      <div className="grid grid-cols-7 gap-y-1">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="pb-2 text-center text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
          >
            {w}
          </div>
        ))}

        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />

          const key = toDateKey(d)
          const past = d < today
          const busy = isDayBusy(key, ranges)
          const isIn = checkIn && toDateKey(checkIn) === key
          const isOut = checkOut && toDateKey(checkOut) === key
          const inRange = checkIn && checkOut && d > checkIn && d < checkOut
          const disabled = past || busy

          return (
            <div
              key={key}
              className={
                inRange ? "bg-accent/12" : isIn ? "rounded-l-full bg-accent/12" : isOut ? "rounded-r-full bg-accent/12" : ""
              }
            >
              <button
                type="button"
                onClick={() => onPick(d)}
                disabled={disabled}
                aria-label={`${longDate(d)}${busy ? " — занято" : ""}`}
                aria-pressed={Boolean(isIn || isOut)}
                className={[
                  "relative flex aspect-square w-full items-center justify-center rounded-full text-sm transition-colors duration-200",
                  isIn || isOut
                    ? "bg-accent font-medium text-accent-foreground"
                    : busy
                      ? "cursor-not-allowed text-muted-foreground/35 line-through"
                      : past
                        ? "cursor-not-allowed text-muted-foreground/25"
                        : "text-foreground/85 hover:bg-accent/20 hover:text-foreground",
                ].join(" ")}
              >
                {d.getDate()}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function BookingCalendar() {
  const { openBooking } = useBooking()
  const today = useMemo(() => startOfToday(), [])

  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [guests, setGuests] = useState(DEFAULT_SETTINGS.base_guests)
  const [twoMonths, setTwoMonths] = useState(false)

  const { data, isLoading } = useSWR("/api/availability", fetcher, {
    revalidateOnFocus: false,
  })

  const ranges: BusyRange[] = useMemo(
    () => (Array.isArray(data?.ranges) ? data.ranges : []),
    [data],
  )
  const settings: AvailabilitySettings = useMemo(
    () => ({ ...DEFAULT_SETTINGS, ...(data?.settings ?? {}) }),
    [data],
  )
  const seasons: SeasonalPrice[] = useMemo(
    () => (Array.isArray(data?.seasonalPrices) ? data.seasonalPrices : []),
    [data],
  )

  // Базовое размещение как стартовое число гостей, когда настройки загрузились
  useEffect(() => {
    setGuests((g) => (g === DEFAULT_SETTINGS.base_guests ? settings.base_guests : g))
  }, [settings.base_guests])

  // Второй месяц показываем только когда для него есть место
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)")
    const sync = () => setTwoMonths(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  const pick = useCallback(
    (d: Date) => {
      if (!checkIn || checkOut) {
        setCheckIn(d)
        setCheckOut(null)
        return
      }
      if (d <= checkIn) {
        setCheckIn(d)
        setCheckOut(null)
        return
      }
      if (!isRangeFree(checkIn, d, ranges)) {
        setCheckIn(d)
        setCheckOut(null)
        return
      }
      setCheckOut(d)
    },
    [checkIn, checkOut, ranges],
  )

  const quote = useMemo(
    () => (checkIn && checkOut ? quoteStay(checkIn, checkOut, guests, seasons, settings) : null),
    [checkIn, checkOut, guests, seasons, settings],
  )

  const shift = (delta: number) =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1))

  const canGoBack =
    cursor.getFullYear() > today.getFullYear() ||
    (cursor.getFullYear() === today.getFullYear() && cursor.getMonth() > today.getMonth())

  const secondMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)

  const submit = () => {
    openBooking({
      arrival: checkIn ? toDateKey(checkIn) : undefined,
      departure: checkOut ? toDateKey(checkOut) : undefined,
      guests: String(guests),
    })
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-16">
      {/* Календарь */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => shift(-1)}
            disabled={!canGoBack}
            aria-label="Предыдущий месяц"
            className="flex size-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-30 disabled:hover:border-border disabled:hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
          </button>

          <p className="eyebrow text-muted-foreground">Выберите даты</p>

          <button
            type="button"
            onClick={() => shift(1)}
            aria-label="Следующий месяц"
            className="flex size-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="grid gap-12 min-[900px]:grid-cols-2 min-[900px]:gap-10">
          <MonthGrid
            year={cursor.getFullYear()}
            month={cursor.getMonth()}
            today={today}
            checkIn={checkIn}
            checkOut={checkOut}
            ranges={ranges}
            onPick={pick}
          />
          {twoMonths ? (
            <MonthGrid
              year={secondMonth.getFullYear()}
              month={secondMonth.getMonth()}
              today={today}
              checkIn={checkIn}
              checkOut={checkOut}
              ranges={ranges}
              onPick={pick}
            />
          ) : null}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-6 text-[13px] text-muted-foreground">
          <span className="flex items-center gap-2">
            <span aria-hidden className="inline-block size-2.5 rounded-full bg-accent" />
            Ваши даты
          </span>
          <span className="flex items-center gap-2">
            <span aria-hidden className="inline-block size-2.5 rounded-full bg-accent/25" />
            Выбранный период
          </span>
          <span className="flex items-center gap-2">
            <span aria-hidden className="inline-block size-2.5 rounded-full bg-muted-foreground/30" />
            Занято
          </span>
          {isLoading ? <span className="text-muted-foreground/70">Загружаем календарь…</span> : null}
        </div>
      </div>

      {/* Сводка */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="surface-2 rounded-sm border border-border bg-card p-7">
          <p className="eyebrow text-accent">Ваша поездка</p>

          <dl className="mt-7 flex flex-col gap-5">
            <div className="flex items-baseline justify-between gap-4 border-b border-border pb-4">
              <dt className="text-[13px] uppercase tracking-[0.12em] text-muted-foreground">Заезд</dt>
              <dd className="font-serif text-lg font-light text-foreground">
                {checkIn ? longDate(checkIn) : "—"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-b border-border pb-4">
              <dt className="text-[13px] uppercase tracking-[0.12em] text-muted-foreground">Выезд</dt>
              <dd className="font-serif text-lg font-light text-foreground">
                {checkOut ? longDate(checkOut) : "—"}
              </dd>
            </div>
          </dl>

          {/* Гости */}
          <div className="mt-7">
            <p className="text-[13px] uppercase tracking-[0.12em] text-muted-foreground">Гостей</p>
            <div className="mt-3 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                aria-label="Меньше гостей"
                className="flex size-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                <Minus className="size-4" />
              </button>
              <span className="min-w-10 text-center font-serif text-3xl font-light text-foreground">
                {guests}
              </span>
              <button
                type="button"
                onClick={() => setGuests((g) => Math.min(settings.max_guests, g + 1))}
                aria-label="Больше гостей"
                className="flex size-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                <Plus className="size-4" />
              </button>
              <span className="text-[13px] text-muted-foreground">
                до {settings.max_guests}
              </span>
            </div>
          </div>

          {/* Расчёт */}
          <div className="mt-8 border-t border-border pt-7">
            {quote ? (
              <>
                <div className="flex flex-col gap-2.5 text-[13px] text-muted-foreground">
                  <div className="flex justify-between gap-4">
                    <span>
                      {quote.nights} {nightsWord(quote.nights)} проживания
                    </span>
                    <span className="text-foreground/90">{money(quote.nightsTotal)} ₽</span>
                  </div>
                  {quote.extraGuestFee > 0 ? (
                    <div className="flex justify-between gap-4">
                      <span>
                        {quote.extraGuests} {guestsWord(quote.extraGuests)} сверх {settings.base_guests}
                      </span>
                      <span className="text-foreground/90">{money(quote.extraGuestFee)} ₽</span>
                    </div>
                  ) : null}
                  {quote.cleaningFee > 0 ? (
                    <div className="flex justify-between gap-4">
                      <span>Уборка</span>
                      <span className="text-foreground/90">{money(quote.cleaningFee)} ₽</span>
                    </div>
                  ) : null}
                </div>

                <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-border pt-5">
                  <span className="text-[13px] uppercase tracking-[0.12em] text-muted-foreground">
                    Итого
                  </span>
                  <span className="font-serif text-4xl font-light text-accent">
                    {money(quote.total)} ₽
                  </span>
                </div>

                {quote.belowMinimum ? (
                  <p className="mt-4 text-[13px] leading-relaxed text-destructive">
                    Минимальный срок — {settings.minimum_nights} {nightsWord(settings.minimum_nights)}.
                    Выберите даты подольше или напишите нам.
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {checkIn
                  ? "Отметьте дату выезда — посчитаем точную сумму."
                  : "Отметьте дату заезда на календаре, и мы посчитаем стоимость."}
              </p>
            )}
          </div>

          <LuxButton onClick={submit} className="mt-8 w-full">
            {quote ? "Отправить заявку" : "Написать нам"}
          </LuxButton>

          <p className="mt-5 text-[12px] leading-relaxed text-muted-foreground">
            Заявка ни к чему не обязывает: мы подтвердим даты и пришлём условия, оплата — после
            согласования.
          </p>
        </div>
      </aside>
    </div>
  )
}
