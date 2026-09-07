import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('seasonal_prices')
    .select('*')
    .order('sort_order')
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, data })
}

function normalizeMmDd(v: string): string {
  const cleaned = String(v).replace(/[.\s/]/g, '-')
  const parts = cleaned.split('-')
  if (parts.length === 2) return `${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`
  if (v.length === 4) return `${v.slice(0, 2)}-${v.slice(2, 4)}`
  return cleaned
}

export async function POST(req: NextRequest) {
  const authError = await requireAdminAuth(req)
  if (authError) return authError

  const supabase = createServiceClient()
  const raw = await req.json()
  const minimumNights = Number(raw.minimum_nights)
  if (!Number.isInteger(minimumNights) || minimumNights < 1 || minimumNights > 365) {
    return NextResponse.json({ ok: false, error: 'Минимум ночей должен быть от 1 до 365' }, { status: 400 })
  }

  const body = {
    name: String(raw.name ?? '').trim(),
    date_from: normalizeMmDd(raw.date_from),
    date_to: normalizeMmDd(raw.date_to),
    base_price: Number(raw.base_price),
    weekend_price: Number(raw.weekend_price),
    minimum_nights: minimumNights,
    active: raw.active !== false,
    sort_order: Number(raw.sort_order) || 0,
  }
  const { data, error } = await supabase.from('seasonal_prices').insert(body).select().single()
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, data })
}
