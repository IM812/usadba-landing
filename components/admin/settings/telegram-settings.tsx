'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { Loader2, Check, Send } from 'lucide-react'
import { SettingsForm, FieldRow, TextInput } from './settings-form'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function TelegramSettings() {
  const { data, mutate } = useSWR('/api/admin/settings', fetcher)
  const s = data?.data

  const [form, setForm] = useState({ telegram_bot_token: '', telegram_chat_id: '' })
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)

  useEffect(() => {
    if (s) setForm({ telegram_bot_token: s.telegram_bot_token, telegram_chat_id: s.telegram_chat_id })
  }, [s])

  function update(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })) }

  async function handleSave() {
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!data.ok) throw new Error(data.error || 'Ошибка')
    mutate()
  }

  async function sendTest() {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/admin/telegram-test', { method: 'POST' })
      const data = await res.json()
      setTestResult({ ok: data.ok, message: data.ok ? 'Сообщение отправлено!' : (data.error || 'Ошибка') })
    } catch {
      setTestResult({ ok: false, message: 'Ошибка подключения' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Telegram</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Настройка уведомлений о новых заявках</p>
      </div>

      <SettingsForm
        title="Настройки бота"
        description="Создайте бота через @BotFather и получите токен. Chat ID — ваш Telegram ID или ID группы."
        onSubmit={handleSave}
      >
        <FieldRow label="Bot Token" hint="Токен от @BotFather">
          <TextInput
            type="password"
            value={form.telegram_bot_token}
            onChange={(v) => update('telegram_bot_token', v)}
            placeholder="1234567890:AAA..."
          />
        </FieldRow>
        <FieldRow label="Chat ID" hint="ID чата или пользователя">
          <TextInput
            value={form.telegram_chat_id}
            onChange={(v) => update('telegram_chat_id', v)}
            placeholder="-1001234567890"
          />
        </FieldRow>
      </SettingsForm>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-sm font-semibold text-foreground mb-1">Проверка подключения</h2>
        <p className="text-xs text-muted-foreground mb-4">Отправьте тестовое сообщение, чтобы убедиться что бот работает.</p>
        <button
          onClick={sendTest}
          disabled={testing}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {testing ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          Отправить тестовое сообщение
        </button>
        {testResult && (
          <div className={`mt-3 flex items-center gap-2 text-sm ${testResult.ok ? 'text-green-600' : 'text-destructive'}`}>
            {testResult.ok ? <Check className="size-4" /> : null}
            {testResult.message}
          </div>
        )}
      </div>
    </div>
  )
}
