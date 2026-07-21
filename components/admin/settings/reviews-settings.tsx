'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Plus, Trash2, Eye, EyeOff, Star, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Review } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const emptyForm = { author: '', text: '', rating: '5', date: '' }

export function ReviewsSettings() {
  const { data, mutate } = useSWR('/api/admin/reviews', fetcher)
  const items: Review[] = data?.data ?? []

  const [form, setForm] = useState(emptyForm)
  const [adding, setAdding] = useState(false)
  const [showAdd, setShowAdd] = useState(false)

  function update(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })) }

  async function addItem() {
    if (!form.author.trim() || !form.text.trim()) return
    setAdding(true)
    try {
      await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: form.author.trim(),
          text: form.text.trim(),
          rating: parseInt(form.rating) || 5,
          date: form.date.trim(),
          sort_order: items.length,
        }),
      })
      setForm(emptyForm)
      setShowAdd(false)
      mutate()
    } finally {
      setAdding(false)
    }
  }

  async function toggleVisible(item: Review) {
    await fetch('/api/admin/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, is_visible: !item.is_visible }),
    })
    mutate()
  }

  async function deleteItem(id: string) {
    await fetch('/api/admin/reviews', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    mutate()
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Отзывы</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{items.length} отзывов</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="size-4" />
          Добавить
        </button>
      </div>

      {showAdd && (
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Новый отзыв</h2>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Имя автора" value={form.author}
                onChange={(e) => update('author', e.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              <input type="text" placeholder="Дата (напр. Июль 2025)" value={form.date}
                onChange={(e) => update('date', e.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Рейтинг:</span>
              {[1,2,3,4,5].map((n) => (
                <button key={n} type="button" onClick={() => update('rating', String(n))}>
                  <Star className={cn('size-5', parseInt(form.rating) >= n ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground')} />
                </button>
              ))}
            </div>
            <textarea placeholder="Текст отзыва" value={form.text}
              onChange={(e) => update('text', e.target.value)} rows={4}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(false)}
                className="h-9 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                Отмена
              </button>
              <button onClick={addItem} disabled={adding || !form.author.trim() || !form.text.trim()}
                className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                {adding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Отзывов пока нет</p>
        )}
        {items.map((item) => (
          <div key={item.id} className={cn('bg-card border border-border rounded-xl p-4', !item.is_visible && 'opacity-60')}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="text-sm font-medium text-foreground">{item.author}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {[1,2,3,4,5].map((n) => (
                    <Star key={n} className={cn('size-3', item.rating >= n ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground')} />
                  ))}
                  {item.date && <span className="text-xs text-muted-foreground ml-1">{item.date}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleVisible(item)} className="text-muted-foreground hover:text-foreground transition-colors p-1" title={item.is_visible ? 'Скрыть' : 'Показать'}>
                  {item.is_visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>
                <button onClick={() => deleteItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
