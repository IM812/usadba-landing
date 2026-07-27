import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('faq')
    .select('id, question, answer, sort_order')
    .order('sort_order', { ascending: true })
  if (error) return NextResponse.json({ ok: false, data: [] })
  return NextResponse.json({ ok: true, data })
}
