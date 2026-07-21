'use client'

import { useState } from 'react'
import useSWR from 'swr'
import {
  Plus,
  Check,
  X,
  Trash2,
  ChevronDown,
  Loader2,
  Eye,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Booking, BookingStatus, BookingSource } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

function formatRub(n: number) {
  return n.toLocaleString('ru-RU') + ' ₽'
}

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Ожидает',
  confirmed: 'Подтверждено',
  cancelled: 'Отменено',
}

const STATUS_COLOR: Record<BookingStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const SOURCE_LABEL: Record<BookingSource, string> = {
  site: 'Сайт',
  avito: 'Avito',
  manual: 'Вручную',
}

// ---- Add Booking Modal ----
function AddBookingModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    guest_name: '', phone: '', email: '', guests_count: '2',
    check_in: '', check_out: '', total_price: '', comment: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          guests_count: parseInt(form.guests_count) || 1,
          total_price: parseInt(form.total_price) || 0,
          source: 'manual',
        }),
      })
      const data = await res.json()
      if (!data.ok) { setError(data.error || 'Ошибка сохранения'); return }
      onSaved()
      onClose()
    } catch {
      setError('Ошибка подключения')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Добавить бронирование</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Имя гостя *" value={form.guest_name} onChange={(v) => update('guest_name', v)} required />
            <Field label="Телефон *" value={form.phone} onChange={(v) => update('phone', v)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Дата заезда *" type="date" value={form.check_in} onChange={(v) => update('check_in', v)} required />
            <Field label="Дата выезда *" type="date" value={form.check_out} onChange={(v) => update('check_out', v)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Гостей" type="number" value={form.guests_count} onChange={(v) => update('guests_count', v)} />
            <Field label="Стоимость (₽)" type="number" value={form.total_price} onChange={(v) => update('total_price', v)} />
          </div>
          <Field label="Email" type="email" value={form.email} onChange={(v) => update('email', v)} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Комментарий</label>
            <textarea
              value={form.comment}
              onChange={(e) => update('comment', e.target.value)}
              rows={3}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({
  label, value, onChange, type = 'text', required,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  )
}

// ---- Booking Detail Drawer ----
function BookingDrawer({
  booking,
  onClose,
  onUpdate,
}: {
  booking: Booking
  onClose: () => void
  onUpdate: () => void
}) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function updateStatus(status: BookingStatus) {
    setLoading(status)
    setError(null)
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!data.ok) {
        if (data.error === 'dates_conflict') setError('Конфликт дат с другим бронированием')
        else if (data.error === 'avito_conflict') setError('Конфликт с Avito-календарём')
        else setError(data.error || 'Ошибка')
        return
      }
      onUpdate()
      onClose()
    } catch {
      setError('Ошибка подключения')
    } finally {
      setLoading(null)
    }
  }

  async function deleteBooking() {
    if (!confirm('Удалить бронирование?')) return
    setLoading('delete')
    try {
      await fetch(`/api/admin/bookings/${booking.id}`, { method: 'DELETE' })
      onUpdate()
      onClose()
    } catch {
      setError('Ошибка удаления')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end">
      <button className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} aria-label="Закрыть" />
      <div className="relative z-10 w-full max-w-sm h-full bg-card border-l border-border shadow-2xl overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
          <h3 className="font-semibold text-foreground">Бронирование</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5 flex-1">
          {/* Status badge */}
          <span className={cn('self-start rounded-full px-3 py-1 text-xs font-medium', STATUS_COLOR[booking.status])}>
            {STATUS_LABEL[booking.status]}
          </span>

          <div className="space-y-3">
            <Row label="Гость" value={booking.guest_name} />
            <Row label="Телефон" value={booking.phone} />
            {booking.email && <Row label="Email" value={booking.email} />}
            <Row label="Гостей" value={String(booking.guests_count)} />
            <Row label="Заезд" value={formatDate(booking.check_in)} />
            <Row label="Выезд" value={formatDate(booking.check_out)} />
            <Row label="Сумма" value={formatRub(booking.total_price)} />
            <Row label="Источник" value={SOURCE_LABEL[booking.source]} />
            {booking.comment && <Row label="Комментарий" value={booking.comment} />}
            <Row label="Создано" value={new Date(booking.created_at).toLocaleString('ru-RU')} />
          </div>

          {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex flex-col gap-2 mt-auto">
            {booking.status === 'pending' && (
              <button
                onClick={() => updateStatus('confirmed')}
                disabled={!!loading}
                className="h-10 rounded-lg bg-green-600 text-white text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading === 'confirmed' ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                Подтвердить
              </button>
            )}
            {booking.status !== 'cancelled' && (
              <button
                onClick={() => updateStatus('cancelled')}
                disabled={!!loading}
                className="h-10 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:bg-secondary/80 disabled:opacity-50 transition-colors"
              >
                {loading === 'cancelled' ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
                Отменить
              </button>
            )}
            <button
              onClick={deleteBooking}
              disabled={!!loading}
              className="h-10 rounded-lg border border-destructive text-destructive text-sm font-medium flex items-center justify-center gap-2 hover:bg-destructive/10 disabled:opacity-50 transition-colors"
            >
              {loading === 'delete' ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Удалить
            </button>
          </div>
        </div>
      </div>
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

// ---- Main ----
export function BookingsManager() {
  const [statusFilter, setStatusFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState<Booking | null>(null)

  const params = new URLSearchParams()
  if (statusFilter) params.set('status', statusFilter)
  if (sourceFilter) params.set('source', sourceFilter)

  const { data, mutate } = useSWR(
    `/api/admin/bookings?${params.toString()}`,
    fetcher,
    { refreshInterval: 30000 },
  )

  const bookings: Booking[] = data?.data ?? []

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Бронирования</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{bookings.length} заявок</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="size-4" />
          Добавить
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Фильтры:</span>
        </div>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Все статусы"
          options={[
            { value: 'pending', label: 'Ожидает' },
            { value: 'confirmed', label: 'Подтверждено' },
            { value: 'cancelled', label: 'Отменено' },
          ]}
        />
        <Select
          value={sourceFilter}
          onChange={setSourceFilter}
          placeholder="Все источники"
          options={[
            { value: 'site', label: 'Сайт' },
            { value: 'avito', label: 'Avito' },
            { value: 'manual', label: 'Вручную' },
          ]}
        />
        {(statusFilter || sourceFilter) && (
          <button
            onClick={() => { setStatusFilter(''); setSourceFilter('') }}
            className="text-sm text-primary hover:underline"
          >
            Сбросить
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Гость</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Даты</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden sm:table-cell">Гостей</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Сумма</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">Источник</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Статус</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Нет бронирований</td>
                </tr>
              )}
              {bookings.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer"
                  onClick={() => setSelected(b)}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{b.guest_name}</p>
                    <p className="text-xs text-muted-foreground">{b.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {formatDate(b.check_in)} — {formatDate(b.check_out)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{b.guests_count}</td>
                  <td className="px-4 py-3 font-medium text-foreground hidden md:table-cell">{formatRub(b.total_price)}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs text-muted-foreground">{SOURCE_LABEL[b.source]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', STATUS_COLOR[b.status])}>
                      {STATUS_LABEL[b.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Eye className="size-4 text-muted-foreground" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <AddBookingModal onClose={() => setShowAdd(false)} onSaved={() => mutate()} />
      )}
      {selected && (
        <BookingDrawer
          booking={selected}
          onClose={() => setSelected(null)}
          onUpdate={() => mutate()}
        />
      )}
    </div>
  )
}

function Select({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  options: { value: string; label: string }[]
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
    </div>
  )
}
