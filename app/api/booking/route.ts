import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { fetchAvitoRanges, rangesOverlap } from '@/lib/ics'
import { parseDateKey } from '@/lib/date'
import { calculateStayPrice, type NightPrice, SAUNA_ADDON_PRICE, SAUNA_ADDON_LABEL } from '@/lib/pricing'

function formatDate(iso: string) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

function formatRub(n: number) {
  return n.toLocaleString('ru-RU') + ' ₽'
}

/** Группирует ночи по фактической цене — так разбивка всегда сходится с итогом */
function buildPriceBreakdown(nightsList: NightPrice[]): string[] {
  const groups = new Map<string, { price: number; count: number; weekend: boolean; singleNightSurcharge: boolean }>()
  for (const n of nightsList) {
    const key = `${n.price}|${n.weekend ? 'w' : 'b'}|${n.singleNightSurcharge ? 's' : ''}`
    const g = groups.get(key)
    if (g) g.count++
    else groups.set(key, { price: n.price, count: 1, weekend: n.weekend, singleNightSurcharge: n.singleNightSurcharge })
  }
  return [...groups.values()]
    .sort((a, b) => b.price - a.price)
    .map((g) => {
      const label = g.weekend ? 'Выходные' : 'Будни'
      const surchargeNote = g.singleNightSurcharge ? ' (надбавка за 1 ночь на выходных)' : ''
      return `   ${label}${surchargeNote}: ${g.count} н. × ${formatRub(g.price)} = ${formatRub(g.count * g.price)}`
    })
}

function nightsWord(n: number) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'ночь'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'ночи'
  return 'ночей'
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
    const { arrival, departure, guests, name, phone, email, comment, saunaAddon } = body
    const wantsSaunaAddon = saunaAddon === true

    if (!arrival || !departure || !name || !phone) {
      return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // --- Load settings + seasonal prices ---
    const [{ data: settings }, { data: seasons }] = await Promise.all([
      supabase
        .from('settings')
        .select('base_price, weekend_price, price_mode, extra_guest_price, base_guests, max_guests, telegram_bot_token, telegram_chat_id, avito_ics_url, site_url')
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
    const priceMode = settings?.price_mode ?? 'base'
    const extraGuestPrice = settings?.extra_guest_price ?? 1500
    const baseGuests = settings?.base_guests ?? 8
    const maxGuests = settings?.max_guests ?? 15
    const guestsCount = parseInt(guests) || 1

    // Validate guest count
    if (guestsCount > maxGuests) {
      return NextResponse.json(
        { ok: false, error: 'too_many_guests', max: maxGuests },
        { status: 400 },
      )
    }

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
    const { subtotal: accommodationTotal, nights, nightsList } = calculateStayPrice(
      parseDateKey(arrival),
      parseDateKey(departure),
      basePrice,
      weekendPrice,
      priceMode === 'seasonal' ? (seasons ?? []) : [],
    )
    const extraGuests = Math.max(0, guestsCount - baseGuests)
    const extraGuestTotal = extraGuests * extraGuestPrice * nights
    const addonTotal = wantsSaunaAddon ? SAUNA_ADDON_PRICE : 0
    const total = accommodationTotal + extraGuestTotal + addonTotal

    // Допуслуга не имеет своей колонки в БД — фиксируем её в комментарии,
    // чтобы она была видна в админке и в истории брони.
    const addonNote = wantsSaunaAddon ? `${SAUNA_ADDON_LABEL}: ${formatRub(SAUNA_ADDON_PRICE)}` : null
    const fullComment = [comment?.trim() || null, addonNote].filter(Boolean).join(' · ') || null

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
        comment: fullComment,
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
      ...buildPriceBreakdown(nightsList),
      extraGuests > 0
        ? `   Доп. гостей: ${extraGuests} × ${formatRub(extraGuestPrice)} × ${nights} н. = ${formatRub(extraGuestTotal)}`
        : null,
      wantsSaunaAddon ? `   ${SAUNA_ADDON_LABEL}: ${formatRub(SAUNA_ADDON_PRICE)}` : null,
      `   Итого за ${nights} ${nightsWord(nights)}: *${formatRub(total)}*`,
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
