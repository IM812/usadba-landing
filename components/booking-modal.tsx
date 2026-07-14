"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import {
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  User,
  Phone,
  Mail,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import type { BusyRange } from "@/app/api/availability/route"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Props = {
  open: boolean
  onClose: () => void
}

type FormState = {
  arrival: string   // YYYY-MM-DD
  departure: string // YYYY-MM-DD
  guests: string
  name: string
  phone: string
  email: string
}

const emptyForm: FormState = {
  arrival: "",
  departure: "",
  guests: "",
  name: "",
  phone: "",
  email: "",
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDate(iso: string) {
  if (!iso) return ""
  const [y, m, d] = iso.split("-")
  return `${d}.${m}.${y}`
}

function toISO(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function today(): string {
  return new Date().toISOString().split("T")[0]
}

/** Is the YYYY-MM-DD date covered by any busy range? */
function isBusy(date: string, ranges: BusyRange[]): boolean {
  return ranges.some((r) => date >= r.start && date < r.end)
}

/** Does [arrival, departure) overlap any busy range? */
function selectionOverlapsBusy(arrival: string, departure: string, ranges: BusyRange[]): boolean {
  return ranges.some((r) => arrival < r.end && departure > r.start)
}

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------
const PRICE_WEEKEND = 24_000 // пт, сб, вс
const PRICE_WEEKDAY = 20_000 // пн–чт

/** Returns true if the given YYYY-MM-DD is Fri/Sat/Sun (weekend pricing). */
function isWeekendNight(iso: string): boolean {
  const day = new Date(iso).getDay() // 0=Sun,1=Mon...5=Fri,6=Sat
  return day === 5 || day === 6 || day === 0
}

interface PriceBreakdown {
  nights: number
  weekendNights: number
  weekdayNights: number
  total: number
}

/** Calculate total price for the stay [arrival, departure). */
function calculatePrice(arrival: string, departure: string): PriceBreakdown | null {
  if (!arrival || !departure || departure <= arrival) return null
  const start = new Date(arrival)
  const end = new Date(departure)
  const nights = Math.round((end.getTime() - start.getTime()) / 86_400_000)
  let weekendNights = 0
  for (let i = 0; i < nights; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    const iso = d.toISOString().split("T")[0]
    if (isWeekendNight(iso)) weekendNights++
  }
  const weekdayNights = nights - weekendNights
  const total = weekendNights * PRICE_WEEKEND + weekdayNights * PRICE_WEEKDAY
  return { nights, weekendNights, weekdayNights, total }
}

function formatRub(n: number): string {
  return n.toLocaleString("ru-RU") + " ₽"
}

const MONTH_NAMES_RU = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
]
const DAY_NAMES_RU = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]

// ---------------------------------------------------------------------------
// Mini inline calendar
// ---------------------------------------------------------------------------
interface CalendarProps {
  year: number
  month: number
  arrival: string
  departure: string
  busyRanges: BusyRange[]
  selecting: "arrival" | "departure"
  onDayClick: (iso: string) => void
  onPrev: () => void
  onNext: () => void
}

