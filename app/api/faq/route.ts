import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('faq')
    .select('question, answer')
    .order('sort_order')
  if (error) return NextResponse.json({ ok: false, data: [] })
  return NextResponse.json({ ok: true, data })
}
