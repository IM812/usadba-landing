'use client'

import useSWR from 'swr'
import {
  TrendingUp, Clock, CheckCircle, XCircle, BarChart3, CalendarDays,
  CreditCard, Moon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Booking } from '@/lib/types'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts'

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

const SEASON_COLORS: Record<string, string> = {
  Весна: '#4ade80',
  Лето: '#facc15',
  Осень: '#fb923c',
  Зима: '#60a5fa',
}

function ChartTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1c1c1e',
      border: '1px solid #3a3a3c',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 12,
      color: '#f5f5f5',
      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    }}>
      {label && <p style={{ fontWeight: 600, marginBottom: 4, color: '#a1a1aa' }}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? '#f5f5f5' }}>
          {formatter ? formatter(p.value, p) : p.value}
        </p>
      ))}
    </div>
  )
}


export function AdminDashboard() {
  const { data: stats } = useSWR('/api/admin/stats', fetcher, { refreshInterval: 30000 })
  const { data: bookingsRes } = useSWR('/api/admin/bookings', fetcher, { refreshInterval: 30000 })

  const s = stats?.data
  const recent: Booking[] = (bookingsRes?.data ?? []).slice(0, 8)

  const seasonData = (s?.seasonOccupancy ?? []).map((item: any) => ({
    ...item,
    fill: SEASON_COLORS[item.name] ?? '#8884d8',
  }))

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Общая сводка по бронированиям</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Всего заявок" value={s?.total ?? '—'} icon={BarChart3} color="bg-primary/10 text-primary" />
        <StatCard label="Ожидают" value={s?.pending ?? '—'} icon={Clock} color="bg-amber-100 text-amber-600" />
        <StatCard label="Подтверждено" value={s?.confirmed ?? '—'} icon={CheckCircle} color="bg-green-100 text-green-600" />
        <StatCard label="Отменено" value={s?.cancelled ?? '—'} icon={XCircle} color="bg-red-100 text-red-600" />
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
        <StatCard
          label="Средний чек"
          value={s ? formatRub(s.avgCheck) : '—'}
          icon={CreditCard}
          color="bg-rose-100 text-rose-600"
          sub="за бронирование"
        />
        <StatCard
          label="Средний срок"
          value={s ? `${s.avgNights} н.` : '—'}
          icon={Moon}
          color="bg-indigo-100 text-indigo-600"
          sub="ночей в брони"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly bookings chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 space-y-5">
          {/* Bookings count */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Брони по месяцам</p>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={s?.monthly ?? []} margin={{ top: 0, right: 0, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3c" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  content={<ChartTooltip formatter={(v: any) => `${v} броней`} />}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="bookings" fill="#4ade80" radius={[4, 4, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Revenue */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Выручка по месяцам, ₽</p>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={s?.monthly ?? []} margin={{ top: 0, right: 0, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3c" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v === 0 ? '0' : `${(v / 1000).toFixed(0)}k`}
                  width={28}
                />
                <Tooltip
                  content={<ChartTooltip formatter={(v: any) => formatRub(v)} />}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="revenue" fill="#60a5fa" radius={[4, 4, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Season occupancy chart */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">Сезоны</p>
          {seasonData.every((d: any) => d.nights === 0) ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              <span className="text-3xl text-muted-foreground/30">◔</span>
              <span className="text-xs text-muted-foreground">Нет данных</span>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={seasonData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={4}
                    dataKey="nights"
                    stroke="none"
                  >
                    {seasonData.map((entry: any, index: number) => (
                      <Cell
                        key={index}
                        style={{ fill: entry.fill, outline: 'none' }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const d = payload[0].payload
                      return (
                        <div style={{
                          background: '#1c1c1e',
                          border: '1px solid #3a3a3c',
                          borderRadius: 8,
                          padding: '8px 12px',
                          fontSize: 12,
                          color: '#f5f5f5',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                        }}>
                          <p style={{ fontWeight: 600, marginBottom: 2, color: d.fill }}>{d.name}</p>
                          <p>{d.nights} ночей</p>
                        </div>
                      )
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {seasonData.map((d: any) => {
                  const total = seasonData.reduce((acc: number, x: any) => acc + x.nights, 0)
                  const pct = total > 0 ? Math.round((d.nights / total) * 100) : 0
                  return (
                    <div key={d.name} className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
                      <span className="text-xs text-muted-foreground flex-1">{d.name}</span>
                      <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: d.fill }}
                        />
                      </div>
                      <span className="text-xs font-medium text-foreground w-8 text-right">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
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
