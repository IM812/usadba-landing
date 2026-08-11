import type { Metadata } from "next"
import { Star } from "lucide-react"
import { PageHero } from "@/components/lux/page-hero"
import { BookingCta } from "@/components/lux/booking-cta"
import { ReviewsGrid } from "@/components/lux/reviews-rail"
import { Container, Section, SectionHeading, Eyebrow, TextLink } from "@/components/lux/ui"
import { site } from "@/lib/site"
import { YANDEX_REVIEWS_URL, getReviews } from "@/lib/reviews"

export const metadata: Metadata = {
  title: "Отзывы гостей",
  description:
    "Рейтинг 5,0 на основе 41 отзыва. Что пишут гости, которые уже провели несколько дней в усадьбе между двух озёр.",
}

/** Из чего складывается репутация — по повторяющимся мотивам в отзывах. */
const themes = [
  {
    title: "Дом больше, чем на фото",
    text: "Гости чаще всего пишут про простор: 250 м², четыре спальни с собственными санузлами и гостиная, за столом которой умещается вся компания.",
  },
  {
    title: "Чисто и подготовлено",
    text: "Баня протоплена, чан налит, территория выкошена. Про это пишут в каждом втором отзыве — усадьбу готовят к приезду, а не сдают «как есть».",
  },
  {
    title: "Тишина, которую слышно",
    text: "Ближайших соседей не видно и не слышно. Гости описывают это как главную причину, по которой возвращаются во второй и третий раз.",
  },
]

// Отзывы редактируются в админке — обновляем раз в 5 минут.
export const revalidate = 300

export default async function ReviewsPage() {
  const reviews = await getReviews()

  return (
    <>
      <PageHero
        eyebrow="Отзывы"
        title={
          <>
            Рейтинг {site.rating.value} — <br className="hidden sm:block" />
            и ни одной оценки ниже
          </>
        }
        lead={`${site.rating.count} отзыв на Яндекс Картах. Мы ничего не отбираем и не редактируем: ниже — то, что гости написали сами.`}
        image="/images/estate/fireplace.jpg"
        imageAlt="Гостиная усадьбы с кирпичным камином"
        meta={[`${site.rating.count} отзыв`, "Оценка 5,0", "Яндекс Карты"]}
      />

      {/* Сводка рейтинга */}
      <Section tone="raised" className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-6">
              <span className="font-display text-6xl font-semibold leading-none text-accent sm:text-7xl">
                {site.rating.value}
              </span>
              <div className="flex flex-col gap-2">
                <span className="flex gap-1" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-accent text-accent" />
                  ))}
                </span>
                <span className="text-sm text-muted-foreground">
                  {`Средняя оценка по ${site.rating.count} отзыву`}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Eyebrow className="text-muted-foreground">Источник оценок</Eyebrow>
              <TextLink href={YANDEX_REVIEWS_URL}>Открыть отзывы на Яндекс Картах</TextLink>
            </div>
          </div>
        </Container>
      </Section>

      {/* Повторяющиеся мотивы */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Что отмечают чаще всего"
            title="Три вещи, о которых пишут почти все"
          />
          <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden border border-border bg-border sm:grid-cols-3">
            {themes.map((t) => (
              <div key={t.title} className="flex flex-col gap-4 bg-background p-8 lg:p-10">
                <span aria-hidden className="h-px w-10 bg-accent/60" />
                <h3 className="text-pretty font-display text-xl font-semibold leading-snug text-foreground">
                  {t.title}
                </h3>
                <p className="text-pretty text-[15px] leading-relaxed text-muted-foreground">
                  {t.text}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Сами отзывы */}
        <Section tone="raised">
        <Container>
          <SectionHeading eyebrow="Слово гостям" title="Отзывы без правок" />
          <ReviewsGrid reviews={reviews} />
        </Container>
      </Section>

      <BookingCta
        image="/images/estate/lake-wide.jpg"
        imageAlt="Вид на озеро сквозь стволы сосен"
        title="Станьте следующим отзывом"
        lead="Расскажем про свободные даты и подготовим усадьбу к вашему приезду."
      />
    </>
  )
}
