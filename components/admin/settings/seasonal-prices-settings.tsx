'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Plus, Trash2, Loader2, Check, Pencil } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const SEASON_COLORS: Record<string, string> = {
  'Зима':  'bg-blue-50 border-blue-200 text-blue-800',
  'Весна': 'bg-green-50 border-green-200 text-green-800',
  'Лето':  'bg-amber-50 border-amber-200 text-amber-800',
  'Осень': 'bg-orange-50 border-orange-200 text-orange-800',
}

const MONTHS = [
  { value: '01', label: 'Янв' },
  { value: '02', label: 'Фев' },
  { value: '03', label: 'Мар' },
  { value: '04', label: 'Апр' },
  { value: '05', label: 'Май' },
  { value: '06', label: 'Июн' },
  { value: '07', label: 'Июл' },
  { value: '08', label: 'Авг' },
  { value: '09', label: 'Сен' },
  { value: '10', label: 'Окт' },
  { value: '11', label: 'Ноя' },
  { value: '12', label: 'Дек' },
]

function daysInMonth(month: string): number {
  const m = parseInt(month, 10)
  // Use a non-leap year reference: Feb = 28
  return new Date(2001, m, 0).getDate()
}

function getDays(month: string): string[] {
  const count = daysInMonth(month)
  return Array.from({ length: count }, (_, i) => String(i + 1).padStart(2, '0'))
}

// Parse MM-DD (handles both "08-01" and "08.01" and bare "0801")
function parseMmDd(raw: string): { mm: string; dd: string } {
  const cleaned = raw.replace(/[.\s/]/g, '-')
  const parts = cleaned.split('-')
  if (parts.length === 2) {
    return {
      mm: parts[0].padStart(2, '0'),
      dd: parts[1].padStart(2, '0'),
    }
  }
  // bare 4 digits like "0801"
  if (raw.length === 4) {
    return { mm: raw.slice(0, 2), dd: raw.slice(2, 4) }
  }
  return { mm: '01', dd: '01' }
}

