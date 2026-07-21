import Image from "next/image"
import { ArrowRight } from "lucide-react"

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

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-8 pt-24 sm:gap-10 sm:pb-16 sm:pt-32 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="mb-3 inline-flex items-center rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur sm:mb-4 sm:px-4 sm:py-1.5 sm:text-sm">
            Псковская область · Рейтинг 5,0 · 41 отзыв
          </p>
          <h1 className="text-balance font-serif text-[2.4rem] font-medium leading-[1.05] text-primary-foreground sm:text-6xl lg:text-7xl">
            Усадьба в Антропково
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-primary-foreground/90 sm:mt-6 sm:max-w-xl sm:text-lg">
            Большой бревенчатый дом между двумя озёрами. Баня, сибирский чан, причал, лодка и сап-борды. 5 часов от Москвы.
          </p>
        </div>

        {/* Quick booking bar */}
        <div className="w-full rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-4 backdrop-blur-md sm:max-w-2xl">
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <p className="font-serif text-lg text-primary-foreground sm:text-xl">Забронируйте проживание</p>
              <p className="text-sm text-primary-foreground/80">Быстрая заявка в два простых шага</p>
            </div>
            <button
              type="button"
              onClick={onBook}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-base font-semibold text-accent-foreground transition hover:opacity-90 active:scale-95 sm:w-auto"
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
