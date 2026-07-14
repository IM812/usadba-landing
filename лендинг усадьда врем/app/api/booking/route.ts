import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { arrival, departure, guests, name, phone, email } = body

    const token = "8817599417:AAGtfqsyuuVkBtbAUgaIxqLmqm7yIne-Pnk"
    const chatId = "-5572001909"

    const formatDate = (iso: string) => {
      if (!iso) return "—"
      const [y, m, d] = iso.split("-")
      return `${d}.${m}.${y}`
    }

    const text = [
      "🏡 *Новая заявка на бронирование*",
      "",
      `📅 Заезд: *${formatDate(arrival)}*`,
      `📅 Выезд: *${formatDate(departure)}*`,
      `👥 Гостей: *${guests}*`,
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
