"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import type { GuestReview } from "@/lib/reviews"

export function ReviewCard({ review, className }: { review: GuestReview; className?: string }) {
  return (
    <figure className={`flex flex-col border-t border-border pt-6 ${className ?? ""}`}>
      <div className="flex gap-1 text-accent" aria-label={`Оценка ${review.rating} из 5`}>
        {Array.from({ length: review.rating }).map((_, i) => (
          <Star key={i} className="size-3 fill-current" aria-hidden />
        ))}
      </div>
      <blockquote className="mt-5 flex-1 text-pretty font-display text-lg font-semibold leading-relaxed text-foreground/85 sm:text-xl">
        {review.text}
      </blockquote>
      <figcaption className="mt-6 flex items-baseline justify-between gap-4 text-[13px]">
        <span className="tracking-wide text-foreground">{review.name}</span>
        <span className="text-muted-foreground">{review.date}</span>
      </figcaption>
    </figure>
  )
}

/** Горизонтальная лента отзывов — свайп на телефоне, стрелки на десктопе. */
export function ReviewsRail({ reviews }: { reviews: GuestReview[] }) {
  const trackRef = useRef<HTMLDivElement>(null)

  const scrollBy = (dir: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: "smooth" })
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-8 overflow-x-auto overscroll-x-contain px-5 pb-2 sm:mx-0 sm:px-0"
      >
        {reviews.map((r) => (
          <ReviewCard
            key={r.id}
            review={r}
            className="w-[85vw] shrink-0 snap-start sm:w-[26rem]"
          />
        ))}
      </div>

      <div className="mt-8 hidden gap-2 sm:flex">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Предыдущие отзывы"
          className="flex size-11 items-center justify-center rounded-2xl border border-border text-foreground transition-colors hover:border-accent hover:text-accent"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Следующие отзывы"
          className="flex size-11 items-center justify-center rounded-2xl border border-border text-foreground transition-colors hover:border-accent hover:text-accent"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}

/** Полная сетка отзывов для страницы /reviews. */
export function ReviewsGrid({ reviews }: { reviews: GuestReview[] }) {
  return (
    <div className="grid gap-x-12 gap-y-12 md:grid-cols-2">
      {reviews.map((r) => (
        <ReviewCard key={r.id} review={r} />
      ))}
    </div>
  )
}
