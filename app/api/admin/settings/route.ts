import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdminAuth } from '@/lib/admin-auth'

// Public-safe fields only — secrets (telegram bot token, ICS url, etc.) require auth
const PUBLIC_FIELDS =
  'title, subtitle, description, phone, address, telegram, whatsapp, base_price, weekend_price, extra_guest_price, cleaning_fee, minimum_nights, check_in_time, check_out_time'

export async function GET(req: NextRequest) {
  const supabase = createServiceClient()

  // Authenticated admins get the full row; everyone else gets the safe subset
  const isAdmin = (await requireAdminAuth(req)) === null
  const fields = isAdmin ? '*' : PUBLIC_FIELDS

  const { data, error } = await supabase.from('settings').select(fields).eq('id', 1).single()
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, data })
}

export async function PATCH(req: NextRequest) {
  const authError = await requireAdminAuth(req)
  if (authError) return authError

  const supabase = createServiceClient()
  const body = await req.json()

  // Never allow overwriting the primary key
  const { id: _omit, ...updates } = body

  const { data, error } = await supabase
    .from('settings')
    .update(updates)
    .eq('id', 1)
    .select()
    .single()

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, data })
}
