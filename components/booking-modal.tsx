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
  Flame,
} from "lucide-react"
import type { BusyRange } from "@/app/api/availability/route"
import { todayKey } from "@/lib/date"
import { spaSurcharge } from "@/lib/site"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type BookingPrefill = {
  arrival?: string
  departure?: string
  guests?: string
}

type Props = {
  open: boolean
  onClose: () => void
  /** Даты и гости, выбранные на странице бронирования до открытия модалки. */
  prefill?: BookingPrefill
}

type FormState = {
  arrival: string   // YYYY-MM-DD
  departure: string // YYYY-MM-DD
  guests: string
  /** Сколько топок бани с чаном заказал гость. 0 — не нужна. */
  spaSessions: number
  name: string
  phone: string
  email: string
}

const emptyForm: FormState = {
  arrival: "",
  departure: "",
  guests: "2",
  spaSessions: 0,
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
  // локальный день — toISOString() дал бы вчерашнюю дату для МСК ночью
  return todayKey()
}

/**
 * Is the YYYY-MM-DD date blocked for *arrival*?
 * The start date of a busy range is excluded — it's the next guest's check-in
 * day, but since they arrive in the evening we can check out that morning.
 */
function isBusy(date: string, ranges: BusyRange[]): boolean {
  return ranges.some((r) => date > r.start && date < r.end)
}

/**
 * Is the date blocked even as a checkout day?
 * Only dates strictly inside a busy range are hard-blocked.
 * r.start days are allowed as departure (checkout before evening check-in).
 */
function isBusyForCheckout(date: string, ranges: BusyRange[]): boolean {
  return ranges.some((r) => date > r.start && date < r.end)
}

/** Does [arrival, departure) overlap any busy range? */
function selectionOverlapsBusy(arrival: string, departure: string, ranges: BusyRange[]): boolean {
  // departure can land on r.start (checkout morning, checkin evening — no overlap)
  return ranges.some((r) => arrival < r.end && departure > r.start && departure !== r.start)
}

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

type SeasonalPrice = {
  date_from: string  // MM-DD
  date_to: string    // MM-DD
  base_price: number
  weekend_price: number
  active: boolean
}

type AppSettings = {
  base_price: number
  weekend_price: number
  extra_guest_price: number
  cleaning_fee: number
  minimum_nights: number
  base_guests: number
  max_guests: number
  price_mode: string
}

/** Returns true if the given Date is Fri/Sat (weekend pricing). */
function isWeekendNight(d: Date): boolean {
  const day = d.getDay()
  return day === 5 || day === 6
}

/** Width of a season in days (for priority: narrower = higher priority) */
function seasonWidth(from: string, to: string): number {
  const [fm, fd] = from.split("-").map(Number)
  const [tm, td] = to.split("-").map(Number)
  const fromDay = fm * 31 + fd
  const toDay = tm * 31 + td
  return toDay >= fromDay ? toDay - fromDay : (12 * 31 + 31) - fromDay + toDay
}

function getSeasonalNightPrice(
  d: Date,
  seasons: SeasonalPrice[],
  fallbackBase: number,
  fallbackWeekend: number,
): number {
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  const key = `${mm}-${dd}`

  // Sort by narrowest range first — most specific season wins
  const sorted = [...seasons].sort(
    (a, b) => seasonWidth(a.date_from, a.date_to) - seasonWidth(b.date_from, b.date_to)
  )

  for (const s of sorted) {
    const from = s.date_from
    const to = s.date_to
    const inRange = from <= to ? key >= from && key <= to : key >= from || key <= to
    if (inRange) return isWeekendNight(d) ? s.weekend_price : s.base_price
  }
  return isWeekendNight(d) ? fallbackWeekend : fallbackBase
}

interface NightLine {
  label: string
  price: number
  count: number
}

interface PriceBreakdown {
  nights: number
  lines: NightLine[]
  subtotal: number
  extraGuestFee: number
  cleaningFee: number
  spaFee: number
  total: number
}

