'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { Copy, Check, RefreshCw } from 'lucide-react'
import { SettingsForm, FieldRow, TextInput } from './settings-form'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function IcsSettings() {
  const { data: settingsData, mutate } = useSWR('/api/admin/settings', fetcher)
  const s = settingsData?.data

  const [form, setForm] = useState({ avito_ics_url: '', site_url: '' })
  const [copied, setCopied] = useState(false)
  const [avitoStatus, setAvitoStatus] = useState<{ count: number; fetchedAt: string | null } | null>(null)
  const [loadingSync, setLoadingSync] = useState(false)

  useEffect(() => {
    if (s) setForm({ avito_ics_url: s.avito_ics_url, site_url: s.site_url })
  }, [s])

  function update(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })) }

  async function handleSave() {
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const d = await res.json()
    if (!d.ok) throw new Error(d.error || 'Ошибка')
    mutate()
  }

  const icsLink = form.site_url ? `${form.site_url}/api/calendar.ics` : '/api/calendar.ics'

  async function copyIcsLink() {
    const full = form.site_url
      ? `${form.site_url}/api/calendar.ics`
      : `${window.location.origin}/api/calendar.ics`
    await navigator.clipboard.writeText(full)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function syncAvito() {
    setLoadingSync(true)
    try {
      const res = await fetch('/api/availability')
      const d = await res.json()
      const myBookings = await fetch('/api/admin/bookings').then((r) => r.json())
      const myRanges = (myBookings?.data ?? []).filter((b: { status: string }) => b.status === 'confirmed')
      const avitoCount = (d.ranges?.length ?? 0) - myRanges.length
      setAvitoStatus({ count: Math.max(0, avitoCount), fetchedAt: new Date().toLocaleString('ru-RU') })
    } finally {
      setLoadingSync(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">ICS Синхронизация</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Двусторонняя синхронизация с Avito</p>
      </div>

      {/* Own ICS */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-sm font-semibold text-foreground mb-1">Ваш ICS-календарь</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Добавьте эту ссылку в объявление на Avito, чтобы ваши брони блокировали даты.
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-lg bg-secondary px-3 py-2 text-xs text-foreground font-mono truncate">
            {icsLink}
          </code>
          <button
            onClick={copyIcsLink}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? 'Скопировано' : 'Копировать'}
          </button>
        </div>
      </div>

      {/* Avito ICS */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-sm font-semibold text-foreground mb-1">Avito ICS</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Статус синхронизации занятых дат с Avito.
        </p>
        <button
          onClick={syncAvito}
          disabled={loadingSync}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${loadingSync ? 'animate-spin' : ''}`} />
          Проверить синхронизацию
        </button>
        {avitoStatus && (
          <div className="mt-3 rounded-lg bg-secondary px-4 py-3 text-sm space-y-1">
            <p className="text-foreground">Статус: <span className="text-green-600 font-medium">Подключено</span></p>
            <p className="text-muted-foreground">Событий Avito: {avitoStatus.count}</p>
            <p className="text-muted-foreground">Обновлено: {avitoStatus.fetchedAt}</p>
          </div>
        )}
      </div>

      <SettingsForm title="Настройки" onSubmit={handleSave}>
        <FieldRow label="Avito ICS URL" hint="Ссылка на экспорт календаря Avito">
          <TextInput
            value={form.avito_ics_url}
            onChange={(v) => update('avito_ics_url', v)}
            placeholder="https://www.avito.ru/calendars-export/..."
          />
        </FieldRow>
        <FieldRow label="URL сайта" hint="Для генерации полных ссылок">
          <TextInput
            value={form.site_url}
            onChange={(v) => update('site_url', v)}
            placeholder="https://yourdomain.ru"
          />
        </FieldRow>
      </SettingsForm>
    </div>
  )
}
