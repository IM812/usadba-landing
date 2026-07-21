"use client"

import { Car, Train, Clock, MapPin, ExternalLink } from "lucide-react"

const YANDEX_MAPS_ORG = "https://yandex.ru/maps/org/usadba_v_antropkovo/216703670267/"
const YANDEX_MAPS_EMBED = "https://api-maps.yandex.ru/services/constructor/1.0/static/?sid=tXVCT1BO1R2JBQN2vG7e3kkV-P_9Tl9i&width=800&height=450&lang=ru_RU"
const YANDEX_ROUTE_FROM_MSK = "https://yandex.ru/maps/?rtext=~57.069%2C31.077&rtt=auto"
const YANDEX_ROUTE_FROM_SPB = "https://yandex.ru/maps/?rtext=~57.069%2C31.077&rtt=auto"

const routes = [
  {
    icon: Car,
    from: "Из Москвы",
    duration: "~5 часов",
    description: "М9 (Балтия) до Великих Лук, далее по А117 на Новосокольники. Дорога хорошая, пробок нет.",
    href: YANDEX_ROUTE_FROM_MSK,
  },
  {
    icon: Train,
    from: "Из Петербурга",
    duration: "~4 часа",
    description: "М20 (Е95) через Псков до Новосокольников. Живописный маршрут через Псковскую область.",
    href: YANDEX_ROUTE_FROM_SPB,
  },
  {
    icon: Clock,
    from: "Ближайший город",
    duration: "30 минут",
    description: "Ближайший крупный город — Великие Луки (35 км). Туда ходят поезда из Москвы и Петербурга.",
    href: null,
  },
]

export function HowToGetThere() {
  return (
    <section id="location" className="bg-background py-16 sm:py-28">
      <div data-reveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-2 sm:mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Как добраться</p>
          <h2 className="text-balance font-serif text-3xl leading-tight text-foreground sm:text-5xl">
            Найти нас просто
          </h2>
          <p className="mt-2 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Псковская область, Новосокольнический район. До ближайшего озера — 50 метров.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
          {/* Route cards */}
          <div className="flex flex-col gap-4">
            {routes.map((r) => {
              const inner = (
                <div className="flex gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <r.icon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-serif text-lg text-foreground">{r.from}</p>
                      <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        {r.duration}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.description}</p>
                  </div>
                  {r.href && <ExternalLink className="size-4 shrink-0 text-muted-foreground mt-1" />}
                </div>
              )
              return r.href ? (
                <a
                  key={r.from}
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border border-border bg-card p-5 transition hover:bg-muted"
                >
                  {inner}
                </a>
              ) : (
                <div key={r.from} className="rounded-2xl border border-border bg-card p-5">
                  {inner}
                </div>
              )
            })}

            <a
              href={YANDEX_MAPS_ORG}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card p-4 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              <MapPin className="size-4 text-primary" />
              Открыть на Яндекс.Картах
              <ExternalLink className="size-3.5 text-muted-foreground" />
            </a>
          </div>

          {/* Yandex Maps embed */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-muted aspect-[4/3] lg:aspect-auto lg:min-h-[400px]">
            <iframe
              src="https://yandex.ru/map-widget/v1/?ll=31.077%2C57.069&z=12&pt=31.077%2C57.069&l=map"
              title="Расположение усадьбы на карте"
              width="100%"
              height="100%"
              className="absolute inset-0 size-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
