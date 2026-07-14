import { NextResponse } from "next/server"
import { fetchBusyRanges } from "../availability/route"

/**
 * Returns true if stay [arrival, departure) conflicts with busy range [c, d).
 * departure === c is allowed: guest checks out in the morning before the next
 * guest checks in that evening.
 */
function rangesOverlap(a: string, b: string, c: string, d: string) {
  return a < d && b > c && b !== c
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { arrival, departure, guests, name, phone, email } = body

    // -----------------------------------------------------------------------
    // Server-side availability re-check before accepting the booking
    // -----------------------------------------------------------------------
    const { ranges, error: icsError } = await fetchBusyRanges()

    if (icsError && ranges.length === 0) {
      // ICS is completely unreachable — refuse to confirm so we don't double-book
      return NextResponse.json(
        { ok: false, error: "availability_unknown" },
        { status: 503 }
      )
    }

    const conflict = ranges.some((r) => rangesOverlap(arrival, departure, r.start, r.end))
    if (conflict) {
      return NextResponse.json(
        { ok: false, error: "dates_unavailable" },
        { status: 409 }
      )
    }

    const token = "8817599417:AAGtfqsyuuVkBtbAUgaIxqLmqm7yIne-Pnk"
    const chatId = "-5572001909"

    const formatDate = (iso: string) => {
      if (!iso) return "—"
      const [y, m, d] = iso.split("-")
      return `${d}.${m}.${y}`
    }

    const formatRub = (n: number) => n.toLocaleString("ru-RU") + " ₽"

    // Price calculation
    const PRICE_WEEKEND = 24_000
    const PRICE_WEEKDAY = 20_000
    const start = new Date(arrival)
    const end = new Date(departure)
    const nights = Math.round((end.getTime() - start.getTime()) / 86_400_000)
    let weekendNights = 0
    for (let i = 0; i < nights; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      const day = d.getDay()
      if (day === 5 || day === 6 || day === 0) weekendNights++
    }
    const weekdayNights = nights - weekendNights
    const total = weekendNights * PRICE_WEEKEND + weekdayNights * PRICE_WEEKDAY

    const priceLines = [
      nights > 0 ? `💰 Стоимость:` : null,
      weekendNights > 0 ? `   Выходные: ${weekendNights} н. × ${formatRub(PRICE_WEEKEND)} = ${formatRub(weekendNights * PRICE_WEEKEND)}` : null,
      weekdayNights > 0 ? `   Будни: ${weekdayNights} н. × ${formatRub(PRICE_WEEKDAY)} = ${formatRub(weekdayNights * PRICE_WEEKDAY)}` : null,
      nights > 0 ? `   Итого за ${nights} ночей: *${formatRub(total)}*` : null,
    ].filter(Boolean)

    const text = [
      "🏡 *Новая заявка на бронирование*",
      "",
      `📅 Заезд: *${formatDate(arrival)}*`,
      `📅 Выезд: *${formatDate(departure)}*`,
      `👥 Гостей: *${guests}*`,
      "",
      ...priceLines,
      "",
      `👤 Имя: *${name}*`,
      `📞 Телефон: *${phone}*`,
      email ? `✉️ Email: *${email}*` : null,
    ]
      .filter(Boolean)
      .join("\n")

    const url = `https://api.telegram.org/bot${token}/sendMessage`
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    })

    const data = await res.json()

    if (!data.ok) {
      console.error("[booking] Telegram error:", data.description)
      return NextResponse.json({ ok: false, error: data.description }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[booking] Unexpected error:", err)
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 })
  }
}
