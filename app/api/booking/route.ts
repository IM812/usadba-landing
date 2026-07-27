import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { fetchAvitoRanges, rangesOverlap } from '@/lib/ics'

function formatDate(iso: string) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

function formatRub(n: number) {
  return n.toLocaleString('ru-RU') + ' ₽'
}

type SeasonalPrice = {
  date_from: string
  date_to: string
  base_price: number
  weekend_price: number
}

function isWeekend(d: Date) {
  const day = d.getDay()
  return day === 5 || day === 6
}

function seasonWidth(from: string, to: string): number {
  const [fm, fd] = from.split('-').map(Number)
  const [tm, td] = to.split('-').map(Number)
  const fromDay = fm * 31 + fd
  const toDay = tm * 31 + td
  return toDay >= fromDay ? toDay - fromDay : (12 * 31 + 31) - fromDay + toDay
}

function getSeasonalPrice(
  d: Date,
  seasons: SeasonalPrice[],
  fallbackBase: number,
  fallbackWeekend: number,
): number {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const key = `${mm}-${dd}`
  const sorted = [...seasons].sort(
    (a, b) => seasonWidth(a.date_from, a.date_to) - seasonWidth(b.date_from, b.date_to)
  )
  for (const s of sorted) {
    const from = s.date_from
    const to = s.date_to
    const inRange = from <= to ? key >= from && key <= to : key >= from || key <= to
    if (inRange) return isWeekend(d) ? s.weekend_price : s.base_price
  }
  return isWeekend(d) ? fallbackWeekend : fallbackBase
}

function calcPrice(
  arrival: string,
  departure: string,
  basePrice: number,
  weekendPrice: number,
  seasons: SeasonalPrice[] = [],
): { total: number; nights: number; weekendNights: number; weekdayNights: number } {
  const start = new Date(arrival)
  const end = new Date(departure)
  const nights = Math.round((end.getTime() - start.getTime()) / 86_400_000)
  let total = 0
  let weekendNights = 0
  for (let i = 0; i < nights; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    const day = d.getDay()
    if (day === 5 || day === 6 || day === 0) weekendNights++
    total += getSeasonalPrice(d, seasons, basePrice, weekendPrice)
  }
  const weekdayNights = nights - weekendNights
  return { total, nights, weekendNights, weekdayNights }
}

async function sendTelegramMessage(
  token: string,
  chatId: string,
  text: string,
  inlineKeyboard?: object,
) {
  if (!token || !chatId) return
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      ...(inlineKeyboard ? { reply_markup: { inline_keyboard: inlineKeyboard } } : {}),
    }),
  }).catch((e) => console.error('[telegram] send error:', e))
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { arrival, departure, guests, name, phone, email, comment } = body

    if (!arrival || !departure || !name || !phone) {
      return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // --- Load settings + seasonal prices ---
    const [{ data: settings }, { data: seasons }] = await Promise.all([
      supabase
        .from('settings')
        .select('base_price, weekend_price, telegram_bot_token, telegram_chat_id, avito_ics_url, site_url')
        .eq('id', 1)
        .single(),
      supabase
        .from('seasonal_prices')
        .select('date_from, date_to, base_price, weekend_price')
        .eq('active', true)
        .order('sort_order'),
    ])

    const basePrice = settings?.base_price ?? 20000
    const weekendPrice = settings?.weekend_price ?? 24000
    const botToken = settings?.telegram_bot_token ?? ''
    const chatId = settings?.telegram_chat_id ?? ''
    const avitoUrl = settings?.avito_ics_url ?? ''
    const siteUrl = settings?.site_url ?? ''

    // --- Check Supabase confirmed bookings ---
    const { data: existing } = await supabase
      .from('bookings')
      .select('check_in, check_out')
      .eq('status', 'confirmed')

    const supabaseConflict = (existing ?? []).some((b) =>
      rangesOverlap(arrival, departure, b.check_in, b.check_out),
    )
    if (supabaseConflict) {
      return NextResponse.json({ ok: false, error: 'dates_unavailable' }, { status: 409 })
    }

    // --- Check Avito ICS ---
    const { ranges: avitoRanges, error: icsError } = await fetchAvitoRanges(avitoUrl)
    if (icsError && avitoRanges.length === 0 && avitoUrl) {
      // ICS completely unreachable — safer to block
      return NextResponse.json({ ok: false, error: 'availability_unknown' }, { status: 503 })
    }
    const avitoConflict = avitoRanges.some((r) => rangesOverlap(arrival, departure, r.start, r.end))
    if (avitoConflict) {
      return NextResponse.json({ ok: false, error: 'dates_unavailable' }, { status: 409 })
    }

    // --- Calculate price ---
    const { total, nights, weekendNights, weekdayNights } = calcPrice(
      arrival,
      departure,
      basePrice,
      weekendPrice,
      seasons ?? [],
    )

    // --- Save to Supabase ---
    const { data: booking, error: insertError } = await supabase
      .from('bookings')
      .insert({
        guest_name: name.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        guests_count: parseInt(guests) || 1,
        check_in: arrival,
        check_out: departure,
        total_price: total,
        comment: comment?.trim() || null,
        source: 'site',
        status: 'pending',
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('[booking] Insert error:', insertError.message)
      return NextResponse.json({ ok: false, error: 'db_error' }, { status: 500 })
    }

    const bookingId = booking?.id

    // --- Send Telegram notification ---
    const priceLines = [
      `💰 *Стоимость:*`,
      weekendNights > 0
        ? `   Выходные: ${weekendNights} н. × ${formatRub(weekendPrice)} = ${formatRub(weekendNights * weekendPrice)}`
        : null,
      weekdayNights > 0
        ? `   Будни: ${weekdayNights} н. × ${formatRub(basePrice)} = ${formatRub(weekdayNights * basePrice)}`
        : null,
      `   Итого за ${nights} ночей: *${formatRub(total)}*`,
    ].filter(Boolean)

    const text = [
      '🏡 *Новая заявка на бронирование*',
      '',
      `📅 Заезд: *${formatDate(arrival)}*`,
      `📅 Выезд: *${formatDate(departure)}*`,
      `👥 Гостей: *${guests}*`,
      '',
      ...priceLines,
      '',
      `👤 Имя: *${name.trim()}*`,
      `📞 Телефон: *${phone.trim()}*`,
      email ? `✉️ Email: *${email.trim()}*` : null,
      comment ? `💬 Комментарий: ${comment.trim()}` : null,
    ]
      .filter(Boolean)
      .join('\n')

    const confirmUrl = siteUrl
      ? `${siteUrl}/api/telegram/confirm?id=${bookingId}&action=confirm`
      : null
    const cancelUrl = siteUrl
      ? `${siteUrl}/api/telegram/confirm?id=${bookingId}&action=cancel`
      : null

    const keyboard =
      confirmUrl && cancelUrl
        ? [[
            { text: '✅ Подтвердить', url: confirmUrl },
            { text: '❌ Отклонить', url: cancelUrl },
          ]]
        : null

    await sendTelegramMessage(botToken, chatId, text, keyboard ?? undefined)

    return NextResponse.json({ ok: true, id: bookingId })
  } catch (err) {
    console.error('[booking] Unexpected error:', err)
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 })
  }
}
