import type { Metadata } from "next"
import Image from "next/image"
import { BookingCta } from "@/components/lux/booking-cta"
import { PageHero } from "@/components/lux/page-hero"
import {
  Container,
  Divider,
  Eyebrow,
  FactList,
  Section,
  SectionHeading,
  TextLink,
} from "@/components/lux/ui"
import { estateFacts, includedInStay, rooms } from "@/lib/site"

export const metadata: Metadata = {
  title: "Усадьба",
  description:
    "Бревенчатый дом 250 м²: гостиная с камином, четыре спальни со своими санузлами, оборудованная кухня. Дом сдаётся целиком до 15 гостей.",
}

const houseNotes = [
  {
    title: "Кухня",
    text: "Индукционная плита, духовка, две посудомоечные машины, большой холодильник и вся посуда на 15 персон. Можно готовить на компанию без компромиссов.",
  },
  {
    title: "Тепло",
    text: "Газовое отопление плюс кирпичный камин в гостиной. Зимой в доме +24° независимо от того, что происходит за окном.",
  },
  {
    title: "Санузлы",
    text: "Четыре санузла с душем — по одному на каждую спальню, плюс гостевой на первом этаже. Утренних очередей не бывает.",
  },
  {
    title: "Вечера",
    text: "Проектор со экраном, колонка, настольные игры и книги. Wi-Fi ловит по всему дому, но чаще им не пользуются.",
  },
]

export default function EstatePage() {
  return (
    <>
      <PageHero
        eyebrow="Усадьба"
        title="Бревенчатый дом на 250 квадратных метров"
        lead="Двухэтажный дом из круглого бревна: большая гостиная с камином, четыре спальни со своими санузлами и кухня, на которой можно накрыть на пятнадцать человек."
        image="/images/real/photo11.jpg"
        imageAlt="Фасад бревенчатого дома усадьбы среди сосен"
        meta={["250 м²", "4 спальни", "4 санузла", "до 15 гостей", "дом целиком"]}
      />

      {/* ===== Факты ===== */}
      <Section tone="raised" className="py-16 sm:py-20">
        <Container size="wide">
          <div data-reveal>
            <FactList items={estateFacts} />
          </div>
        </Container>
      </Section>

      {/* ===== Комнаты ===== */}
      <Section tone="base">
        <Container size="wide">
          <div data-reveal>
            <SectionHeading
              eyebrow="Комнаты"
              title="Каждому — своя дверь"
              lead="Спальни разведены по этажам и сторонам дома, поэтому большая компания не мешает друг другу. В каждой спальне — свой душ и туалет."
            />
          </div>

          <div className="mt-16 flex flex-col gap-20 lg:gap-28">
            {rooms.map((room, i) => (
              <article
                key={room.id}
                data-reveal
                className={`grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16 ${
                  i % 2 === 1 ? "lg:[&>figure]:order-2" : ""
                }`}
              >
                <figure className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-secondary lg:aspect-3/2">
                  <Image
                    src={room.image || "/placeholder.svg"}
                    alt={`${room.name} — ${room.kind.toLowerCase()} в усадьбе`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </figure>

                <div className="flex flex-col gap-5">
                  <Eyebrow>{room.kind}</Eyebrow>
                  <h3 className="text-balance font-display text-[1.75rem] font-semibold leading-tight text-foreground sm:text-4xl">
                    {room.name}
                  </h3>
                  <p className="max-w-lg text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                    {room.description}
                  </p>

                  <dl className="mt-1 flex flex-wrap gap-x-10 gap-y-3 text-[13px]">
                    <div>
                      <dt className="eyebrow text-muted-foreground">Площадь</dt>
                      <dd className="mt-1.5 text-foreground">{room.area}</dd>
                    </div>
                    <div>
                      <dt className="eyebrow text-muted-foreground">Вместимость</dt>
                      <dd className="mt-1.5 text-foreground">{room.capacity}</dd>
                    </div>
                  </dl>

                  <Divider className="mt-2" />

                  <ul className="flex flex-wrap gap-x-6 gap-y-2">
                    {room.features.map((f) => (
                      <li key={f} className="text-[13px] tracking-wide text-foreground/70">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* ===== Бытовые детали ===== */}
      <Section tone="deep">
        <Container size="wide">
          <div data-reveal className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <SectionHeading eyebrow="Детали" title="То, о чём обычно спрашивают" />

            <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
              {houseNotes.map((n) => (
                <div key={n.title} className="flex flex-col gap-3 border-t border-border pt-5">
                  <h3 className="font-display text-xl font-semibold text-accent">{n.title}</h3>
                  <p className="text-pretty text-[15px] leading-relaxed text-muted-foreground">
                    {n.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* ===== Включено ===== */}
      <Section tone="base">
        <Container size="wide">
          <div data-reveal className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div className="flex flex-col gap-8">
              <SectionHeading eyebrow="Включено" title="Без скрытых доплат" />
              <TextLink href="/prices">Смотреть цены</TextLink>
            </div>

            <ul className="grid gap-x-12 sm:grid-cols-2">
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
          </div>
        </Container>
      </Section>

      <BookingCta
        title="Посмотрите дом своими глазами"
        lead="Расскажите, сколько вас и на какие даты — подберём подходящий сезон и пришлём подробные фотографии всех комнат."
        image="/images/real/photo9.jpg"
        imageAlt="Кирпичный камин в гостиной усадьбы"
      />
    </>
  )
}
