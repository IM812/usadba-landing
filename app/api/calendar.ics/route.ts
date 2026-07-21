import { createServiceClient } from '@/lib/supabase/server'
import { generateIcs } from '@/lib/ics'

export async function GET() {
  try {
    const supabase = createServiceClient()

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, check_in, check_out')
      .eq('status', 'confirmed')
      .order('check_in', { ascending: true })

    if (error) {
      return new Response('Internal error', { status: 500 })
    }

    const ics = generateIcs(bookings ?? [])

    return new Response(ics, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="calendar.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (err) {
    console.error('[calendar.ics]', err)
    return new Response('Internal error', { status: 500 })
  }
}
