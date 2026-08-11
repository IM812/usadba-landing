"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type Photo = { src: string; alt: string; caption?: string }

/**
 * Редакционная сетка фотографий с лайтбоксом.
 * Первый кадр — крупный, дальше ритм 2 + 1 + 2, чтобы страница дышала.
 */
export function PhotoGrid({ photos, className }: { photos: readonly Photo[]; className?: string }) {
  const [open, setOpen] = useState<number | null>(null)
  const touchStart = useRef<number | null>(null)

  const close = useCallback(() => setOpen(null), [])
  const next = useCallback(
    () => setOpen((i) => (i === null ? null : (i + 1) % photos.length)),
    [photos.length],
  )
  const prev = useCallback(
    () => setOpen((i) => (i === null ? null : (i - 1 + photos.length) % photos.length)),
    [photos.length],
  )

  useEffect(() => {
    if (open === null) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
      if (e.key === "ArrowRight") next()
      if (e.key === "ArrowLeft") prev()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", onKey)
    }
  }, [open, close, next, prev])

  return (
    <>
      <div className={cn("grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6", className)}>
        {photos.map((p, i) => {
          // Ритм сетки: каждый пятый кадр занимает больше места
          const wide = i % 5 === 0
          return (
            <button
              key={p.src + i}
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Открыть фотографию: ${p.alt}`}
              className={cn(
                "group relative overflow-hidden rounded-sm bg-secondary",
                wide
                  ? "col-span-2 aspect-4/3 lg:col-span-4 lg:row-span-2 lg:aspect-auto lg:min-h-[28rem]"
                  : "aspect-square lg:col-span-2",
              )}
            >
              <Image
                src={p.src || "/placeholder.svg"}
                alt={p.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 40vw"
                className="object-cover transition-transform duration-[1.1s] ease-out group-hover:scale-[1.05]"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-background/0 transition-colors duration-500 group-hover:bg-background/20"
              />
              {p.caption ? (
                <span className="on-dark absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-4 text-left text-[13px] text-foreground/90 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {p.caption}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {open !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Просмотр фотографии"
          // Лайтбокс всегда тёмный: фотография должна светиться, а не
          // соревноваться в яркости с песочным фоном страницы
          className="on-dark fixed inset-0 z-70 flex flex-col bg-background/97 backdrop-blur-sm"
          onTouchStart={(e) => {
            touchStart.current = e.touches[0].clientX
          }}
          onTouchEnd={(e) => {
            if (touchStart.current === null) return
            const dx = e.changedTouches[0].clientX - touchStart.current
            if (Math.abs(dx) > 48) (dx < 0 ? next : prev)()
            touchStart.current = null
          }}
        >
          <div className="flex shrink-0 items-center justify-between px-4 py-4 sm:px-8">
            <span className="eyebrow text-muted-foreground">
              {open + 1} / {photos.length}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Закрыть просмотр"
              className="flex size-11 items-center justify-center rounded-sm border border-border text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>

          <div className="relative min-h-0 flex-1">
            <Image
              key={photos[open].src}
              src={photos[open].src || "/placeholder.svg"}
              alt={photos[open].alt}
              fill
              sizes="100vw"
              className="animate-in fade-in object-contain duration-500"
            />
          </div>

          <div className="flex shrink-0 items-center justify-between gap-4 px-4 py-5 pb-safe sm:px-8">
            <button
              type="button"
              onClick={prev}
              aria-label="Предыдущая фотография"
              className="flex size-12 items-center justify-center rounded-sm border border-border text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <p className="flex-1 text-pretty text-center text-[13px] leading-relaxed text-muted-foreground">
              {photos[open].caption ?? photos[open].alt}
            </p>
            <button
              type="button"
              onClick={next}
              aria-label="Следующая фотография"
              className="flex size-12 items-center justify-center rounded-sm border border-border text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
