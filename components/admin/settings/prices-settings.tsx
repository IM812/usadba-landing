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
    base_guests: '', max_guests: '',
  })
  const [priceMode, setPriceMode] = useState<'base' | 'seasonal'>('base')

  useEffect(() => {
    if (s) {
      setForm({
        base_price: String(s.base_price ?? ''),
        weekend_price: String(s.weekend_price ?? ''),
        extra_guest_price: String(s.extra_guest_price ?? ''),
        minimum_nights: String(s.minimum_nights ?? '1'),
        cleaning_fee: String(s.cleaning_fee ?? ''),
        check_in_time: s.check_in_time ?? '14:00',
        check_out_time: s.check_out_time ?? '12:00',
        base_guests: String(s.base_guests ?? '8'),
        max_guests: String(s.max_guests ?? '15'),
      })
      setPriceMode(s.price_mode === 'seasonal' ? 'seasonal' : 'base')
    }
  }, [s])

  function update(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })) }

  async function handleSubmit() {
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base_price: parseInt(form.base_price) || 0,
        weekend_price: parseInt(form.weekend_price) || 0,
        extra_guest_price: parseInt(form.extra_guest_price) || 0,
        minimum_nights: parseInt(form.minimum_nights) || 1,
        cleaning_fee: parseInt(form.cleaning_fee) || 0,
        check_in_time: form.check_in_time,
        check_out_time: form.check_out_time,
        price_mode: priceMode,
        base_guests: parseInt(form.base_guests) || 8,
        max_guests: parseInt(form.max_guests) || 15,
      }),
    })
    const json = await res.json()
    if (!json.ok) throw new Error(json.error || 'Ошибка сохранения')
    mutate()
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Цены</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Ценообразование и условия бронирования</p>
      </div>

      {/* Priority toggle */}
      <div className="mb-5 rounded-xl border border-border bg-card p-4">
        <div className="mb-3">
          <p className="text-sm font-semibold text-foreground">Приоритет цен</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Определяет, какие цены используются при расчёте стоимости бронирования
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPriceMode('base')}
            className={`flex-1 rounded-lg border px-4 py-3 text-left transition-colors ${
              priceMode === 'base'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-muted-foreground hover:border-border/80 hover:text-foreground'
            }`}
          >
            <p className="text-sm font-semibold">Базовые цены</p>
            <p className="text-xs mt-0.5 opacity-75">
              Будни {form.base_price ? `${Number(form.base_price).toLocaleString('ru-RU')} ₽` : '—'} / Выходные{' '}
              {form.weekend_price ? `${Number(form.weekend_price).toLocaleString('ru-RU')} ₽` : '—'}
            </p>
          </button>
          <button
            type="button"
            onClick={() => setPriceMode('seasonal')}
            className={`flex-1 rounded-lg border px-4 py-3 text-left transition-colors ${
              priceMode === 'seasonal'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-muted-foreground hover:border-border/80 hover:text-foreground'
            }`}
          >
            <p className="text-sm font-semibold">Сезонные цены</p>
            <p className="text-xs mt-0.5 opacity-75">
              Базовые применяются вне сезонов
            </p>
          </button>
        </div>
        {priceMode === 'seasonal' && (
          <p className="mt-2.5 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            Если дата попадает в сезонный диапазон — используется цена из сезона. Вне сезонов применяются базовые цены.
          </p>
        )}
        {priceMode === 'base' && (
          <p className="mt-2.5 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            Сезонные цены игнорируются. Для всех дат используются только базовые цены ниже.
          </p>
        )}
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
        <FieldRow label="Базовое кол-во гостей" hint="Включено в цену без доплаты">
          <TextInput type="number" value={form.base_guests} onChange={(v) => update('base_guests', v)} min="1" max="50" />
        </FieldRow>
        <FieldRow label="Максимум гостей" hint="Больше — бронирование невозможно">
          <TextInput type="number" value={form.max_guests} onChange={(v) => update('max_guests', v)} min="1" max="50" />
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
