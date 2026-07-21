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

function SeasonRow({ season, onSave, onDelete }: {
  season: Season
  onSave: (id: string, data: Partial<Season>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(season)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saved, setSaved] = useState(false)

  function upd(k: keyof Season, v: string | number | boolean) {
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

  const colorClass = SEASON_COLORS[season.name] ?? 'bg-muted border-border text-foreground'

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
            {season.name}
          </span>
          <span className="text-sm text-muted-foreground truncate">
            {season.date_from} — {season.date_to}
          </span>
          <span className="text-sm font-medium text-foreground">
            {season.base_price.toLocaleString('ru')} / {season.weekend_price.toLocaleString('ru')} ₽
          </span>
          {!season.active && (
            <span className="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5">Выкл</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {saved && <Check className="size-4 text-green-600" />}
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
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
            {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
          </button>
        </div>
      </div>

      {editing && (
        <div className="border-t border-border px-5 py-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="col-span-2 sm:col-span-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <label className="text-xs text-muted-foreground">Название</label>
              <input
                value={form.name}
                onChange={(e) => upd('name', e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Начало (MM-DD)</label>
              <input
                value={form.date_from}
                onChange={(e) => upd('date_from', e.target.value)}
                placeholder="06-01"
                className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Конец (MM-DD)</label>
              <input
                value={form.date_to}
                onChange={(e) => upd('date_to', e.target.value)}
                placeholder="08-31"
                className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-end pb-0.5">
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
          <div>
            <label className="text-xs text-muted-foreground">Цена будни, ₽</label>
            <input
              type="number"
              value={form.base_price}
              onChange={(e) => upd('base_price', e.target.value)}
              className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Цена выходные, ₽</label>
            <input
              type="number"
              value={form.weekend_price}
              onChange={(e) => upd('weekend_price', e.target.value)}
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
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
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
  const [newForm, setNewForm] = useState({ name: '', date_from: '', date_to: '', base_price: 20000, weekend_price: 24000 })
  const [saving, setSaving] = useState(false)

  async function handleSave(id: string, body: Partial<Season>) {
    await fetch(`/api/admin/seasonal-prices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    mutate()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/seasonal-prices/${id}`, { method: 'DELETE' })
    mutate()
  }

  async function handleAdd() {
    if (!newForm.name || !newForm.date_from || !newForm.date_to) return
    setSaving(true)
    await fetch('/api/admin/seasonal-prices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newForm, active: true, sort_order: seasons.length + 1 }),
    })
    setNewForm({ name: '', date_from: '', date_to: '', base_price: 20000, weekend_price: 24000 })
    setAdding(false)
    setSaving(false)
    mutate()
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Сезонные цены</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Настройте цены для каждого сезона — они перекрывают базовые</p>
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
        <div className="bg-card border border-border rounded-xl p-5 mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <label className="text-xs text-muted-foreground">Название (напр. Зима)</label>
            <input
              value={newForm.name}
              onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Зима"
              className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Начало (MM-DD)</label>
            <input
              value={newForm.date_from}
              onChange={(e) => setNewForm((f) => ({ ...f, date_from: e.target.value }))}
              placeholder="12-01"
              className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Конец (MM-DD)</label>
            <input
              value={newForm.date_to}
              onChange={(e) => setNewForm((f) => ({ ...f, date_to: e.target.value }))}
              placeholder="02-28"
              className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Цена будни, ₽</label>
            <input
              type="number"
              value={newForm.base_price}
              onChange={(e) => setNewForm((f) => ({ ...f, base_price: Number(e.target.value) }))}
              className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Цена выходные, ₽</label>
            <input
              type="number"
              value={newForm.weekend_price}
              onChange={(e) => setNewForm((f) => ({ ...f, weekend_price: Number(e.target.value) }))}
              className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleAdd}
              disabled={saving}
              className="h-9 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Добавить сезон
            </button>
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
