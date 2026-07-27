'use client'

import { useState, useRef, useCallback, useId } from 'react'
import useSWR from 'swr'
import { Trash2, Star, Loader2, Upload, ImagePlus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GalleryItem } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface UploadingFile {
  id: string
  name: string
  previewUrl: string
  progress: 'uploading' | 'done' | 'error'
  errorMsg?: string
}

export function GallerySettings() {
  const { data, mutate } = useSWR('/api/admin/gallery', fetcher)
  const items: GalleryItem[] = data?.data ?? []

  const [uploading, setUploading] = useState<UploadingFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [altInput, setAltInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uid = useId()

  async function uploadFile(file: File) {
    const previewUrl = URL.createObjectURL(file)
    const id = `${uid}-${Date.now()}-${Math.random()}`

    setUploading((prev) => [...prev, { id, name: file.name, previewUrl, progress: 'uploading' }])

    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/gallery/upload', { method: 'POST', body: formData })
      const json = await res.json()

      if (!json.ok) throw new Error(json.error ?? 'Ошибка')

      // Save to gallery DB
      await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: json.url,
          alt: altInput.trim() || file.name.replace(/\.[^.]+$/, ''),
          sort_order: items.length,
        }),
      })

      setUploading((prev) => prev.map((u) => u.id === id ? { ...u, progress: 'done' } : u))
      mutate()

      // Clean up preview after short delay
      setTimeout(() => {
        setUploading((prev) => prev.filter((u) => u.id !== id))
        URL.revokeObjectURL(previewUrl)
      }, 1500)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка'
      setUploading((prev) => prev.map((u) => u.id === id ? { ...u, progress: 'error', errorMsg: msg } : u))
    }
  }

  async function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'))
    await Promise.all(arr.map(uploadFile))
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files)
  }, [items.length, altInput])

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = () => setIsDragging(false)

  async function deleteItem(id: string) {
    await fetch('/api/admin/gallery', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    mutate()
  }

  async function setMain(id: string) {
    await Promise.all(items.map((item) =>
      fetch('/api/admin/gallery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, is_main: item.id === id }),
      }),
    ))
    mutate()
  }

  const activeUploads = uploading.filter((u) => u.progress !== 'done')

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Галерея</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Управление фотографиями</p>
      </div>

      {/* Upload zone */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Добавить фото</h2>

        {/* Drag & drop zone — hidden on mobile, visible on md+ */}
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'hidden md:flex cursor-pointer flex-col items-center justify-center gap-3',
            'rounded-xl border-2 border-dashed py-10 transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-secondary/50',
          )}
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-secondary">
            <Upload className="size-5 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              Перетащите фото сюда или{' '}
              <span className="text-primary underline underline-offset-2">выберите файлы</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WebP — до 15 МБ каждый</p>
          </div>
        </div>

        {/* Mobile upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex md:hidden w-full items-center justify-center gap-2 h-12 rounded-xl border-2 border-dashed border-border bg-secondary/50 text-sm font-medium text-foreground hover:border-primary/50 transition-colors"
        >
          <ImagePlus className="size-5" />
          Загрузить фото с устройства
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          capture={undefined}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        {/* Optional alt text for batch */}
        <input
          type="text"
          value={altInput}
          onChange={(e) => setAltInput(e.target.value)}
          placeholder="Описание фото (необязательно)"
          className="mt-3 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />

        {/* Uploading previews */}
        {activeUploads.length > 0 && (
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
            {activeUploads.map((u) => (
              <div key={u.id} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-border bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u.previewUrl} alt={u.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-foreground/50">
                  {u.progress === 'uploading' && <Loader2 className="size-6 animate-spin text-white" />}
                  {u.progress === 'error' && (
                    <div className="flex flex-col items-center gap-1 px-2 text-center">
                      <X className="size-5 text-destructive" />
                      <span className="text-xs text-white leading-tight">{u.errorMsg}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gallery grid */}
      {items.length === 0 && uploading.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Фотографий пока нет</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative group rounded-xl overflow-hidden border border-border aspect-[4/3] bg-secondary"
            >
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
      )}
    </div>
  )
}
