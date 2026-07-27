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

    // 2. Fetch settings + seasonal prices
    const [{ data: settings }, { data: seasonalPrices }] = await Promise.all([
      supabase
        .from('settings')
        .select('avito_ics_url, base_price, weekend_price, extra_guest_price, cleaning_fee, minimum_nights')
        .eq('id', 1)
        .single(),
      supabase
        .from('seasonal_prices')
        .select('*')
        .eq('active', true)
        .order('sort_order'),
    ])

    // fallback to env var if DB is empty
    const avitoUrl = settings?.avito_ics_url || process.env.AVITO_ICS_URL || ''
    const { ranges: avitoRanges, error: icsError } = await fetchAvitoRanges(avitoUrl)

    if (icsError) {
      console.warn('[availability] Avito ICS warning:', icsError)
    }

    const ranges: BusyRange[] = [...supabaseRanges, ...avitoRanges]

    return NextResponse.json({
      ok: true,
      ranges,
      // Keep legacy field name for backwards compat
      blockedRanges: ranges,
      settings: {
        base_price: settings?.base_price ?? 20000,
        weekend_price: settings?.weekend_price ?? 24000,
        extra_guest_price: settings?.extra_guest_price ?? 0,
        cleaning_fee: settings?.cleaning_fee ?? 0,
        minimum_nights: settings?.minimum_nights ?? 1,
      },
      seasonalPrices: seasonalPrices ?? [],
    })
  } catch (err) {
    console.error('[availability] Unexpected error:', err)
    return NextResponse.json({ ok: false, error: 'Internal error', ranges: [] }, { status: 500 })
  }
}
