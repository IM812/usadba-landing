"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { X, CalendarDays, LogOut, Users, User, Phone, Mail, Check, ArrowRight, ArrowLeft } from "lucide-react"
// LogOut is used as the departure icon passed to DateField

type Props = {
  open: boolean
  onClose: () => void
}

type FormState = {
  arrival: string
  departure: string
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

// Format YYYY-MM-DD (native date value) to DD.MM.YYYY for display.
function formatDate(iso: string) {
  if (!iso) return ""
  const [y, m, d] = iso.split("-")
  return `${d}.${m}.${y}`
}

// Today in YYYY-MM-DD for the min attribute.
const today = new Date().toISOString().split("T")[0]

export function BookingModal({ open, onClose }: Props) {
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  const update = (key: keyof FormState, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const step1Valid = form.arrival !== "" && form.departure !== "" && form.departure > form.arrival && form.guests !== ""
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
  }

  const close = () => {
    onClose()
    // Reset shortly after so the closing animation isn't jarring.
    setTimeout(reset, 200)
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
              Спасибо, {form.name.trim() || "гость"}! Мы свяжемся с вами по номеру {form.phone} для подтверждения
              бронирования с {formatDate(form.arrival)} по {formatDate(form.departure)}.
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
                  <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:grid-cols-2">
                    <DateField
                      icon={<CalendarDays className="size-4" />}
                      label="Дата заезда"
                      id="arrival"
                      value={form.arrival}
                      min={today}
                      onChange={(v) => {
                        update("arrival", v)
                        // Reset departure if it's now before arrival
                        if (form.departure && form.departure <= v) update("departure", "")
                      }}
                    />
                    <DateField
                      icon={<LogOut className="size-4" />}
                      label="Дата выезда"
                      id="departure"
                      value={form.departure}
                      min={form.arrival || today}
                      onChange={(v) => update("departure", v)}
                    />
                  </div>

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
                    disabled={!step1Valid}
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
                    Заезд <strong>{formatDate(form.arrival)}</strong> · Выезд <strong>{formatDate(form.departure)}</strong> · Гостей{" "}
                    <strong>{form.guests}</strong>
                  </div>

                  {error && (
                    <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
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

function DateField({
  icon,
  label,
  id,
  value,
  min,
  onChange,
}: {
  icon: React.ReactNode
  label: string
  id: string
  value: string
  min?: string
  onChange: (value: string) => void
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
          type="date"
          id={id}
          lang="ru"
          value={value}
          min={min}
          onChange={(e) => onChange(e.target.value)}
          className="w-full cursor-pointer rounded-lg border border-input bg-background py-3 pl-9 pr-3 text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
        />
      </div>
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
