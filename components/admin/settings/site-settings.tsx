'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { SettingsForm, FieldRow, TextInput, TextareaInput } from './settings-form'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function SiteSettings() {
  const { data, mutate } = useSWR('/api/admin/settings', fetcher)
  const s = data?.data

  const [form, setForm] = useState({
    title: '', subtitle: '', description: '',
    phone: '', email: '', address: '',
    telegram: '', whatsapp: '',
  })

  useEffect(() => {
    if (s) setForm({
      title: s.title ?? '',
      subtitle: s.subtitle ?? '',
      description: s.description ?? '',
      phone: s.phone ?? '',
      email: s.email ?? '',
      address: s.address ?? '',
      telegram: s.telegram ?? '',
      whatsapp: s.whatsapp ?? '',
    })
  }, [s])

  function update(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })) }

  async function save(fields: Partial<typeof form>) {
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    })
    const data = await res.json()
    if (!data.ok) throw new Error(data.error || 'Ошибка')
    mutate()
  }

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
      <div className="mb-0">
        <h1 className="text-2xl font-semibold text-foreground">Контент сайта</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Тексты и контактная информация</p>
      </div>

      <SettingsForm title="Основное" onSubmit={() => save({ title: form.title, subtitle: form.subtitle, description: form.description })}>
        <FieldRow label="Название">
          <TextInput value={form.title} onChange={(v) => update('title', v)} />
        </FieldRow>
        <FieldRow label="Подзаголовок">
          <TextInput value={form.subtitle} onChange={(v) => update('subtitle', v)} />
        </FieldRow>
        <FieldRow label="Описание">
          <TextareaInput value={form.description} onChange={(v) => update('description', v)} rows={5} />
        </FieldRow>
      </SettingsForm>

      <SettingsForm title="Контакты" onSubmit={() => save({ phone: form.phone, email: form.email, address: form.address, telegram: form.telegram, whatsapp: form.whatsapp })}>
        <FieldRow label="Телефон">
          <TextInput type="tel" value={form.phone} onChange={(v) => update('phone', v)} />
        </FieldRow>
        <FieldRow label="Email">
          <TextInput type="email" value={form.email} onChange={(v) => update('email', v)} />
        </FieldRow>
        <FieldRow label="Адрес">
          <TextInput value={form.address} onChange={(v) => update('address', v)} />
        </FieldRow>
        <FieldRow label="Telegram" hint="@username или ссылка">
          <TextInput value={form.telegram} onChange={(v) => update('telegram', v)} />
        </FieldRow>
        <FieldRow label="WhatsApp" hint="Номер в формате +7...">
          <TextInput value={form.whatsapp} onChange={(v) => update('whatsapp', v)} />
        </FieldRow>
      </SettingsForm>
    </div>
  )
}
