import { type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { fetchAvitoRanges, rangesOverlap } from '@/lib/ics'

function formatDate(iso: string) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

function formatRub(n: number) {
  return (n ?? 0).toLocaleString('ru-RU') + ' ₽'
}

function firstName(full: string) {
  return (full || '').trim().split(/\s+/)[0] || 'Здравствуйте'
}

function buildConfirmText(
  booking: {
    guest_name: string
    check_in: string
    check_out: string
    guests_count: number
    total_price: number
  },
  settings: {
    check_in_time?: string
    check_out_time?: string
    phone?: string
    address?: string
  } | null,
) {
  const checkInTime = settings?.check_in_time || '14:00'
  const checkOutTime = settings?.check_out_time || '12:00'
  return [
    `${firstName(booking.guest_name)}, здравствуйте!`,
    '',
    'Спасибо за бронирование — даты подтверждены, ждём вас!',
    '',
    `Заезд: ${formatDate(booking.check_in)} с ${checkInTime}`,
    `Выезд: ${formatDate(booking.check_out)} до ${checkOutTime}`,
    `Гостей: ${booking.guests_count}`,
    `Стоимость: ${formatRub(booking.total_price)}`,
    settings?.address ? `Адрес: ${settings.address}` : null,
    '',
    'Если планы изменятся или появятся вопросы — просто напишите нам.',
    settings?.phone ? `Наш телефон: ${settings.phone}` : null,
  ]
    .filter((l) => l !== null)
    .join('\n')
}

function buildCancelText(booking: { guest_name: string; check_in: string; check_out: string }) {
  return [
    `${firstName(booking.guest_name)}, здравствуйте!`,
    '',
    `К сожалению, даты с ${formatDate(booking.check_in)} по ${formatDate(booking.check_out)} уже заняты, подтвердить бронирование на них не получится. Извините за неудобство!`,
    '',
    'Если готовы рассмотреть другие даты — напишите нам, подберём свободное окно и с радостью вас примем.',
  ].join('\n')
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const id = searchParams.get('id')
  const action = searchParams.get('action')

  if (!id || !action || !['confirm', 'cancel'].includes(action)) {
    return new Response('Bad request', { status: 400 })
  }

  const supabase = createServiceClient()

  const [{ data: booking, error: fetchErr }, { data: settings }] = await Promise.all([
    supabase.from('bookings').select('*').eq('id', id).single(),
    supabase
      .from('settings')
      .select('avito_ics_url, check_in_time, check_out_time, phone, address')
      .eq('id', 1)
      .single(),
  ])

  if (fetchErr || !booking) {
    return new Response('Booking not found', { status: 404 })
  }

  const page = (title: string, message: string, color: string, replyText: string) =>
    new Response(renderHtml(title, message, color, booking, replyText), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })

  if (action === 'cancel') {
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id)
    return page(
      'Бронирование отклонено',
      '❌ Заявка отменена. Скопируйте сообщение и отправьте гостю.',
      '#dc2626',
      buildCancelText(booking),
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
    return page(
      'Конфликт дат',
      '⚠️ Эти даты уже заняты другим бронированием. Можно отправить гостю сообщение об отказе.',
      '#d97706',
      buildCancelText(booking),
    )
  }

  const { ranges: avitoRanges } = await fetchAvitoRanges(settings?.avito_ics_url ?? '')
  const avitoConflict = avitoRanges.some((r) =>
    rangesOverlap(booking.check_in, booking.check_out, r.start, r.end),
  )
  if (avitoConflict) {
    return page(
      'Конфликт с Avito',
      '⚠️ Эти даты заняты в Avito. Можно отправить гостю сообщение об отказе.',
      '#d97706',
      buildCancelText(booking),
    )
  }

  await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', id)

  return page(
    'Подтверждено',
    '✅ Бронирование подтверждено. Скопируйте сообщение и отправьте гостю.',
    '#16a34a',
    buildConfirmText(booking, settings ?? null),
  )
}

function escapeHtml(s: string) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderHtml(
  title: string,
  message: string,
  color: string,
  booking: { guest_name: string; phone: string | null; email: string | null },
  replyText: string,
) {
  const contacts = [
    booking.phone
      ? `<a href="tel:${escapeHtml(booking.phone)}">${escapeHtml(booking.phone)}</a>`
      : null,
    booking.email
      ? `<a href="mailto:${escapeHtml(booking.email)}">${escapeHtml(booking.email)}</a>`
      : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const waPhone = (booking.phone ?? '').replace(/\D/g, '')

  return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{box-sizing:border-box}
body{font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:1rem;background:#f5f5f5;}
.card{background:#fff;border-radius:14px;padding:1.5rem;max-width:520px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,.1);}
h1{font-size:1.35rem;color:${color};margin:0 0 .4rem}
.msg{color:#555;margin:0 0 1rem;font-size:.95rem;line-height:1.5}
.who{font-size:.9rem;color:#333;margin:0 0 1rem}
.who a{color:#2563eb;text-decoration:none}
textarea{width:100%;min-height:210px;border:1px solid #ddd;border-radius:10px;padding:.75rem;font:inherit;font-size:.9rem;line-height:1.5;resize:vertical;background:#fafafa;color:#111}
.row{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.75rem}
button,.btn{flex:1 1 140px;border:0;border-radius:10px;padding:.7rem 1rem;font:inherit;font-weight:600;cursor:pointer;text-align:center;text-decoration:none}
#copy{background:${color};color:#fff}
.btn{background:#eef2f7;color:#111}
.ok{color:#16a34a;font-size:.85rem;margin:.6rem 0 0;min-height:1.1em}
</style></head>
<body><div class="card">
<h1>${escapeHtml(title)}</h1>
<p class="msg">${escapeHtml(message)}</p>
<p class="who"><strong>${escapeHtml(booking.guest_name)}</strong>${contacts ? ' — ' + contacts : ''}</p>
<textarea id="text" readonly>${escapeHtml(replyText)}</textarea>
<div class="row">
<button id="copy" type="button">Скопировать сообщение</button>
${waPhone ? `<a class="btn" href="https://wa.me/${waPhone}" target="_blank" rel="noopener">WhatsApp</a>` : ''}
</div>
<p class="ok" id="status"></p>
</div>
<script>
document.getElementById('copy').addEventListener('click', async function () {
  var ta = document.getElementById('text');
  try {
    await navigator.clipboard.writeText(ta.value);
  } catch (e) {
    ta.removeAttribute('readonly'); ta.select(); document.execCommand('copy'); ta.setAttribute('readonly','');
  }
  document.getElementById('status').textContent = 'Скопировано ✓';
});
</script>
</body></html>`
}
