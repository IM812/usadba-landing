import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = createServiceClient()

  const { data: settings } = await supabase
    .from('settings')
    .select('telegram_bot_token, telegram_chat_id')
    .eq('id', 1)
    .single()

  const token = settings?.telegram_bot_token
  const chatId = settings?.telegram_chat_id

  if (!token || !chatId) {
    return NextResponse.json({ ok: false, error: 'Bot token or chat ID not configured' }, { status: 400 })
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: '✅ *Тестовое сообщение от Усадьбы*\n\nTelegram-уведомления настроены корректно.',
      parse_mode: 'Markdown',
    }),
  })

  const data = await res.json()
  if (!data.ok) {
    return NextResponse.json({ ok: false, error: data.description }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
