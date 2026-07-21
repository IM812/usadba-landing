import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { fetchAvitoRanges, type BusyRange } from '@/lib/ics'

export type { BusyRange }

export async function GET() {
  try {
    const supabase = createServiceClient()

    // 1. Fetch confirmed bookings from Supabase
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('check_in, check_out')
      .eq('status', 'confirmed')

    if (error) {
      console.error('[availability] Supabase error:', error.message)
      return NextResponse.json({ ok: false, error: error.message, ranges: [] }, { status: 500 })
    }

    const supabaseRanges: BusyRange[] = (bookings ?? []).map((b) => ({
      start: b.check_in,
      end: b.check_out,
    }))

    // 2. Fetch Avito ICS (settings table holds the URL)
    const { data: settings } = await supabase
      .from('settings')
      .select('avito_ics_url')
      .eq('id', 1)
      .single()

    const avitoUrl = settings?.avito_ics_url ?? ''
    const { ranges: avitoRanges, error: icsError } = await fetchAvitoRanges(avitoUrl)

    if (icsError) {
      console.warn('[availability] Avito ICS warning:', icsError)
    }

    const ranges: BusyRange[] = [...supabaseRanges, ...avitoRanges]

    return NextResponse.json({ ok: true, ranges })
  } catch (err) {
    console.error('[availability] Unexpected error:', err)
    return NextResponse.json({ ok: false, error: 'Internal error', ranges: [] }, { status: 500 })
  }
}