function Calendar({
  year,
  month,
  arrival,
  departure,
  busyRanges,
  selecting,
  onDayClick,
  onPrev,
  onNext,
}: CalendarProps) {
  const todayIso = today()
  const firstDay = new Date(year, month, 1).getDay() // 0=Sun..6=Sat → convert to Mon-based
  const offset = (firstDay + 6) % 7 // days to pad before 1st
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (string | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toISO(year, month, i + 1)),
  ]

  function getDayStyle(iso: string | null): string {
    const base =
      "relative flex h-8 w-8 items-center justify-center rounded-full text-sm transition select-none"
    if (!iso) return base + " invisible"
    const isToday = iso === todayIso
    const isPast = iso < todayIso
    const busy = isBusy(iso, busyRanges)
    const isArrival = iso === arrival
    const isDeparture = iso === departure
    const inRange = arrival && departure && iso > arrival && iso < departure

    if (isPast || busy) {
      return (
        base +
        " cursor-not-allowed text-muted-foreground/40" +
        (busy ? " bg-destructive/10 line-through" : "")
      )
    }
    if (isArrival || isDeparture) {
      return base + " cursor-pointer bg-primary text-primary-foreground font-semibold"
    }
    if (inRange) {
      return base + " cursor-pointer bg-primary/20 text-foreground rounded-none"
    }
    return (
      base +
      " cursor-pointer hover:bg-secondary text-foreground" +
      (isToday ? " ring-1 ring-primary/50 font-medium" : "")
    )
  }

  return (
    <div className="rounded-xl border border-border bg-background p-3">
      {/* Month navigation */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Предыдущий месяц"
          className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-medium text-foreground">
          {MONTH_NAMES_RU[month]} {year}
        </span>
        <button
          type="button"
          onClick={onNext}
          aria-label="Следующий месяц"
          className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="mb-1 grid grid-cols-7 gap-0.5">
        {DAY_NAMES_RU.map((d) => (
          <div key={d} className="flex h-7 items-center justify-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((iso, i) => (
          <button
            key={i}
            type="button"
            disabled={!iso || iso < todayIso || isBusy(iso, busyRanges)}
            onClick={() => iso && onDayClick(iso)}
            aria-label={iso ?? undefined}
            aria-pressed={iso === arrival || iso === departure}
            className={getDayStyle(iso)}
          >
            {iso ? parseInt(iso.slice(8), 10) : ""}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center gap-3 border-t border-border pt-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block size-3 rounded-full bg-destructive/20" />
          Занято
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-3 rounded-full bg-primary/20" />
          Ваши даты
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main modal
// ---------------------------------------------------------------------------
export function BookingModal({ open, onClose }: Props) {
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calendar state
  const now = new Date()
  const [calYear, setCalYear] = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth())
  const [selecting, setSelecting] = useState<"arrival" | "departure">("arrival")

  // Availability
  const [busyRanges, setBusyRanges] = useState<BusyRange[]>([])
  const [availLoading, setAvailLoading] = useState(false)
  const [availError, setAvailError] = useState<string | null>(null)

  // Fetch availability when the modal opens
  const fetchAvailability = useCallback(async () => {
    setAvailLoading(true)
    setAvailError(null)
    try {
      const res = await fetch("/api/availability")
      const data = await res.json()
      if (data.ok) {
        setBusyRanges(data.ranges)
      } else {
        setAvailError("Временно не удалось проверить доступность дат.")
      }
    } catch {
      setAvailError("Временно не удалось проверить доступность дат.")
    } finally {
      setAvailLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
      fetchAvailability()
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open, fetchAvailability])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  const update = (key: keyof FormState, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleDayClick = (iso: string) => {
    if (selecting === "arrival") {
      update("arrival", iso)
      update("departure", "")
      setSelecting("departure")
    } else {
      // departure must be after arrival
      if (!form.arrival || iso <= form.arrival) {
        // clicked before arrival — restart
        update("arrival", iso)
        update("departure", "")
        return
      }
      // check that the range doesn't overlap any busy period
      if (selectionOverlapsBusy(form.arrival, iso, busyRanges)) {
        // find the latest boundary before first busy date after arrival
        update("departure", "")
        return
      }
      update("departure", iso)
      setSelecting("arrival") // ready for next booking cycle
    }
  }

  const step1Valid =
    form.arrival !== "" &&
    form.departure !== "" &&
    form.departure > form.arrival &&
    form.guests !== "" &&
    !selectionOverlapsBusy(form.arrival, form.departure, busyRanges)

  const step2Valid = form.name.trim() !== "" && form.phone.trim().length >= 6

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      if (step1Valid) setStep(2)
      return
    }
    if (!step2Valid) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.status === 503) {
        setError(
          "Не удалось проверить актуальность дат. Пожалуйста, свяжитесь с нами по тел. +7 (995) 155-88-42."
        )
        return
      }
      if (res.status === 409) {
        setError("Выбранные даты уже заняты. Пожалуйста, выберите другой период.")
        setStep(1)
        return
      }
      if (!res.ok) throw new Error("server_error")
      setSubmitted(true)
    } catch {
      setError("Не удалось отправить заявку. Позвоните нам: +7 (995) 155-88-42")
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setStep(1)
    setForm(emptyForm)
    setSubmitted(false)
    setSelecting("arrival")
  }

  const close = () => {
    onClose()
    setTimeout(reset, 200)
  }

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11)
      setCalYear((y) => y - 1)
    } else {
      setCalMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0)
      setCalYear((y) => y + 1)
    } else {
      setCalMonth((m) => m + 1)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Форма бронирования"
    >
      <button
        type="button"
        aria-label="Закрыть"
        onClick={close}
        className="absolute inset-0 h-full w-full cursor-default bg-foreground/60 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-h-[92dvh] overflow-y-auto rounded-t-2xl bg-card shadow-2xl sm:max-w-lg sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border bg-primary px-6 py-5 text-primary-foreground">
          <div>
            <p className="font-serif text-2xl leading-tight">Бронирование усадьбы</p>
            <p className="mt-1 text-sm text-primary-foreground/80">Усадьба в Антропково</p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Закрыть форму"
            className="rounded-full p-1.5 text-primary-foreground/80 transition hover:bg-primary-foreground/15 hover:text-primary-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Check className="size-8" />
            </div>
            <h3 className="font-serif text-2xl text-foreground">Заявка отправлена!</h3>
            <p className="max-w-sm text-pretty text-muted-foreground leading-relaxed">
              Спасибо, {form.name.trim() || "гость"}! Мы свяжемся с вами по номеру {form.phone}{" "}
              для подтверждения бронирования с {formatDate(form.arrival)} по{" "}
              {formatDate(form.departure)}.
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-2 rounded-lg bg-primary px-6 py-2.5 font-medium text-primary-foreground transition hover:opacity-90"
            >
              Готово
            </button>
          </div>
        ) : (
          <>
            {/* Steps indicator */}
            <div className="flex items-center gap-3 px-6 pt-5">
              <StepDot index={1} label="Даты и гости" active={step === 1} done={step === 2} />
              <div className="h-px flex-1 bg-border" />
              <StepDot index={2} label="Ваши контакты" active={step === 2} done={false} />
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-6 pt-5">
              {step === 1 ? (
                <div className="flex flex-col gap-4">
                  {/* Availability status */}
                  {availLoading && (
                    <div className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" />
                      Загружаем доступность дат…
                    </div>
                  )}
                  {availError && !availLoading && (
                    <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                      <span>{availError} Выбор дат недоступен — позвоните нам напрямую.</span>
                    </div>
                  )}

                  {/* Prompt label */}
                  <div className="text-sm font-medium text-foreground">
                    {selecting === "arrival"
                      ? "Выберите дату заезда"
                      : form.arrival
                      ? `Заезд: ${formatDate(form.arrival)} — выберите дату выезда`
                      : "Выберите дату заезда"}
                  </div>

                  {/* Inline calendar */}
                  <Calendar
                    year={calYear}
                    month={calMonth}
                    arrival={form.arrival}
                    departure={form.departure}
                    busyRanges={busyRanges}
                    selecting={selecting}
                    onDayClick={handleDayClick}
                    onPrev={prevMonth}
                    onNext={nextMonth}
                  />

                  {/* Selected range summary */}
                  {form.arrival && (
                    <div className="flex items-center justify-between rounded-lg bg-secondary px-4 py-2.5 text-sm text-secondary-foreground">
                      <span>
                        {form.departure
                          ? `${formatDate(form.arrival)} — ${formatDate(form.departure)}`
                          : `С ${formatDate(form.arrival)}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          update("arrival", "")
                          update("departure", "")
                          setSelecting("arrival")
                        }}
                        className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                      >
                        Сбросить
                      </button>
                    </div>
                  )}

                  {/* Price breakdown */}
                  {(() => {
                    const price = calculatePrice(form.arrival, form.departure)
                    if (!price) return null
                    return (
                      <div className="rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm">
                        <div className="mb-2 font-medium text-foreground">Стоимость проживания</div>
                        <div className="flex flex-col gap-1 text-muted-foreground">
                          {price.weekendNights > 0 && (
                            <div className="flex justify-between">
                              <span>Выходные · {price.weekendNights} ночь/и × {formatRub(PRICE_WEEKEND)}</span>
                              <span className="text-foreground">{formatRub(price.weekendNights * PRICE_WEEKEND)}</span>
                            </div>
                          )}
                          {price.weekdayNights > 0 && (
                            <div className="flex justify-between">
                              <span>Будни · {price.weekdayNights} ночь/и × {formatRub(PRICE_WEEKDAY)}</span>
                              <span className="text-foreground">{formatRub(price.weekdayNights * PRICE_WEEKDAY)}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold text-foreground">
                          <span>Итого за {price.nights} {price.nights === 1 ? "ночь" : price.nights < 5 ? "ночи" : "ночей"}</span>
                          <span className="text-primary">{formatRub(price.total)}</span>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Guests */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="guests" className="text-sm font-medium text-foreground">
                      Количество гостей
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Users className="size-4" />
                      </span>
                      <select
                        id="guests"
                        value={form.guests}
                        onChange={(e) => update("guests", e.target.value)}
                        className="w-full appearance-none rounded-lg border border-input bg-background py-3 pl-9 pr-3 text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                      >
                        <option value="" disabled>
                          Выберите количество
                        </option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? "гость" : n < 5 ? "гостя" : "гостей"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!step1Valid || availLoading || !!availError}
                    className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Далее
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <Field
                    icon={<User className="size-4" />}
                    label="Ваше имя"
                    id="name"
                    placeholder="Иван Иванов"
                    value={form.name}
                    onChange={(v) => update("name", v)}
                  />
                  <Field
                    icon={<Phone className="size-4" />}
                    label="Телефон"
                    id="phone"
                    placeholder="+7 (___) ___-__-__"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(v) => update("phone", v)}
                  />
                  <Field
                    icon={<Mail className="size-4" />}
                    label="E-mail (необязательно)"
                    id="email"
                    placeholder="you@example.com"
                    inputMode="email"
                    value={form.email}
                    onChange={(v) => update("email", v)}
                  />

                  <div className="mt-1 rounded-lg bg-secondary px-4 py-3 text-sm text-secondary-foreground">
                    <div>
                      Заезд <strong>{formatDate(form.arrival)}</strong> · Выезд{" "}
                      <strong>{formatDate(form.departure)}</strong> · Гостей{" "}
                      <strong>{form.guests}</strong>
                    </div>
                    {(() => {
                      const price = calculatePrice(form.arrival, form.departure)
                      if (!price) return null
                      return (
                        <div className="mt-1 border-t border-border/50 pt-1 font-medium text-foreground">
                          Итого: <span className="text-primary">{formatRub(price.total)}</span>
                          <span className="ml-1 font-normal text-muted-foreground">
                            ({price.nights} {price.nights === 1 ? "ночь" : price.nights < 5 ? "ночи" : "ночей"})
                          </span>
                        </div>
                      )
                    })()}
                  </div>

                  {error && (
                    <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      {error}
                    </p>
                  )}

                  <div className="mt-1 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-5 py-3 font-medium text-foreground transition hover:bg-secondary disabled:opacity-40"
                    >
                      <ArrowLeft className="size-4" />
                      Назад
                    </button>
                    <button
                      type="submit"
                      disabled={!step2Valid || loading}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {loading ? "Отправляем..." : "Забронировать"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function StepDot({
  index,
  label,
  active,
  done,
}: {
  index: number
  label: string
  active: boolean
  done: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex size-7 items-center justify-center rounded-full text-sm font-medium transition ${
          active || done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
        }`}
      >
        {done ? <Check className="size-4" /> : index}
      </span>
      <span className={`text-sm font-medium ${active || done ? "text-foreground" : "text-muted-foreground"}`}>
        {label}
      </span>
    </div>
  )
}

function Field({
  icon,
  label,
  id,
  placeholder,
  value,
  onChange,
  inputMode,
}: {
  icon: React.ReactNode
  label: string
  id: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  inputMode?: "numeric" | "tel" | "email" | "text"
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        <input
          id={id}
          value={value}
          inputMode={inputMode}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-input bg-background py-3 pl-9 pr-3 text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </div>
    </div>
  )
}
