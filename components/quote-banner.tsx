"use client"

import { useEffect, useRef, useState } from "react"

const quotes = [
  "Место, где перестаёшь считать дни и начинаешь слушать лес",
  "Выезжаешь из города человеком, возвращаешься — собой",
  "Пять часов от Москвы — и другая жизнь",
]

export function QuoteBanner() {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)
  const [quoteIdx] = useState(() => Math.floor(Math.random() * quotes.length))

  useEffect(() => {
    function onScroll() {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const progress = -rect.top / (window.innerHeight + rect.height)
      setOffset(progress * 60)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
      ref={ref}
      className="relative overflow-hidden bg-primary py-24 sm:py-36"
      aria-hidden="true"
    >
      {/* Subtle texture lines */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 39px, currentColor 40px)",
          color: "white",
        }}
      />

      {/* Content */}
      <div
        className="mx-auto max-w-5xl px-6 text-center"
        style={{ transform: `translateY(${offset}px)`, willChange: "transform" }}
      >
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground/50">
          Усадьба в Антропково
        </p>
        <blockquote className="font-serif text-3xl font-light leading-snug text-primary-foreground text-balance sm:text-5xl lg:text-6xl">
          &ldquo;{quotes[quoteIdx]}&rdquo;
        </blockquote>
        <p className="mt-8 text-sm text-primary-foreground/50">— из отзывов гостей</p>
      </div>
    </div>
  )
}
