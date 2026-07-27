import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdminAuth } from '@/lib/admin-auth'

function normalizeMmDd(v: string): string {
  // Accept "08-01", "08.01", "08/01", "0801" → always return "MM-DD"
  const cleaned = String(v).replace(/[.\s/]/g, '-')
  const parts = cleaned.split('-')
  if (parts.length === 2) return `${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`
  if (v.length === 4) return `${v.slice(0, 2)}-${v.slice(2, 4)}`
  return cleaned
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdminAuth(req)
  if (authError) return authError

  const { id } = await params
  const supabase = createServiceClient()
  const raw = await req.json()
  const body = {
    ...raw,
    ...(raw.date_from !== undefined && { date_from: normalizeMmDd(raw.date_from) }),
    ...(raw.date_to !== undefined && { date_to: normalizeMmDd(raw.date_to) }),
  }
  const { data, error } = await supabase
    .from('seasonal_prices')
    .update(body)
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, data })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdminAuth(req)
  if (authError) return authError

  const { id } = await params
  const supabase = createServiceClient()
  const { error } = await supabase.from('seasonal_prices').delete().eq('id', id)
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
