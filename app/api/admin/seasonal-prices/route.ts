import { NextResponse } from 'next/server'
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

export async function POST(req: Request) {
  const supabase = createServiceClient()
  const raw = await req.json()
  const body = {
    ...raw,
    ...(raw.date_from !== undefined && { date_from: normalizeMmDd(raw.date_from) }),
    ...(raw.date_to !== undefined && { date_to: normalizeMmDd(raw.date_to) }),
  }
  const { data, error } = await supabase.from('seasonal_prices').insert(body).select().single()
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, data })
}