// Selector for month + day
function MonthDayPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const { mm, dd } = parseMmDd(value)

  function setMm(newMm: string) {
    const days = getDays(newMm)
    const safeDay = days.includes(dd) ? dd : days[days.length - 1]
    onChange(`${newMm}-${safeDay}`)
  }

  function setDd(newDd: string) {
    onChange(`${mm}-${newDd}`)
  }

  const days = getDays(mm)

  const selectClass =
    'h-9 rounded-lg border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full'

  return (
    <div className="flex gap-1.5 mt-1">
      <select value={mm} onChange={(e) => setMm(e.target.value)} className={selectClass} aria-label="Месяц">
        {MONTHS.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
      <select value={dd} onChange={(e) => setDd(e.target.value)} className={selectClass} aria-label="День">
        {days.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
    </div>
  )
}

type Season = {
  id: string
  name: string
  date_from: string
  date_to: string
  base_price: number
  weekend_price: number
  active: boolean
  sort_order: number
}

function SeasonRow({
  season,
  onSave,
  onDelete,
}: {
  season: Season
  onSave: (id: string, data: Partial<Season>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Season>({ ...season })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saved, setSaved] = useState(false)

  // Reset form to latest season data when opening editor
  function openEditor() {
    setForm({ ...season })
    setEditing((v) => !v)
  }

  function upd<K extends keyof Season>(k: K, v: Season[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleSave() {
    setSaving(true)
    await onSave(season.id, {
      name: form.name,
      date_from: form.date_from,
      date_to: form.date_to,
      base_price: Number(form.base_price),
      weekend_price: Number(form.weekend_price),
      active: form.active,
    })
    setSaving(false)
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleDelete() {
    if (!confirm(`Удалить сезон «${season.name}»?`)) return
    setDeleting(true)
    await onDelete(season.id)
    setDeleting(false)
  }

  const colorClass =
    SEASON_COLORS[season.name] ?? 'bg-muted border-border text-foreground'

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
          >
            {season.name}
          </span>
          <span className="text-sm text-muted-foreground truncate">
            {season.date_from} — {season.date_to}
          </span>
          <span className="text-sm font-medium text-foreground">
            {Number(season.base_price).toLocaleString('ru')} /{' '}
            {Number(season.weekend_price).toLocaleString('ru')} ₽
          </span>
          {!season.active && (
            <span className="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5">
              Выкл
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {saved && <Check className="size-4 text-green-600" />}
          <button
            type="button"
            onClick={openEditor}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
          >
            {deleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
          </button>
        </div>
      </div>

      {editing && (
        <div className="border-t border-border px-5 py-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs text-muted-foreground">Название</label>
              <input
                value={form.name}
                onChange={(e) => upd('name', e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Начало сезона</label>
              <MonthDayPicker
                value={form.date_from}
                onChange={(v) => upd('date_from', v)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Конец сезона</label>
              <MonthDayPicker
                value={form.date_to}
                onChange={(v) => upd('date_to', v)}
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => upd('active', e.target.checked)}
                  className="rounded border-input"
                />
                Активен
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs text-muted-foreground">Цена будни, ₽</label>
              <input
                type="number"
                value={form.base_price}
                onChange={(e) => upd('base_price', Number(e.target.value))}
                className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Цена выходные, ₽</label>
              <input
                type="number"
                value={form.weekend_price}
                onChange={(e) => upd('weekend_price', Number(e.target.value))}
                className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="h-9 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Check className="size-4" />
                )}
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function SeasonalPricesSettings() {
  const { data, mutate } = useSWR('/api/admin/seasonal-prices', fetcher)
  const seasons: Season[] = data?.data ?? []

  const [adding, setAdding] = useState(false)
  const [newForm, setNewForm] = useState({
    name: '',
    date_from: '01-01',
    date_to: '01-31',
    base_price: 20000,
    weekend_price: 24000,
  })
  const [saving, setSaving] = useState(false)

  async function handleSave(id: string, body: Partial<Season>) {
    const res = await fetch(`/api/admin/seasonal-prices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    if (!json.ok) {
      console.error('[v0] seasonal-prices PATCH error:', json.error)
    }
    mutate()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/seasonal-prices/${id}`, { method: 'DELETE' })
    mutate()
  }

  async function handleAdd() {
    if (!newForm.name || !newForm.date_from || !newForm.date_to) return
    setSaving(true)
    const res = await fetch('/api/admin/seasonal-prices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newForm,
        base_price: Number(newForm.base_price),
        weekend_price: Number(newForm.weekend_price),
        active: true,
        sort_order: seasons.length + 1,
      }),
    })
    const json = await res.json()
    if (!json.ok) {
      console.error('[v0] seasonal-prices POST error:', json.error)
    }
    setNewForm({ name: '', date_from: '01-01', date_to: '01-31', base_price: 20000, weekend_price: 24000 })
    setAdding(false)
    setSaving(false)
    mutate()
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Сезонные цены</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Настройте цены для каждого сезона — они перекрывают базовые
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="size-4" /> Добавить
        </button>
      </div>

      {adding && (
        <div className="bg-card border border-border rounded-xl p-5 mb-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs text-muted-foreground">Название (напр. Зима)</label>
              <input
                value={newForm.name}
                onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Лето"
                className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Начало сезона</label>
              <MonthDayPicker
                value={newForm.date_from}
                onChange={(v) => setNewForm((f) => ({ ...f, date_from: v }))}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Конец сезона</label>
              <MonthDayPicker
                value={newForm.date_to}
                onChange={(v) => setNewForm((f) => ({ ...f, date_to: v }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs text-muted-foreground">Цена будни, ₽</label>
              <input
                type="number"
                value={newForm.base_price}
                onChange={(e) =>
                  setNewForm((f) => ({ ...f, base_price: Number(e.target.value) }))
                }
                className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Цена выходные, ₽</label>
              <input
                type="number"
                value={newForm.weekend_price}
                onChange={(e) =>
                  setNewForm((f) => ({ ...f, weekend_price: Number(e.target.value) }))
                }
                className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAdd}
                disabled={saving || !newForm.name}
                className="h-9 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                Добавить сезон
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {seasons.map((s) => (
          <SeasonRow key={s.id} season={s} onSave={handleSave} onDelete={handleDelete} />
        ))}
        {seasons.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-xl">
            Сезоны не добавлены
          </p>
        )}
      </div>
    </div>
  )
}
