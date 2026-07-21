import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdminAuth } from '@/lib/admin-auth'

// GET is public — the about section on the site may read amenities
export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('amenities').select('*').order('sort_order')
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, data })
}

export async function POST(req: NextRequest) {
  const authError = requireAdminAuth(req)
  if (authError) return authError
  const supabase = createServiceClient()
  const body = await req.json()
  const { data, error } = await supabase.from('amenities').insert(body).select().single()
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, data })
}

export async function DELETE(req: NextRequest) {
  const authError = requireAdminAuth(req)
  if (authError) return authError
  const supabase = createServiceClient()
  const { id } = await req.json()
  if (!id) return NextResponse.json({ ok: false, error: 'id required' }, { status: 400 })
  const { error } = await supabase.from('amenities').delete().eq('id', id)
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest) {
  const authError = requireAdminAuth(req)
  if (authError) return authError
  const supabase = createServiceClient()
  const { id, ...updates } = await req.json()
  if (!id) return NextResponse.json({ ok: false, error: 'id required' }, { status: 400 })
  const { data, error } = await supabase.from('amenities').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, data })
}
