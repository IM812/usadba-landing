import type { Metadata } from "next"
import { ArrowUpRight } from "lucide-react"
import { PageHero } from "@/components/lux/page-hero"
import { BookingCta } from "@/components/lux/booking-cta"
import { Container, Section, SectionHeading, Eyebrow } from "@/components/lux/ui"
import { contacts, routes } from "@/lib/site"

export const metadata: Metadata = {
  title: "Как добраться",
  description:
    "Усадьба в Псковской области, Новосокольнический район. Пять часов от Москвы, четыре от Петербурга. Маршруты, карта и трансфер от станции.",
}

const nearby = [
  { place: "Станция Новосокольники", value: "35 км", note: "встречаем и привозим" },
  { place: "Великие Луки", value: "60 км", note: "крупные магазины" },
  { place: "Ближайшее озеро", value: "50 м", note: "по своему участку" },
  { place: "Магазин в Насве", value: "20 мин", note: "продукты по дороге" },
]

export default function LocationPage() {
  return (
    <>
      <PageHero
        eyebrow="Как добраться"
        title="5 часов от Москвы — и другая жизнь"
        lead="Усадьба стоит в сосновом лесу Новосокольнического района Псковской области. Дорога асфальтовая до самых ворот."
        image="/images/real/photo12.jpg"
        imageAlt="Дорога к усадьбе через сосновый лес"
        meta={[contacts.addressShort, "56.3746, 29.9030"]}
      />

      {/* Маршруты */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Три способа доехать"
            title="Выберите свой маршрут"
            lead="Нажмите на карточку с машиной — построится маршрут в Яндекс Картах прямо до ворот."
          />
          <div className="mt-14 grid gap-px overflow-hidden border border-border bg-border lg:grid-cols-3">
            {routes.map((r) => {
              const body = (
                <>
                  <div className="flex items-baseline justify-between gap-4">
                    <Eyebrow className="text-muted-foreground">{r.from}</Eyebrow>
                    {r.href ? (
                      <ArrowUpRight className="size-4 shrink-0 text-accent" />
                    ) : null}
                  </div>
                  <div className="mt-6 flex items-end gap-3">
                    <span className="font-serif text-4xl font-light leading-none text-foreground">
                      {r.duration.replace("≈ ", "")}
                    </span>
                    <span className="pb-1 text-sm text-muted-foreground">{r.distance}</span>
                  </div>
                  <p className="mt-5 text-pretty text-[15px] leading-relaxed text-muted-foreground">
                    {r.description}
                  </p>
                </>
              )
              return r.href ? (
                <a
                  key={r.id}
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col bg-background p-8 transition-colors hover:bg-card lg:p-10"
                >
                  {body}
                </a>
              ) : (
                <div key={r.id} className="flex flex-col bg-background p-8 lg:p-10">
                  {body}
                </div>
              )
            })}
          </div>
        </Container>
      </Section>

      {/* Карта + что рядом */}
      <Section tone="raised">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
            <div className="relative order-2 h-[360px] overflow-hidden rounded-sm border border-border bg-secondary sm:h-[460px] lg:order-1">
              <iframe
                src={contacts.mapWidget}
                title="Расположение усадьбы на карте"
                width="100%"
                height="100%"
                className="absolute inset-0 size-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="order-1 flex flex-col justify-center lg:order-2">
              <SectionHeading eyebrow="Что рядом" title="Ориентиры вокруг" />
              <dl className="mt-10 flex flex-col">
                {nearby.map((n) => (
                  <div
                    key={n.place}
                    className="flex items-baseline justify-between gap-4 border-b border-border py-5 first:border-t"
                  >
                    <dt className="flex flex-col">
                      <span className="text-pretty text-foreground">{n.place}</span>
                      <span className="text-sm text-muted-foreground">{n.note}</span>
                    </dt>
                    <dd className="shrink-0 font-serif text-2xl font-light text-accent">
                      {n.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <a
                href={contacts.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 self-start text-sm uppercase tracking-[0.14em] text-foreground/80 transition-colors hover:text-accent"
              >
                Открыть на Яндекс Картах
                <ArrowUpRight className="size-4" />
              </a>
            </div>
          </div>
        </Container>
      </Section>

      <BookingCta
        image="/images/real/photo5.jpg"
        imageAlt="Чан и лодка на берегу озера"
        title="Готовы приехать?"
        lead="Подскажем удобный маршрут и организуем трансфер от станции Новосокольники."
      />
    </>
  )
}
