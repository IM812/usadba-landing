import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServiceClient()

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('status, total_price, created_at')

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

  const all = bookings ?? []
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const thisYear = String(now.getFullYear())

  const total = all.length
  const pending = all.filter((b) => b.status === 'pending').length
  const confirmed = all.filter((b) => b.status === 'confirmed').length
  const cancelled = all.filter((b) => b.status === 'cancelled').length

  const revenueMonth = all
    .filter((b) => b.status === 'confirmed' && b.created_at.startsWith(thisMonth))
    .reduce((sum, b) => sum + (b.total_price ?? 0), 0)

  const revenueYear = all
    .filter((b) => b.status === 'confirmed' && b.created_at.startsWith(thisYear))
    .reduce((sum, b) => sum + (b.total_price ?? 0), 0)

  return NextResponse.json({
    ok: true,
    data: { total, pending, confirmed, cancelled, revenueMonth, revenueYear },
  })
}
