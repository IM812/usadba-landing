import type { Metadata } from "next"
import Image from "next/image"
import { BookingCta } from "@/components/lux/booking-cta"
import { PageHero } from "@/components/lux/page-hero"
import { Container, Eyebrow, Section, SectionHeading, TextLink } from "@/components/lux/ui"
import { groundExperiences } from "@/lib/site"

export const metadata: Metadata = {
  title: "Территория и активности",
  description:
    "Два озера, собственный причал, лодка и сап-борды, рыбалка круглый год, грибной сосновый бор сразу за домом.",
}

const dayPlan = [
  {
    part: "Утро",
    text: "Туман по воде и полная тишина. Кофе на террасе, потом — на причал: в это время рыба клюёт лучше всего.",
  },
  {
    part: "День",
    text: "Сап-борды до другого берега, купание, велосипеды по лесным дорогам или корзина и поход за грибами.",
  },
  {
    part: "Вечер",
    text: "Мангал во дворе, чан у леса и закат ровно напротив причала. Дальше — камин и разговоры.",
  },
  {
    part: "Ночь",
    text: "Здесь видно Млечный Путь: до ближайшего города 35 км, и ничто не подсвечивает небо.",
  },
]

export default function GroundsPage() {
  return (
    <>
      <PageHero
        eyebrow="Территория"
        title="Два озера, бор и ни одного соседа"
        lead="Усадьба стоит на перемычке между двумя озёрами, в сосновом бору. Забор условный: за ним сразу начинается лес, в котором можно идти час и никого не встретить."
        image="/images/real/photo12.jpg"
        imageAlt="Дорожка от дома к озеру летом"
        meta={["2 озера", "свой причал", "лодка и 2 сап-борда", "грибной бор"]}
      />

      {/* ===== Активности ===== */}
      <Section tone="base">
        <Container size="wide">
          <div data-reveal>
            <SectionHeading
              eyebrow="Чем заняться"
              title="Развлечения, которые не нужно искать"
              lead="Всё это в пяти минутах от крыльца и уже включено в проживание."
            />
          </div>

          <div data-reveal className="mt-14 grid gap-10 sm:grid-cols-2 lg:gap-14">
            {groundExperiences.map((e) => (
              <article key={e.id} className="group flex flex-col">
                <div className="relative aspect-16/11 w-full overflow-hidden rounded-sm bg-secondary">
                  <Image
                    src={e.image || "/placeholder.svg"}
                    alt={`${e.name} в усадьбе`}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                  />
                </div>
                <div className="mt-6 flex items-baseline justify-between gap-4">
                  <h3 className="font-serif text-2xl font-light text-foreground sm:text-3xl">
                    {e.name}
                  </h3>
                  <span className="eyebrow shrink-0 text-accent">{e.season}</span>
                </div>
                <p className="mt-3 text-pretty text-[15px] leading-relaxed text-muted-foreground">
                  {e.description}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* ===== День в усадьбе ===== */}
      <Section tone="deep">
        <Container size="wide">
          <div data-reveal className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div className="flex flex-col gap-8">
              <SectionHeading
                eyebrow="День в усадьбе"
                title="От тумана до Млечного Пути"
              />
              <TextLink href="/spa">Баня и чан</TextLink>
            </div>

            <ol className="flex flex-col">
              {dayPlan.map((d) => (
                <li
                  key={d.part}
                  className="grid gap-2 border-t border-border py-6 sm:grid-cols-[7rem_1fr] sm:gap-8"
                >
                  <span className="font-serif text-xl font-light text-accent">{d.part}</span>
                  <p className="text-pretty text-[15px] leading-relaxed text-muted-foreground">
                    {d.text}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      {/* ===== Окрестности ===== */}
      <Section tone="base">
        <Container size="wide">
          <div data-reveal className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-sm bg-secondary">
              <Image
                src="/images/real/photo5.jpg"
                alt="Чан и лодка на берегу озера"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            <div className="flex flex-col gap-6">
              <Eyebrow>Вокруг</Eyebrow>
              <h2 className="text-balance font-serif text-[1.75rem] font-light leading-tight text-foreground sm:text-4xl">
                Куда съездить, если захочется
              </h2>
              <div className="flex flex-col gap-4 text-pretty text-[15px] leading-relaxed text-muted-foreground">
                <p>
                  Великие Луки в 35 километрах: музеи, рынок с местным творогом и рыбой, кофейни и
                  прогулочная набережная. Хороший вариант на полдня, если погода испортилась.
                </p>
                <p>
                  Ближе — Пушкинские Горы и Изборск, куда стоит выделить целый день. Мы подскажем
                  маршруты и время выезда, чтобы вернуться к бане.
                </p>
              </div>
              <TextLink href="/location">Как добраться до усадьбы</TextLink>
            </div>
          </div>
        </Container>
      </Section>

      <BookingCta
        title="Лодка и сапы уже на причале"
        lead="Скажите даты — расскажем, какая сейчас вода, что клюёт и где в этом сезоне лучше всего собирать грибы."
        image="/images/real/photo6.jpg"
        imageAlt="Вид на озеро сквозь стволы сосен"
      />
    </>
  )
}
