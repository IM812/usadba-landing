'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Trash2, Star, Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GalleryItem } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function GallerySettings() {
  const { data, mutate } = useSWR('/api/admin/gallery', fetcher)
  const items: GalleryItem[] = data?.data ?? []

  const [url, setUrl] = useState('')
  const [alt, setAlt] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function addItem() {
    if (!url.trim()) return
    setAdding(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), alt: alt.trim(), sort_order: items.length }),
      })
      const d = await res.json()
      if (!d.ok) { setError(d.error || 'Ошибка'); return }
      setUrl(''); setAlt('')
      mutate()
    } catch {
      setError('Ошибка подключения')
    } finally {
      setAdding(false)
    }
  }

  async function deleteItem(id: string) {
    await fetch('/api/admin/gallery', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    mutate()
  }

  async function setMain(id: string) {
    // Unset all, then set this one
    await Promise.all(items.map((item) =>
      fetch('/api/admin/gallery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, is_main: item.id === id }),
      }),
    ))
    mutate()
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Галерея</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Управление фотографиями</p>
      </div>

      {/* Add form */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Добавить фото</h2>
        <div className="flex flex-col gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="text"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Описание фото (alt-текст)"
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            onClick={addItem}
            disabled={adding || !url.trim()}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity self-start"
          >
            {adding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Добавить
          </button>
        </div>
      </div>

      {/* Gallery grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {items.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground text-center py-8">Фотографий пока нет</p>
        )}
        {items.map((item) => (
          <div key={item.id} className="relative group rounded-xl overflow-hidden border border-border aspect-[4/3] bg-secondary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.url}
              alt={item.alt || 'Фото усадьбы'}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3' }}
            />
            {item.is_main && (
              <span className="absolute top-2 left-2 bg-amber-400 text-amber-900 text-xs font-medium px-2 py-0.5 rounded-full">
                Главное
              </span>
            )}
            <div className={cn(
              'absolute inset-0 bg-foreground/60 flex items-center justify-center gap-2',
              'opacity-0 group-hover:opacity-100 transition-opacity',
            )}>
              <button
                onClick={() => setMain(item.id)}
                title="Сделать главным"
                className="size-8 rounded-full bg-amber-400 flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <Star className="size-4 text-amber-900" />
              </button>
              <button
                onClick={() => deleteItem(item.id)}
                title="Удалить"
                className="size-8 rounded-full bg-destructive flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <Trash2 className="size-4 text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
