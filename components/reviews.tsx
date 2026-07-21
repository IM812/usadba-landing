"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Star, Quote, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"

const YANDEX_URL = "https://yandex.ru/maps/org/usadba_v_antropkovo/216703670267/reviews/"

const staticReviews = [
  {
    name: "Гость усадьбы",
    date: "Ноябрь 2024",
    rating: 5,
    text: "Отлично провели время всей семьей, 2 взрослых и 3 детей! Мега чистая территория, ухоженный дом, 4 спальни и в каждой спальне туалет и душ. Весь персонал очень гостеприимный. Место очень красивое — наловили рыбы, набрали грибов, надышались свежим воздухом! Баня небольшая, но очень уютная и чистая, чан с видом на озеро и лес — восторг.",
  },
  {
    name: "Гость усадьбы",
    date: "Сентябрь 2024",
    rating: 5,
    text: "Провели несколько дней в этом чудесном уединённом месте. 5 часов от Москвы — и вы в усадьбе с собственным пляжем, баней, чаном на берегу. Дети резвятся, взрослые смотрят на них из окна кухни, неторопливо готовя обед — сказка. Вечером — барбекю, баня, прогулки на лодках и сап-бордах. Идеальная перезагрузка.",
  },
  {
    name: "Гость усадьбы",
    date: "Июнь 2025",
    rating: 5,
    text: "Мега прекрасное место в Псковской области! Красиво, уютно, пение птиц, ароматы цветов и леса. Шикарный дом — просторный, современный, кухня оборудована всем необходимым и даже больше! Идеальная чистота. Море развлечений: баня, подогреваемый чан на улице, рыбалка, велосипеды, лодка, сап-сёрф, бадминтон, теннис...",
  },
  {
    name: "Гость усадьбы",
    date: "Сентябрь 2023",
    rating: 5,
    text: "Чудесное местечко! Дом огромный, просторный — самое то для большой семьи. Уютные спальни, чистые туалетные комнаты, огромная гостиная с камином, полки с книгами, кухня с красивой посудой. Баня и сибирский чан на берегу озера — отдельный вид блаженства!",
  },
  {
    name: "Гость усадьбы",
    date: "Декабрь 2023",
    rating: 5,
    text: "Шикарное место, очень уютно и комфортно. Отдельные комнаты, санузлы. А какая атмосфера и вид зимой!! Никого из гостей не оставили равнодушными баня и чан — это восторг. Крутая идея, здорово что это в Псковской области. Уверена, летом здесь также красиво и душевно.",
  },
  {
    name: "Гость усадьбы",
    date: "Июль 2024",
    rating: 5,
    text: "Отличное место для отдыха. Чувствуется что хозяева вложили сердце и большой труд в усадьбу и территорию. И внутри и снаружи уютно и комфортно, есть всё необходимое. Даже в непогоду найдётся чем заняться. Хозяева отличные, большое им спасибо за гостеприимство!",
  },
]

export function Reviews() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)
  const [visibleCount, setVisibleCount] = useState(3)

  useEffect(() => {
    function measure() {
      const w = window.innerWidth
      if (w >= 1280) setVisibleCount(3)
      else if (w >= 768) setVisibleCount(2)
      else setVisibleCount(1)
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  const total = staticReviews.length
  const maxIndex = Math.max(0, total - visibleCount)

  const prev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), [])
  const next = useCallback(() => setCurrent((c) => Math.min(maxIndex, c + 1)), [maxIndex])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const card = track.children[current] as HTMLElement | undefined
    if (card) {
      track.scrollTo({ left: card.offsetLeft - 16, behavior: "smooth" })
    }
  }, [current])

  // card width as fraction of container minus gaps
  const cardWidth =
    visibleCount === 1
      ? "100%"
      : visibleCount === 2
      ? "calc(50% - 8px)"
      : "calc(33.333% - 11px)"

  return (
    <section id="reviews" className="bg-background py-16 sm:py-28 overflow-hidden">
      <div data-reveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Отзывы</p>
            <h2 className="mt-3 text-balance font-serif text-3xl leading-tight text-foreground sm:text-5xl">
              Что говорят гости
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex w-fit items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
              <div className="flex gap-0.5 text-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <span className="font-serif text-xl font-medium text-foreground">5,0</span>
              <span className="text-sm text-muted-foreground">· 41 отзыв</span>
            </div>
            <a
              href={YANDEX_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Читать на Яндексе <ExternalLink className="size-3.5 text-muted-foreground" />
            </a>
          </div>
        </div>

        {/* Slider track */}
        <div className="relative">
          <div
            ref={trackRef}
            className="flex gap-4 overflow-x-hidden pb-2"
          >
            {staticReviews.map((r, idx) => (
              <article
                key={idx}
                style={{ minWidth: cardWidth, maxWidth: cardWidth }}
                className="shrink-0 flex flex-col rounded-2xl border border-border bg-card p-6 sm:p-7"
              >
                <Quote className="size-7 shrink-0 text-accent" />

                <div className="mt-3 flex gap-0.5 text-accent">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-current" />
                  ))}
                </div>

                {/* Text — no clamp, natural height */}
                <blockquote className="mt-4 text-pretty text-[15px] leading-relaxed text-muted-foreground">
                  {r.text}
                </blockquote>

                <footer className="mt-6 border-t border-border pt-4">
                  <p className="font-serif text-base font-medium text-foreground">{r.name}</p>
                  <p className="text-sm text-muted-foreground">{r.date}</p>
                </footer>
              </article>
            ))}
          </div>

          {/* Controls */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-1.5">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrent(i)}
                  aria-label={`Отзыв ${i + 1}`}
                  className={`rounded-full transition-all duration-200 ${
                    i === current
                      ? "w-6 h-2 bg-primary"
                      : "w-2 h-2 bg-border hover:bg-muted-foreground"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={prev}
                disabled={current === 0}
                aria-label="Предыдущий отзыв"
                className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={next}
                disabled={current >= maxIndex}
                aria-label="Следующий отзыв"
                className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
        </div>

        {/* CTA banner */}
        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-6 sm:flex-row sm:justify-between">
          <div>
            <p className="font-serif text-lg text-foreground">Были у нас? Оставьте отзыв!</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Ваш опыт поможет другим гостям принять решение</p>
          </div>
          <a
            href={YANDEX_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Написать на Яндексе <ExternalLink className="size-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