/** Calculate total price for the stay [arrival, departure) with seasons and guests. */
function calculatePrice(
  arrival: string,
  departure: string,
  settings: AppSettings,
  seasons: SeasonalPrice[],
  guests = 1,
  spaSessions = 0,
): PriceBreakdown | null {
  if (!arrival || !departure || departure <= arrival) return null
  const start = new Date(arrival)
  const end = new Date(departure)
  const nights = Math.round((end.getTime() - start.getTime()) / 86_400_000)

  // Accumulate per-night prices, group into lines
  const nightPrices: number[] = []
  for (let i = 0; i < nights; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    nightPrices.push(
      getSeasonalNightPrice(d, seasons, settings.base_price, settings.weekend_price)
    )
  }

  // Group consecutive nights with the same price
  const lines: NightLine[] = []
  for (const p of nightPrices) {
    const last = lines[lines.length - 1]
    if (last && last.price === p) {
      last.count++
    } else {
      lines.push({ label: "", price: p, count: 1 })
    }
  }
  // Build human labels
  lines.forEach((l) => {
    l.label = `${l.count} ${l.count === 1 ? "ночь" : l.count < 5 ? "ночи" : "ночей"} × ${formatRub(l.price)}`
  })

  const subtotal = nightPrices.reduce((s, p) => s + p, 0)
  const extraGuests = Math.max(0, guests - (settings.base_guests ?? 8))
  const extraGuestFee = extraGuests * nights * (settings.extra_guest_price ?? 0)
  const cleaningFee = settings.cleaning_fee ?? 0
  const spaFee = Math.max(0, spaSessions) * spaSurcharge.price
  const total = subtotal + extraGuestFee + cleaningFee + spaFee

  return { nights, lines, subtotal, extraGuestFee, cleaningFee, spaFee, total }
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

  /**
   * Is this day a "checkout-only" transition day?
   * True only when it is the start of a busy range AND is NOT inside any other
   * busy range. If two bookings are back-to-back with no gap the end of one
   * range equals the start of the next, so that day stays fully blocked.
   */
  function isCheckoutOnlyTransition(iso: string | null): boolean {
    if (!iso) return false
    const isStart = busyRanges.some((r) => iso === r.start)
    if (!isStart) return false
    // Make sure this day is not inside another busy range
    const insideAnotherRange = busyRanges.some((r) => iso > r.start && iso < r.end)
    return !insideAnotherRange
  }

  function getDayStyle(iso: string | null): string {
    // 40px на телефоне — комфортная зона тапа (было 32px, палец промахивался)
    const base =
      "relative flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-full text-sm transition select-none overflow-hidden"
    if (!iso) return base + " invisible"
    const isToday = iso === todayIso
    const isPast = iso < todayIso
    const busy = isBusy(iso, busyRanges)
    const checkoutOnly = isCheckoutOnlyTransition(iso)
    const isArrival = iso === arrival
    const isDeparture = iso === departure
    const inRange = arrival && departure && iso > arrival && iso < departure

    if (isPast) {
      return base + " cursor-not-allowed text-muted-foreground/40"
    }
    if (busy) {
      // Нейтральный серый вместо красноватого: занято — это не ошибка,
      // и бордовые кружки выбивались из хвойно-латунной палитры.
      return base + " cursor-not-allowed text-muted-foreground/35 bg-muted/60 line-through"
    }
    if (isArrival || isDeparture) {
      return base + " cursor-pointer bg-primary text-primary-foreground font-semibold"
    }
    if (inRange) {
      return base + " cursor-pointer bg-primary/20 text-foreground rounded-none"
    }
    // Transition days: clickable only as departure, blocked as arrival
    if (checkoutOnly) {
      if (selecting === "departure" && arrival !== "" && iso > arrival) {
        return base + " cursor-pointer text-foreground"
      }
      return base + " cursor-not-allowed text-muted-foreground/40"
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
          className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
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
          className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
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
            disabled={
              !iso ||
              iso < todayIso ||
              isBusy(iso, busyRanges) ||
              // Transition days (r.start): blocked as arrival, allowed only as departure
              (isCheckoutOnlyTransition(iso) &&
                !(selecting === "departure" && arrival !== "" && iso > arrival))
            }
            onClick={() => iso && onDayClick(iso)}
            aria-label={iso ?? undefined}
            aria-pressed={iso === arrival || iso === departure}
            className={getDayStyle(iso)}
          >
                    {/* День пересменки: утро свободно, после 12:00 уже занято.
                        Закрашиваем именно вторую половину кружка — и тем же
                        нейтральным тоном, что «Занято», чтобы читалось как
                        «полдня занято», а не как ошибка. */}
                    {iso && isCheckoutOnlyTransition(iso) && (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-full"
                        style={{
                          background:
                            "linear-gradient(to right, transparent 50%, color-mix(in srgb, var(--muted) 85%, transparent) 50%)",
                        }}
                      />
            )}
            <span className="relative z-10">{iso ? parseInt(iso.slice(8), 10) : ""}</span>
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-border pt-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
              <span className="inline-block size-3 rounded-full bg-muted/60" />
              Занято
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block size-3 rounded-full"
              style={{ background: "linear-gradient(to right, transparent 50%, color-mix(in srgb, var(--muted) 85%, transparent) 50%)" }}
          />
          Выезд до 12:00
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
export function BookingModal({ open, onClose, prefill }: Props) {
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Settings + seasonal prices — loaded together with availability
  const [appSettings, setAppSettings] = useState<AppSettings>({
    base_price: 20_000,
    weekend_price: 24_000,
    extra_guest_price: 0,
    cleaning_fee: 0,
    minimum_nights: 1,
    base_guests: 8,
    max_guests: 15,
    price_mode: 'base',
  })
  const [seasonalPrices, setSeasonalPrices] = useState<SeasonalPrice[]>([])

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
      // Always show calendar — if ok, load busy ranges; if not, show warning but keep calendar open
      if (data.ok && Array.isArray(data.ranges)) {
        setBusyRanges(data.ranges)
      } else {
        setBusyRanges([])
        setAvailError("Занятые даты временно недоступны — уточните у нас перед бронированием.")
      }
      // Load settings + seasonal prices from the same response
      if (data.settings) setAppSettings(data.settings)
      if (Array.isArray(data.seasonalPrices)) setSeasonalPrices(data.seasonalPrices)
    } catch {
      setBusyRanges([])
      setAvailError("Занятые даты временно недоступны — уточните у нас перед бронированием.")
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

  // Подхватываем даты, выбранные на странице бронирования
  useEffect(() => {
    if (!open || !prefill) return
    const { arrival, departure, guests } = prefill
    if (!arrival && !departure && !guests) return

    setForm((f) => ({
      ...f,
      arrival: arrival ?? f.arrival,
      departure: departure ?? f.departure,
      guests: guests ?? f.guests,
    }))
    setSelecting(arrival && !departure ? "departure" : "arrival")

    if (arrival) {
      const [y, m] = arrival.split("-").map(Number)
      if (y && m) {
        setCalYear(y)
        setCalMonth(m - 1)
      }
    }
  }, [open, prefill])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

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

      <div className="relative z-10 flex max-h-[94svh] w-full flex-col overflow-hidden rounded-t-2xl bg-card shadow-2xl sm:max-h-[92dvh] sm:max-w-lg sm:rounded-2xl">
        {/* Header — остаётся на месте при прокрутке формы */}
        <div className="relative flex shrink-0 items-start justify-between gap-3 border-b border-border bg-secondary px-4 py-4 text-foreground sm:px-6 sm:py-5">
          {/* латунная нить вместо плотной заливки — акцент, а не пятно */}
          <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-accent/70" />
          <div>
            <p className="eyebrow text-accent">Усадьба в Антропково</p>
            <p className="mt-2 font-display text-xl font-semibold leading-tight sm:text-2xl">
              Бронирование усадьбы
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Закрыть форму"
            className="-mr-1 flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-4 overflow-y-auto px-5 py-10 pb-safe text-center sm:px-6 sm:py-12">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Check className="size-8" />
            </div>
            <h3 className="font-display text-2xl text-foreground">Заявка отправлена!</h3>
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
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            {/* Steps indicator */}
            <div className="flex shrink-0 items-center gap-2 px-4 pt-4 sm:gap-3 sm:px-6 sm:pt-5">
              <StepDot index={1} label="Даты и гости" active={step === 1} done={step === 2} />
              <div className="h-px flex-1 bg-border" />
              <StepDot index={2} label="Ваши контакты" active={step === 2} done={false} />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-4 sm:px-6 sm:pt-5">
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
                    <div className="flex items-start justify-between gap-2 rounded-lg bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                        <span>{availError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={fetchAvailability}
                        className="shrink-0 text-xs underline underline-offset-2 hover:no-underline"
                      >
                        Повторить
                      </button>
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

                  {/* Guests */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Количество гостей
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => update("guests", String(Math.max(1, Number(form.guests || 1) - 1)))}
                        className="flex size-11 shrink-0 items-center justify-center rounded-full border border-input bg-background text-lg font-bold transition-colors hover:bg-muted"
                        aria-label="Уменьшить"
                      >−</button>
                      <input
                        type="number"
                        min={1}
                        max={appSettings.max_guests}
                        value={form.guests === "" ? "" : form.guests}
                        placeholder="2"
                        onChange={(e) => {
                          const v = e.target.value
                          if (v === "") { update("guests", ""); return }
                          const n = Math.min(appSettings.max_guests, Math.max(1, Number(v) || 1))
                          update("guests", String(n))
                        }}
                        className="w-16 rounded-lg border border-input bg-background py-2 text-center text-lg font-medium text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => update("guests", String(Math.min(appSettings.max_guests, Number(form.guests || 1) + 1)))}
                        className="flex size-11 shrink-0 items-center justify-center rounded-full border border-input bg-background text-lg font-bold transition-colors hover:bg-muted"
                        aria-label="Увеличить"
                      >+</button>
                      <span className="text-xs text-muted-foreground">макс. {appSettings.max_guests}</span>
                    </div>
                    {Number(form.guests) > appSettings.base_guests && appSettings.extra_guest_price > 0 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        + {appSettings.extra_guest_price.toLocaleString("ru-RU")} ₽/гость/ночь за {Number(form.guests) - appSettings.base_guests} доп. {Number(form.guests) - appSettings.base_guests === 1 ? "гостя" : "гостей"}
                      </p>
                    )}
                  </div>

                  {/* Баня и чан — допуслуга, предлагаем сразу при брони */}
                  <div className="flex flex-col gap-3 rounded-xl border border-border bg-secondary/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-col gap-1">
                        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Flame className="size-4 shrink-0 text-primary" />
                          Баня и чан
                        </span>
                        <span className="text-xs leading-relaxed text-muted-foreground">
                          {spaSurcharge.priceLabel} {spaSurcharge.unit}. Дрова, веники и полотенца
                          включены — протопим к вашему часу.
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => update("spaSessions", Math.max(0, form.spaSessions - 1))}
                          disabled={form.spaSessions === 0}
                          className="flex size-11 items-center justify-center rounded-full border border-input bg-background text-lg font-bold transition-colors hover:bg-muted disabled:opacity-40"
                          aria-label="Убрать топку"
                        >−</button>
                        <span
                          className="w-6 text-center text-lg font-semibold text-foreground tabular-nums"
                          aria-live="polite"
                        >
                          {form.spaSessions}
                        </span>
                        <button
                          type="button"
                          onClick={() => update("spaSessions", Math.min(20, form.spaSessions + 1))}
                          className="flex size-11 items-center justify-center rounded-full border border-input bg-background text-lg font-bold transition-colors hover:bg-muted"
                          aria-label="Добавить топку"
                        >+</button>
                      </div>
                    </div>
                    {form.spaSessions === 0 ? (
                      <button
                        type="button"
                        onClick={() => update("spaSessions", 1)}
                        className="inline-flex min-h-11 items-center self-start rounded-full bg-primary/15 px-4 text-xs font-medium text-primary transition hover:bg-primary/25"
                      >
                        Добавить к брони
                      </button>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {form.spaSessions} {form.spaSessions === 1 ? "топка" : form.spaSessions < 5 ? "топки" : "топок"} ·{" "}
                        <span className="font-medium text-foreground">
                          {formatRub(form.spaSessions * spaSurcharge.price)}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Price breakdown */}
                  {(() => {
                    const guestsNum = Number(form.guests) || 1
                    const price = calculatePrice(form.arrival, form.departure, appSettings, appSettings.price_mode === 'seasonal' ? seasonalPrices : [], guestsNum, form.spaSessions)
                    if (!price) return null
                    return (
                      <div className="rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm">
                        <div className="mb-2 font-medium text-foreground">
                          Стоимость проживания
                          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                            до {appSettings.base_guests} без доплаты, макс. {appSettings.max_guests}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 text-muted-foreground">
                          {price.lines.map((line, i) => (
                            <div key={i} className="flex justify-between">
                              <span>{line.label}</span>
                              <span className="text-foreground">{formatRub(line.price * line.count)}</span>
                            </div>
                          ))}
                          {price.extraGuestFee > 0 && (
                            <div className="flex justify-between text-amber-600 dark:text-amber-400">
                              <span>Доп. гости ({guestsNum - appSettings.base_guests} чел.)</span>
                              <span>{formatRub(price.extraGuestFee)}</span>
                            </div>
                          )}
                          {price.cleaningFee > 0 && (
                            <div className="flex justify-between">
                              <span>Уборка</span>
                              <span className="text-foreground">{formatRub(price.cleaningFee)}</span>
                            </div>
                          )}
                          {price.spaFee > 0 && (
                            <div className="flex justify-between">
                              <span>
                                Баня и чан ({form.spaSessions}{" "}
                                {form.spaSessions === 1 ? "топка" : form.spaSessions < 5 ? "топки" : "топок"})
                              </span>
                              <span className="text-foreground">{formatRub(price.spaFee)}</span>
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

                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <Field
                    icon={<User className="size-4" />}
                    label="Ваше имя"
                    id="name"
                    placeholder="Иван Иванов"
                    autoComplete="name"
                    value={form.name}
                    onChange={(v) => update("name", v)}
                  />
                  <Field
                    icon={<Phone className="size-4" />}
                    label="Телефон"
                    id="phone"
                    placeholder="+7 (___) ___-__-__"
                    inputMode="tel"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(v) => update("phone", v)}
                  />
                  <Field
                    icon={<Mail className="size-4" />}
                    label="E-mail (необязательно)"
                    id="email"
                    placeholder="you@example.com"
                    inputMode="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(v) => update("email", v)}
                  />

                  <div className="mt-1 rounded-lg bg-secondary px-4 py-3 text-sm text-secondary-foreground">
                    <div>
                      Заезд <strong>{formatDate(form.arrival)}</strong> · Выезд{" "}
                      <strong>{formatDate(form.departure)}</strong> · Гостей{" "}
                      <strong>{form.guests}</strong>
                      {form.spaSessions > 0 && (
                        <>
                          {" · Баня и чан "}
                          <strong>
                            {form.spaSessions}{" "}
                            {form.spaSessions === 1 ? "топка" : form.spaSessions < 5 ? "топки" : "топок"}
                          </strong>
                        </>
                      )}
                    </div>
                    {(() => {
                      const price = calculatePrice(form.arrival, form.departure, appSettings, appSettings.price_mode === 'seasonal' ? seasonalPrices : [], Number(form.guests) || 1, form.spaSessions)
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

                </div>
              )}
            </div>

            {/* Закреплённая панель: итог и действие всегда под большим пальцем */}
            <div className="shrink-0 border-t border-border bg-card px-4 pb-safe pt-3 sm:px-6">
              {(() => {
                const price = calculatePrice(
                  form.arrival,
                  form.departure,
                  appSettings,
                  appSettings.price_mode === "seasonal" ? seasonalPrices : [],
                  Number(form.guests) || 1,
                  form.spaSessions,
                )
                return (
                  <div className="flex items-center gap-3 pb-3">
                    <div className="flex min-w-0 shrink-0 flex-col">
                      <span className="whitespace-nowrap text-xs text-muted-foreground">
                        {price
                          ? `${price.nights} ${price.nights === 1 ? "ночь" : price.nights < 5 ? "ночи" : "ночей"}${form.spaSessions > 0 ? ", баня" : ""}`
                          : "Выберите даты"}
                      </span>
                      <span className="font-display text-lg font-semibold leading-tight text-foreground">
                        {price ? formatRub(price.total) : "—"}
                      </span>
                    </div>
                    {step === 1 ? (
                      <button
                        type="submit"
                        disabled={!step1Valid || availLoading || !!availError}
                        className="ml-auto flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground transition hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                      >
                        Далее
                        <ArrowRight className="size-4" />
                      </button>
                    ) : (
                      <div className="ml-auto flex flex-1 items-center gap-2 sm:flex-none">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          disabled={loading}
                          className="flex min-h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-input bg-background px-3 font-medium text-foreground transition hover:bg-secondary disabled:opacity-40"
                        >
                          <ArrowLeft className="size-4" />
                          Назад
                        </button>
                        <button
                          type="submit"
                          disabled={!step2Valid || loading}
                          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-semibold text-primary-foreground transition hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {loading ? "Отправляем…" : "Забронировать"}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          </form>
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
    <div className="flex shrink-0 items-center gap-2">
      <span
        className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-medium transition ${
          active || done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
        }`}
      >
        {done ? <Check className="size-4" /> : index}
      </span>
      <span
        className={`whitespace-nowrap text-[13px] font-medium sm:text-sm ${active || done ? "text-foreground" : "text-muted-foreground"}`}
      >
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
  type = "text",
  autoComplete,
}: {
  icon: React.ReactNode
  label: string
  id: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  inputMode?: "numeric" | "tel" | "email" | "text"
  type?: "text" | "tel" | "email"
  autoComplete?: string
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
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-13 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-base text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </div>
    </div>
  )
}
