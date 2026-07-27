import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const authError = await requireAdminAuth(req)
  if (authError) return authError

  const supabase = createServiceClient()

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('status, total_price, total_nights, guests_count, check_in, check_out, created_at')

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

  const all = bookings ?? []
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const thisYear = String(now.getFullYear())

  const confirmed = all.filter((b) => b.status === 'confirmed')
  const total = all.length
  const pending = all.filter((b) => b.status === 'pending').length
  const confirmedCount = confirmed.length
  const cancelled = all.filter((b) => b.status === 'cancelled').length

  const revenueMonth = confirmed
    .filter((b) => b.created_at.startsWith(thisMonth))
    .reduce((sum, b) => sum + (b.total_price ?? 0), 0)

  const revenueYear = confirmed
    .filter((b) => b.created_at.startsWith(thisYear))
    .reduce((sum, b) => sum + (b.total_price ?? 0), 0)

  const avgCheck = confirmedCount > 0
    ? Math.round(confirmed.reduce((s, b) => s + (b.total_price ?? 0), 0) / confirmedCount)
    : 0

  const avgNights = confirmedCount > 0
    ? +(confirmed.reduce((s, b) => s + (b.total_nights ?? 0), 0) / confirmedCount).toFixed(1)
    : 0

  // Monthly chart — bookings and revenue for the last 12 months
  const MONTHS_RU = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
  const monthlyMap: Record<string, { label: string; bookings: number; revenue: number }> = {}
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyMap[key] = { label: MONTHS_RU[d.getMonth()], bookings: 0, revenue: 0 }
  }
  for (const b of confirmed) {
    const key = b.created_at.slice(0, 7)
    if (monthlyMap[key]) {
      monthlyMap[key].bookings++
      monthlyMap[key].revenue += b.total_price ?? 0
    }
  }
  const monthly = Object.values(monthlyMap)

  // Season occupancy — count confirmed nights per season
  const seasons: Record<string, number> = { Весна: 0, Лето: 0, Осень: 0, Зима: 0 }
  const seasonOf = (month: number) => {
    if (month >= 3 && month <= 5) return 'Весна'
    if (month >= 6 && month <= 8) return 'Лето'
    if (month >= 9 && month <= 11) return 'Осень'
    return 'Зима'
  }
  for (const b of confirmed) {
    const m = new Date(b.check_in).getMonth() + 1
    seasons[seasonOf(m)] += b.total_nights ?? 0
  }
  const seasonOccupancy = Object.entries(seasons).map(([name, nights]) => ({ name, nights }))

  return NextResponse.json({
    ok: true,
    data: {
      total, pending, confirmed: confirmedCount, cancelled,
      revenueMonth, revenueYear, avgCheck, avgNights,
      monthly, seasonOccupancy,
    },
  })
}
