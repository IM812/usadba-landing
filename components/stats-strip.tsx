"use client"

import { useEffect, useRef, useState } from "react"

const stats = [
  { value: 5.0, decimals: 1, label: "Рейтинг на Авито", suffix: "" },
  { value: 41, decimals: 0, label: "Отзывов от гостей", suffix: "" },
  { value: 2, decimals: 0, label: "Озера у дома", suffix: "" },
  { value: 12, decimals: 0, label: "Гостей размещаем", suffix: "+" },
]

function AnimatedNumber({ value, decimals, suffix, start }: { value: number; decimals: number; suffix: string; start: boolean }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!start) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value)
      return
    }

    const duration = 1400
    const startTime = performance.now()
    let raf: number

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(value * eased)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [start, value])

  return (
    <span className="font-serif text-4xl font-medium text-primary-foreground sm:text-5xl">
      {display.toFixed(decimals)}
      {suffix}
    </span>
  )
}

export function StatsStrip() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.4 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section aria-label="Усадьба в цифрах" className="bg-primary py-12 sm:py-16">
      <div ref={ref} className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1 text-center">
            <AnimatedNumber value={stat.value} decimals={stat.decimals} suffix={stat.suffix} start={visible} />
            <span className="text-sm text-primary-foreground/80 sm:text-base">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
