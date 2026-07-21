'use client'

import useSWR from 'swr'
import { TrendingUp, Clock, CheckCircle, XCircle, BarChart3, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Booking } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function formatRub(n: number) {
  return n.toLocaleString('ru-RU') + ' ₽'
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
  sub?: string
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
      <div className={cn('size-10 rounded-lg flex items-center justify-center shrink-0', color)}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-semibold text-foreground mt-0.5">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Ожидает',
  confirmed: 'Подтверждено',
  cancelled: 'Отменено',
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export function AdminDashboard() {
  const { data: stats } = useSWR('/api/admin/stats', fetcher, { refreshInterval: 30000 })
  const { data: bookingsRes } = useSWR('/api/admin/bookings', fetcher, { refreshInterval: 30000 })

  const s = stats?.data
  const recent: Booking[] = (bookingsRes?.data ?? []).slice(0, 8)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Общая сводка по бронированиям</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Всего заявок"
          value={s?.total ?? '—'}
          icon={BarChart3}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          label="Ожидают"
          value={s?.pending ?? '—'}
          icon={Clock}
          color="bg-amber-100 text-amber-600"
        />
        <StatCard
          label="Подтверждено"
          value={s?.confirmed ?? '—'}
          icon={CheckCircle}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          label="Отменено"
          value={s?.cancelled ?? '—'}
          icon={XCircle}
          color="bg-red-100 text-red-600"
        />
        <StatCard
          label="Доход за месяц"
          value={s ? formatRub(s.revenueMonth) : '—'}
          icon={TrendingUp}
          color="bg-blue-100 text-blue-600"
          sub="подтверждённые"
        />
        <StatCard
          label="Доход за год"
          value={s ? formatRub(s.revenueYear) : '—'}
          icon={CalendarDays}
          color="bg-purple-100 text-purple-600"
          sub="подтверждённые"
        />
      </div>

      {/* Recent bookings */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Последние заявки</h2>
          <a href="/admin/bookings" className="text-xs text-primary hover:underline">Все заявки</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Гость</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Заезд — Выезд</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Гостей</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Сумма</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Статус</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground text-sm">
                    Бронирований пока нет
                  </td>
                </tr>
              )}
              {recent.map((b) => (
                <tr key={b.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">{b.guest_name}</p>
                    <p className="text-xs text-muted-foreground">{b.phone}</p>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {formatDate(b.check_in)} — {formatDate(b.check_out)}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{b.guests_count}</td>
                  <td className="px-5 py-3 text-foreground font-medium">{formatRub(b.total_price)}</td>
                  <td className="px-5 py-3">
                    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', STATUS_COLOR[b.status])}>
                      {STATUS_LABEL[b.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
