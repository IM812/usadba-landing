import Image from "next/image"
import Link from "next/link"
import { HomeHero } from "@/components/lux/home-hero"
import { BookingCta } from "@/components/lux/booking-cta"
import { ReviewsRail } from "@/components/lux/reviews-rail"
import {
  ArchImage,
  Container,
  Divider,
  Eyebrow,
  FactList,
  FrameImage,
  Section,
  SectionHeading,
  TextLink,
} from "@/components/lux/ui"
import { LodgingJsonLd } from "@/components/json-ld"
import { getRates } from "@/lib/rates"
import { estateFacts, includedInStay, navigation, seasons, site } from "@/lib/site"

const chapters = [
  {
    href: "/estate",
    label: "Усадьба",
    image: "/images/real/photo9.jpg",
    alt: "Гостиная усадьбы с кирпичным камином",
    line: "Четыре спальни, каждая со своим санузлом, и гостиная, где помещается вся компания.",
  },
  {
    href: "/spa",
    label: "Баня и чан",
    image: "/images/real/photo4.jpg",
    alt: "Баня на дровах среди сосен",
    line: "Парная на дровах, купель и чугунный чан под открытым небом.",
  },
  {
    href: "/grounds",
    label: "Территория",
    image: "/images/real/photo6.jpg",
    alt: "Озеро, видимое сквозь сосны",
    line: "Два озера, свой причал, лодка, сап-борды и грибной бор за домом.",
  },
]

// Время заезда для микроразметки берётся из настроек — обновляем раз в 5 минут.
export const revalidate = 300

export default async function HomePage() {
  const { settings } = await getRates()

  return (
    <>
      <LodgingJsonLd checkIn={settings.check_in_time} checkOut={settings.check_out_time} />
      <HomeHero />

      {/* ===== Манифест ===== */}
      <Section tone="base">
        <Container size="wide">
          <div data-reveal className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-24">
            <div className="relative">
              <ArchImage
                src="/images/real/photo1.jpg"
                alt="Терраса усадьбы с подвесным креслом в золотую осень"
                className="aspect-3/4 w-full"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
              <p className="mt-6 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
                Терраса с видом в бор — здесь проходит половина отпуска: утренний кофе, вечернее
                вино, дождь по навесу.
              </p>
            </div>

            <div className="flex flex-col gap-8">
              <Eyebrow>Гостям с {site.established} года</Eyebrow>
              <h2 className="max-w-2xl text-balance font-serif text-[2rem] font-light leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Дом, который отдают вам целиком
              </h2>
              <div className="flex max-w-xl flex-col gap-5 text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                <p>
                  Усадьба стоит на узкой перемычке между двух озёр, в сосновом бору Новосокольнического
                  района. Ближайший сосед — в километре, и это не фигура речи: за забором только лес,
                  вода и небо.
                </p>
                <p>
                  Мы не сдаём комнаты и не подселяем вторую компанию. Приезжает одна семья или одна
                  компания друзей — и весь дом, баня, чан, причал и лодка на эти дни только их. Такой
                  формат мы держим с самого начала и менять не собираемся.
                </p>
              </div>

              <FactList items={estateFacts} className="mt-2" />
            </div>
          </div>
        </Container>
      </Section>

      {/* ===== Разделы усадьбы ===== */}
      <Section tone="raised">
        <Container size="wide">
          <div data-reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Что внутри"
              title={
                <>
                  Три причины
                  <br />
                  остаться дольше
                </>
              }
            />
            <TextLink href="/gallery" className="shrink-0">
              Вся галерея
            </TextLink>
          </div>

          <div data-reveal className="mt-14 grid gap-10 sm:gap-8 md:grid-cols-3 lg:gap-12">
            {chapters.map((c) => (
              <Link key={c.href} href={c.href} className="group flex flex-col">
                <div className="relative aspect-4/5 w-full overflow-hidden rounded-sm bg-secondary">
                  <Image
                    src={c.image || "/placeholder.svg"}
                    alt={c.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]"
                  />
                </div>
                <span
                  aria-hidden
                  className="mt-6 h-px w-10 bg-accent/60 transition-all duration-500 group-hover:w-20"
                />
                <h3 className="mt-4 font-serif text-2xl font-light text-foreground transition-colors group-hover:text-accent sm:text-3xl">
                  {c.label}
                </h3>
                <p className="mt-3 text-pretty text-[15px] leading-relaxed text-muted-foreground">
                  {c.line}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* ===== Сезоны ===== */}
      <Section tone="base">
        <Container size="wide">
          <div data-reveal>
            <SectionHeading
              eyebrow="Круглый год"
              title="Четыре разных усадьбы"
              lead="Одно и то же место выглядит и живёт по-разному от сезона к сезону. Выбирайте тот, что ближе."
            />
          </div>

          <div data-reveal className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {seasons.map((s) => (
              <article key={s.id} className="group flex flex-col">
                <div className="relative aspect-3/4 w-full overflow-hidden rounded-sm bg-secondary">
                  <Image
                    src={s.image || "/placeholder.svg"}
                    alt={`Усадьба в сезон: ${s.name.toLowerCase()}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="font-serif text-2xl font-light text-foreground">{s.name}</h3>
                    <p className="eyebrow mt-1.5 text-accent">{s.months}</p>
                  </div>
                </div>
                <p className="mt-4 text-pretty text-[13px] leading-relaxed text-muted-foreground">
                  {s.line}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* ===== Что включено ===== */}
      <Section tone="deep">
        <Container size="wide">
          <div data-reveal className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-24">
            <div className="flex flex-col gap-8">
              <SectionHeading eyebrow="Включено в проживание" title="Ничего не нужно доплачивать" />
              <ul className="flex flex-col">
                {includedInStay.map((item) => (
                  <li
                    key={item}
                    className="flex items-baseline gap-4 border-b border-border py-4 text-[15px] leading-relaxed text-foreground/85"
                  >
                    <span aria-hidden className="mt-1 inline-block size-1 shrink-0 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              <TextLink href="/prices">Цены и тарифы</TextLink>
            </div>

            <FrameImage
              src="/images/real/photo3.jpg"
              alt="Сибирский чан с подсветкой вечером на фоне осеннего леса"
              className="aspect-4/5 w-full lg:aspect-auto lg:min-h-full"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
          </div>
        </Container>
      </Section>

      {/* ===== Отзывы ===== */}
      <Section tone="base">
        <Container size="wide">
          <div data-reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow={`${site.rating.value} из 5,0 · ${site.rating.count} отзыв`}
              title="Что говорят гости"
            />
            <TextLink href="/reviews" className="shrink-0">
              Все отзывы
            </TextLink>
          </div>
          <div data-reveal className="mt-14">
            <ReviewsRail />
          </div>
        </Container>
      </Section>

      {/* ===== Карта разделов ===== */}
      <Section tone="raised" className="py-16 sm:py-20">
        <Container size="wide">
          <div data-reveal className="flex flex-col gap-8">
            <Eyebrow>Разделы сайта</Eyebrow>
            <Divider />
            <ul className="grid gap-x-12 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
              {navigation.map((n) => (
                <li key={n.href} className="border-b border-border/60">
                  <Link
                    href={n.href}
                    className="group flex flex-col gap-1 py-4 transition-colors hover:text-accent"
                  >
                    <span className="font-serif text-xl font-light text-foreground transition-colors group-hover:text-accent">
                      {n.label}
                    </span>
                    <span className="text-xs leading-snug text-muted-foreground">{n.note}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      <BookingCta />
    </>
  )
}
