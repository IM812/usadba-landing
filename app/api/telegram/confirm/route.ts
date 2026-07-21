import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { fetchAvitoRanges, rangesOverlap } from '@/lib/ics'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const id = searchParams.get('id')
  const action = searchParams.get('action')

  if (!id || !action || !['confirm', 'cancel'].includes(action)) {
    return new Response('Bad request', { status: 400 })
  }

  const supabase = createServiceClient()

  const { data: booking, error: fetchErr } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchErr || !booking) {
    return new Response('Booking not found', { status: 404 })
  }

  if (action === 'cancel') {
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id)
    return new Response(
      renderHtml('Бронирование отклонено', '❌ Заявка отменена.', '#dc2626'),
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  }

  // Confirm: re-check availability
  const { data: others } = await supabase
    .from('bookings')
    .select('check_in, check_out')
    .eq('status', 'confirmed')
    .neq('id', id)

  const conflict = (others ?? []).some((b) =>
    rangesOverlap(booking.check_in, booking.check_out, b.check_in, b.check_out),
  )
  if (conflict) {
    return new Response(
      renderHtml('Конфликт дат', '⚠️ Эти даты уже заняты другим бронированием.', '#d97706'),
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  }

  // Check Avito ICS too
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
    return new Response(
      renderHtml('Конфликт с Avito', '⚠️ Эти даты заняты в Avito.', '#d97706'),
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  }

  await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', id)

  return new Response(
    renderHtml('Подтверждено', '✅ Бронирование подтверждено! Гость добавлен в календарь.', '#16a34a'),
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  )
}

function renderHtml(title: string, message: string, color: string) {
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>${title}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f5f5f5;}
.card{background:#fff;border-radius:12px;padding:2rem;text-align:center;max-width:400px;box-shadow:0 4px 24px rgba(0,0,0,.1);}
h1{font-size:1.5rem;color:${color};margin:0 0 .5rem}p{color:#555;margin:0}</style></head>
<body><div class="card"><h1>${title}</h1><p>${message}</p></div></body></html>`
}
