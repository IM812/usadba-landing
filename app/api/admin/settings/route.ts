import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdminAuth } from '@/lib/admin-auth'

// GET is intentionally public — the public site reads settings (title, phone, etc.)
export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single()
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, data })
}

export async function PATCH(req: NextRequest) {
  const authError = requireAdminAuth(req)
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
