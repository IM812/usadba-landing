import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { fetchAvitoRanges, rangesOverlap } from '@/lib/ics'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient()
  const body = await req.json()

  // If confirming, re-check for conflicts
  if (body.status === 'confirmed') {
    const { data: booking } = await supabase
      .from('bookings')
      .select('check_in, check_out')
      .eq('id', id)
      .single()

    if (booking) {
      const { data: others } = await supabase
        .from('bookings')
        .select('check_in, check_out')
        .eq('status', 'confirmed')
        .neq('id', id)

      const conflict = (others ?? []).some((b) =>
        rangesOverlap(booking.check_in, booking.check_out, b.check_in, b.check_out),
      )
      if (conflict) {
        return NextResponse.json({ ok: false, error: 'dates_conflict' }, { status: 409 })
      }

      const { data: settings } = await supabase
        .from('settings')
        .select('avito_ics_url')
        .eq('id', 1)
        .single()

      const { ranges: avitoRanges } = await fetchAvitoRanges(settings?.avito_ics_url ?? '')
      const avitoConflict = avitoRanges.some((r) =>
        rangesOverlap(booking.check_in, booking.check_out, r.start, r.end),
      )
      if (avitoConflict) {
        return NextResponse.json({ ok: false, error: 'avito_conflict' }, { status: 409 })
      }
    }
  }

  const { data, error } = await supabase
    .from('bookings')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, data })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient()

  const { error } = await supabase.from('bookings').delete().eq('id', id)

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
