"use client"

import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { WeatherBadge } from "@/components/weather-badge"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function Hero({ onBook }: { onBook: () => void }) {
  const { data } = useSWR("/api/admin/settings", fetcher)
  const s = data?.data

  const title = s?.title || "Усадьба в Антропково"
  const subtitle = s?.subtitle || "Забронируйте проживание"
  const description = s?.description || "Большой бревенчатый дом между двумя озёрами. Баня, сибирский чан, причал, лодка и сап-борды. 5 часов от Москвы."

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] items-end overflow-hidden sm:min-h-screen sm:items-center"
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/images/real/photo11.jpg"
        className="absolute inset-0 size-full object-cover"
        aria-hidden="true"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      <Image
        src="/images/real/photo11.jpg"
        alt={title}
        fill
        priority
        sizes="100vw"
        className="object-cover -z-10"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 pb-24 pt-24 sm:gap-10 sm:pb-16 sm:pt-32 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-4">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("reviews")
                el?.scrollIntoView({ behavior: "smooth" })
              }}
              className="inline-flex w-fit cursor-pointer items-center rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur transition hover:bg-primary-foreground/20 active:scale-95"
            >
              Псковская область · Рейтинг 5,0 · 41 отзыв
            </button>
            <WeatherBadge />
          </div>
          <h1 className="text-balance font-serif text-4xl font-medium leading-[1.05] text-primary-foreground sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-primary-foreground/90 sm:mt-6 sm:max-w-xl sm:text-lg">
            {description}
          </p>
        </div>

        <div className="w-full rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-4 backdrop-blur-md sm:max-w-2xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-serif text-lg text-primary-foreground sm:text-xl">{subtitle}</p>
              <p className="text-sm text-primary-foreground/80">Быстрая заявка в два простых шага</p>
            </div>
            <button
              type="button"
              onClick={onBook}
              className="flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-base font-semibold text-accent-foreground transition hover:opacity-90 active:scale-[0.98] sm:w-auto sm:px-6 sm:py-3.5"
            >
              Забронировать
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
