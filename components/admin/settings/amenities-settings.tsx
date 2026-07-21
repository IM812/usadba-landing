'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import type { Amenity } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function AmenitiesSettings() {
  const { data, mutate } = useSWR('/api/admin/amenities', fetcher)
  const items: Amenity[] = data?.data ?? []

  const [label, setLabel] = useState('')
  const [icon, setIcon] = useState('check')
  const [adding, setAdding] = useState(false)

  async function addItem() {
    if (!label.trim()) return
    setAdding(true)
    try {
      await fetch('/api/admin/amenities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: label.trim(), icon: icon.trim() || 'check', sort_order: items.length }),
      })
      setLabel(''); setIcon('check')
      mutate()
    } finally {
      setAdding(false)
    }
  }

  async function deleteItem(id: string) {
    await fetch('/api/admin/amenities', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    mutate()
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Удобства</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Список удобств на объекте</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Добавить удобство</h2>
        </div>
        <div className="p-5 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Название (напр. Баня)"
            className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="Иконка (check, wifi...)"
            className="w-40 h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={addItem}
            disabled={adding || !label.trim()}
            className="flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity shrink-0"
          >
            {adding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Добавить
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Название</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Иконка</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-12"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">Пусто</td></tr>
            )}
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-foreground">{item.label}</td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{item.icon}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
