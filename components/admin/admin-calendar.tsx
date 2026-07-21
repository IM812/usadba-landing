'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Booking } from '@/lib/types'
import type { BusyRange } from '@/lib/ics'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const MONTHS_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
const DAYS_RU = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']

function toISO(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

function formatRub(n: number) {
  return n.toLocaleString('ru-RU') + ' ₽'
}

export function AdminCalendar() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selected, setSelected] = useState<Booking | null>(null)

  const { data: bookingsRes } = useSWR('/api/admin/bookings', fetcher, { refreshInterval: 30000 })
  const { data: availRes } = useSWR('/api/availability', fetcher, { refreshInterval: 300000 })

  const bookings: Booking[] = (bookingsRes?.data ?? []).filter(
    (b: Booking) => b.status !== 'cancelled',
  )
  const avitoRanges: BusyRange[] = (availRes?.ranges ?? []).filter((r: BusyRange) => {
    // ranges that don't match any confirmed booking are from Avito
    return !bookings.some(
      (b) => b.check_in === r.start && b.check_out === r.end,
    )
  })

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  const firstDay = new Date(year, month, 1).getDay()
  const offset = (firstDay + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (string | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toISO(year, month, i + 1)),
  ]

  function getBookingForDay(iso: string): Booking | null {
    return (
      bookings.find(
        (b) => iso >= b.check_in && iso < b.check_out,
      ) ?? null
    )
  }

  function isAvitoDay(iso: string): boolean {
    return avitoRanges.some((r) => iso >= r.start && iso < r.end)
  }

  function isCheckIn(iso: string): boolean {
    return bookings.some((b) => b.check_in === iso && b.status !== 'cancelled')
  }

  function isCheckOut(iso: string): boolean {
    return bookings.some((b) => b.check_out === iso && b.status !== 'cancelled')
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Календарь</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Все бронирования и занятость</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-green-500/20 border border-green-500/40 inline-block" />
          Подтверждено
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-amber-500/20 border border-amber-500/40 inline-block" />
          Ожидает
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-blue-500/20 border border-blue-500/40 inline-block" />
          Avito
        </span>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <button onClick={prevMonth} className="flex size-8 items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
            <ChevronLeft className="size-4" />
          </button>
          <h2 className="text-base font-semibold text-foreground">
            {MONTHS_RU[month]} {year}
          </h2>
          <button onClick={nextMonth} className="flex size-8 items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {DAYS_RU.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {cells.map((iso, i) => {
            if (!iso) return <div key={i} className="min-h-[72px] border-b border-r border-border/50 last:border-r-0" />

            const booking = getBookingForDay(iso)
            const isAvito = isAvitoDay(iso)
            const isToday = iso === today
            const isPast = iso < today
            const checkIn = isCheckIn(iso)
            const checkOut = isCheckOut(iso)

            const bgClass = booking
              ? booking.status === 'confirmed'
                ? 'bg-green-500/10'
                : 'bg-amber-500/10'
              : isAvito
              ? 'bg-blue-500/10'
              : ''

            return (
              <button
                key={iso}
                onClick={() => booking && setSelected(booking)}
                className={cn(
                  'min-h-[72px] p-1.5 border-b border-r border-border/50 text-left transition-colors',
                  (i + 1) % 7 === 0 && 'border-r-0',
                  booking && 'cursor-pointer hover:brightness-95',
                  !booking && !isAvito && 'cursor-default',
                  bgClass,
                  isPast && !booking && 'opacity-40',
                )}
              >
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full text-xs font-medium mb-1',
                    isToday ? 'bg-primary text-primary-foreground' : 'text-foreground',
                    isPast && 'text-muted-foreground',
                  )}
                >
                  {parseInt(iso.slice(8), 10)}
                </span>
                {checkIn && (
                  <span className="block text-[10px] leading-tight text-green-700 font-medium">
                    Заезд
                  </span>
                )}
                {checkOut && !checkIn && (
                  <span className="block text-[10px] leading-tight text-muted-foreground">
                    Выезд
                  </span>
                )}
                {isAvito && !booking && (
                  <span className="block text-[10px] leading-tight text-blue-600 font-medium">
                    Avito
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Booking detail popup */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Бронирование</h3>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <Row label="Гость" value={selected.guest_name} />
              <Row label="Телефон" value={selected.phone} />
              <Row label="Заезд" value={formatDate(selected.check_in)} />
              <Row label="Выезд" value={formatDate(selected.check_out)} />
              <Row label="Гостей" value={String(selected.guests_count)} />
              <Row label="Сумма" value={formatRub(selected.total_price)} />
              {selected.comment && <Row label="Комментарий" value={selected.comment} />}
            </div>
            <a
              href="/admin/bookings"
              className="mt-4 block text-center text-sm text-primary hover:underline"
            >
              Управление бронированием
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm text-foreground text-right">{value}</span>
    </div>
  )
}
