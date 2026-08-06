import Image from "next/image"
import { ArrowDown, Star } from "lucide-react"
import { BookButton } from "@/components/lux/book-button"
import { LuxLink } from "@/components/lux/ui"
import { WeatherBadge } from "@/components/weather-badge"
import { site } from "@/lib/site"

export function HomeHero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
      {/* Кадр усадьбы на весь экран с медленным наездом */}
      <div className="absolute inset-0">
        <Image
          src="/images/real/photo11.jpg"
          alt="Бревенчатая усадьба в сосновом лесу между двумя озёрами"
          fill
          priority
          sizes="100vw"
          className="lux-ken-burns object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/20 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/20 to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-14 pt-32 sm:px-8 sm:pb-20 lg:px-12">
        <p className="lux-rise eyebrow flex items-center gap-3 text-accent" style={{ animationDelay: "100ms" }}>
          <span aria-hidden="true" className="inline-block h-px w-8 bg-accent/60" />
          {site.region} · {site.shortName}
        </p>

        <h1
          className="lux-rise mt-7 max-w-3xl text-balance font-serif text-[3rem] font-light leading-[0.94] tracking-tight text-foreground sm:text-7xl lg:text-[5.5rem]"
          style={{ animationDelay: "220ms" }}
        >
          Усадьба между
          <br />
          двух озёр
        </h1>

        <p
          className="lux-rise mt-8 max-w-lg text-pretty text-[15px] leading-relaxed text-foreground/70 sm:text-lg"
          style={{ animationDelay: "360ms" }}
        >
          Бревенчатый дом 250 м² в сосновом бору. Баня на дровах, сибирский чан под звёздами и
          собственный причал. Дом сдаётся целиком — только для вашей компании.
        </p>

        <div
          className="lux-rise mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
          style={{ animationDelay: "480ms" }}
        >
          <BookButton>Забронировать даты</BookButton>
          <LuxLink href="/estate" variant="outline">
            Смотреть усадьбу
          </LuxLink>
        </div>

        <WeatherBadge className="lux-rise mt-8 inline-block text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent" />

        {/* Полоса ключевых фактов */}
        <dl
          className="lux-rise mt-14 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-border pt-8 sm:grid-cols-4"
          style={{ animationDelay: "620ms" }}
        >
          {[
            { k: "Рейтинг", v: site.rating.value, sub: `${site.rating.count} отзыв на Яндекс Картах` },
            { k: "Площадь", v: "250 м²", sub: "4 спальни с санузлом" },
            { k: "Гостей", v: "до 15", sub: "дом целиком" },
            { k: "От Москвы", v: "5 часов", sub: "520 км по асфальту" },
          ].map((f) => (
            <div key={f.k}>
              <dt className="eyebrow text-muted-foreground">{f.k}</dt>
              <dd className="mt-2.5 flex items-center gap-1.5 font-serif text-2xl font-light text-foreground sm:text-3xl">
                {f.v}
                {f.k === "Рейтинг" ? <Star className="size-4 fill-accent text-accent" aria-hidden /> : null}
              </dd>
              <dd className="mt-1.5 text-xs leading-snug text-muted-foreground">{f.sub}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="relative flex justify-center pb-8">
        <ArrowDown className="size-4 animate-bounce text-accent/70" aria-hidden />
      </div>
    </section>
  )
}
