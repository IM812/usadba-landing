'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { SettingsForm, FieldRow, TextInput } from './settings-form'
import { SeasonalPricesSettings } from './seasonal-prices-settings'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function PricesSettings() {
  const { data, mutate } = useSWR('/api/admin/settings', fetcher)
  const s = data?.data

  const [form, setForm] = useState({
    base_price: '', weekend_price: '', extra_guest_price: '',
    minimum_nights: '', cleaning_fee: '', check_in_time: '', check_out_time: '',
  })

  useEffect(() => {
    if (s) setForm({
      base_price: String(s.base_price),
      weekend_price: String(s.weekend_price),
      extra_guest_price: String(s.extra_guest_price),
      minimum_nights: String(s.minimum_nights),
      cleaning_fee: String(s.cleaning_fee),
      check_in_time: s.check_in_time,
      check_out_time: s.check_out_time,
    })
  }, [s])

  function update(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })) }

  async function handleSubmit() {
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base_price: parseInt(form.base_price),
        weekend_price: parseInt(form.weekend_price),
        extra_guest_price: parseInt(form.extra_guest_price),
        minimum_nights: parseInt(form.minimum_nights),
        cleaning_fee: parseInt(form.cleaning_fee),
        check_in_time: form.check_in_time,
        check_out_time: form.check_out_time,
      }),
    })
    const data = await res.json()
    if (!data.ok) throw new Error(data.error || 'Ошибка сохранения')
    mutate()
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Цены</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Ценообразование и условия бронирования</p>
      </div>

      <SettingsForm title="Базовые цены" onSubmit={handleSubmit}>
        <FieldRow label="Цена (будни)" hint="Пн–Чт за ночь, ₽">
          <TextInput type="number" value={form.base_price} onChange={(v) => update('base_price', v)} />
        </FieldRow>
        <FieldRow label="Цена (выходные)" hint="Пт–Вс за ночь, ₽">
          <TextInput type="number" value={form.weekend_price} onChange={(v) => update('weekend_price', v)} />
        </FieldRow>
        <FieldRow label="Доп. гость" hint="За каждого гостя сверх базы, ₽">
          <TextInput type="number" value={form.extra_guest_price} onChange={(v) => update('extra_guest_price', v)} />
        </FieldRow>
        <FieldRow label="Стоимость уборки" hint="Фиксированная сумма, ₽">
          <TextInput type="number" value={form.cleaning_fee} onChange={(v) => update('cleaning_fee', v)} />
        </FieldRow>
        <FieldRow label="Минимум ночей">
          <TextInput type="number" value={form.minimum_nights} onChange={(v) => update('minimum_nights', v)} />
        </FieldRow>
        <FieldRow label="Время заезда">
          <TextInput type="time" value={form.check_in_time} onChange={(v) => update('check_in_time', v)} />
        </FieldRow>
        <FieldRow label="Время выезда">
          <TextInput type="time" value={form.check_out_time} onChange={(v) => update('check_out_time', v)} />
        </FieldRow>
      </SettingsForm>

      <SeasonalPricesSettings />
    </div>
  )
}
