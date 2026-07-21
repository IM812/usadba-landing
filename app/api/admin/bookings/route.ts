import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = createServiceClient()
  const { searchParams } = req.nextUrl

  let query = supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })

  const status = searchParams.get('status')
  if (status) query = query.eq('status', status)

  const source = searchParams.get('source')
  if (source) query = query.eq('source', source)

  const { data, error } = await query

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, data })
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient()
  const body = await req.json()

  const { data, error } = await supabase
    .from('bookings')
    .insert({ ...body, source: body.source ?? 'manual', status: 'confirmed' })
    .select()
    .single()

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, data })
}
