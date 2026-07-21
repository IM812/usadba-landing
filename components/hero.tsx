import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { WeatherBadge } from "@/components/weather-badge"

export function Hero({ onBook }: { onBook: () => void }) {
  return (
    <section id="hero" className="relative flex min-h-screen items-center overflow-hidden">
      {/* Video background — plays silently, falls back to image */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/images/real/photo11.jpg"
        className="absolute inset-0 size-full object-cover"
        aria-hidden="true"
      >
        {/* Add /videos/hero.mp4 to public/videos/ to activate the video background */}
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* Fallback image shown while video loads or if no video file exists */}
      <Image
        src="/images/real/photo11.jpg"
        alt="Усадьба в Антропково — бревенчатый дом в сосновом лесу"
        fill
        priority
        sizes="100vw"
        className="object-cover -z-10"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-10 pt-20 sm:gap-10 sm:pb-16 sm:pt-32 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:flex-wrap sm:items-center">
            <span className="inline-flex w-fit items-center rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur">
              Псковская область · Рейтинг 5,0 · 41 отзыв
            </span>
            <WeatherBadge />
          </div>
          <h1 className="text-balance font-serif text-4xl font-medium leading-[1.05] text-primary-foreground sm:text-6xl lg:text-7xl">
            Усадьба в Антропково
          </h1>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-primary-foreground/90 sm:mt-6 sm:max-w-xl sm:text-lg">
            Большой бревенчатый дом между двумя озёрами. Баня, сибирский чан, причал, лодка и сап-борды. 5 часов от Москвы.
          </p>
        </div>

        {/* Quick booking bar */}
        <div className="w-full rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-4 backdrop-blur-md sm:max-w-2xl">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-serif text-base text-primary-foreground sm:text-xl">Забронируйте проживание</p>
              <p className="hidden text-sm text-primary-foreground/80 sm:block">Быстрая заявка в два простых шага</p>
            </div>
            <button
              type="button"
              onClick={onBook}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition hover:opacity-90 active:scale-95 sm:px-6 sm:py-3.5 sm:text-base"
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
