"use client"

import Image from "next/image"
import { useCallback, useEffect, useState } from "react"
import { X, ChevronLeft, ChevronRight, Expand } from "lucide-react"

const photos = [
  { src: "/images/real/photo2.jpg",  alt: "Ночная подсветка соснового леса зимой" },
  { src: "/images/real/photo3.jpg",  alt: "Сибирский чан с дымом осенью" },
  { src: "/images/real/photo4.jpg",  alt: "Баня весной на фоне соснового леса" },
  { src: "/images/real/photo5.jpg",  alt: "Чан с видом на озеро" },
  { src: "/images/real/photo6.jpg",  alt: "Вид на озеро через сосны" },
  { src: "/images/real/photo1.jpg",  alt: "Терраса с подвесным креслом осенью" },
  { src: "/images/real/photo12.jpg", alt: "Дорожка к озеру летом" },
  { src: "/images/real/photo9.jpg",  alt: "Камин в гостиной" },
  { src: "/images/real/photo7.jpg",  alt: "Уютная спальня с бревенчатыми стенами" },
]

export function Gallery() {
  const [lightbox, setLightbox] = useState<number | null>(null)

  const close = useCallback(() => setLightbox(null), [])
  const prev = useCallback(
    () => setLightbox((i) => (i === null ? null : (i - 1 + photos.length) % photos.length)),
    [],
  )
  const next = useCallback(
    () => setLightbox((i) => (i === null ? null : (i + 1) % photos.length)),
    [],
  )

  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [lightbox, close, prev, next])

  return (
    <section id="gallery" className="bg-secondary py-16 sm:py-28">
      <div data-reveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Галерея</p>
            <h2 className="mt-3 text-balance font-serif text-4xl leading-tight text-foreground sm:text-5xl">
              Загляните в усадьбу
            </h2>
          </div>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Expand className="h-4 w-4" aria-hidden="true" />
            Нажмите на фото, чтобы развернуть
          </p>
        </div>

        {/* Mobile: 1 big + 2-col grid. Desktop: bento 3-col */}
        <div className="grid grid-cols-2 gap-2 sm:auto-rows-[200px] sm:grid-cols-3 sm:gap-4 [&>*:first-child]:col-span-2 [&>*:first-child]:aspect-[16/9] sm:[&>*:first-child]:col-span-2 sm:[&>*:first-child]:row-span-2 sm:[&>*:first-child]:aspect-auto">
          {photos.map((p, i) => (
            <button
              key={p.src}
              type="button"
              onClick={() => setLightbox(i)}
              className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:aspect-auto sm:rounded-2xl"
              aria-label={`Открыть фото: ${p.alt}`}
            >
              <Image
                src={p.src || "/placeholder.svg"}
                alt={p.alt}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="absolute bottom-3 left-4 right-4 text-left text-sm font-medium text-primary-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {p.alt}
              </span>
              <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/70 opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
                <Expand className="h-4 w-4 text-foreground" aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={photos[lightbox].alt}
          className="fixed inset-0 z-[100] flex flex-col bg-foreground/95 backdrop-blur-sm"
          onClick={close}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <span className="text-sm font-medium text-background/70">
              {lightbox + 1} / {photos.length}
            </span>
            <button
              type="button"
              onClick={close}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/20"
              aria-label="Закрыть"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Image */}
          <div className="relative flex-1 px-2 sm:px-16" onClick={(e) => e.stopPropagation()}>
            <Image
              src={photos[lightbox].src || "/placeholder.svg"}
              alt={photos[lightbox].alt}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />

            {/* Prev / Next */}
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/10 text-background backdrop-blur transition-colors hover:bg-background/25 sm:left-4 sm:h-12 sm:w-12"
              aria-label="Предыдущее фото"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/10 text-background backdrop-blur transition-colors hover:bg-background/25 sm:right-4 sm:h-12 sm:w-12"
              aria-label="Следующее фото"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Caption + thumbnails */}
          <div className="px-4 pb-4 pt-3 sm:px-6" onClick={(e) => e.stopPropagation()}>
            <p className="mb-3 text-center text-sm text-background/80">{photos[lightbox].alt}</p>
            <div className="mx-auto flex max-w-full justify-start gap-2 overflow-x-auto pb-1 sm:justify-center">
              {photos.map((p, i) => (
                <button
                  key={p.src}
                  type="button"
                  onClick={() => setLightbox(i)}
                  className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-md transition-all sm:h-14 sm:w-20 ${
                    i === lightbox
                      ? "ring-2 ring-background ring-offset-2 ring-offset-foreground"
                      : "opacity-50 hover:opacity-100"
                  }`}
                  aria-label={`Фото ${i + 1}: ${p.alt}`}
                  aria-current={i === lightbox}
                >
                  <Image src={p.src || "/placeholder.svg"} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
