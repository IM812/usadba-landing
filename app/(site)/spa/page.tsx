import type { Metadata } from "next"
import Image from "next/image"
import { BookingCta } from "@/components/lux/booking-cta"
import { PageHero } from "@/components/lux/page-hero"
import { Container, Divider, Eyebrow, Section, SectionHeading } from "@/components/lux/ui"
import { spaRituals, spaSurcharge } from "@/lib/site"

export const metadata: Metadata = {
  title: "Баня и сибирский чан",
  description:
    "Баня на дровах и сибирский чан под открытым небом на берегу озера в усадьбе Антропково.",
}

const ritualSteps = [
  {
    time: "Шаг 1",
    title: "Согласуйте заранее",
    text: "Сообщите при бронировании, что хотите посетить баню и чан. Администратор подтвердит условия для ваших дат.",
  },
  {
    time: "Шаг 2",
    title: "Выберите удобное время",
    text: "Подготовку согласуем с вашим планом отдыха, чтобы не пришлось торопиться после дороги или прогулки.",
  },
  {
    time: "Шаг 3",
    title: "Отдыхайте у озера",
    text: "Парная на дровах и сибирский чан находятся на берегу, в окружении соснового леса.",
  },
]

export default function SpaPage() {
  return (
    <>
      <PageHero
        eyebrow="Баня и чан"
        title="Парная на дровах и чан под открытым небом"
        lead="Настоящая баня на дровах и сибирский чан под открытым небом дополняют спокойный отдых на берегу озера."
        image="/images/estate/banya-fire.jpg"
        imageAlt="Баня на дровах среди высоких сосен"
        meta={[spaSurcharge.short, "Баня на дровах", "Сибирский чан", "Берег озера"]}
      />

      {/* ===== Ритуалы ===== */}
      <Section tone="base">
        <Container size="wide">
          <div data-reveal>
            <SectionHeading
              eyebrow="Ритуалы"
              title="Три способа согреться"
              lead={spaSurcharge.full}
            />
          </div>

          <div className="mt-16 flex flex-col gap-20 lg:gap-28">
            {spaRituals.map((r, i) => (
              <article
                key={r.id}
                data-reveal
                className={`grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16 ${
                  i % 2 === 1 ? "lg:[&>figure]:order-2" : ""
                }`}
              >
                <figure className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-secondary lg:aspect-3/2">
                  <Image
                    src={r.image || "/placeholder.svg"}
                    alt={`${r.name} в усадьбе`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </figure>

                <div className="flex flex-col gap-5">
                  <Eyebrow>{r.duration}</Eyebrow>
                  <h3 className="text-balance font-display text-[1.75rem] font-semibold leading-tight text-foreground sm:text-4xl">
                    {r.name}
                  </h3>
                  <p className="max-w-lg text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                    {r.description}
                  </p>
                  <Divider className="mt-1" />
                  <ul className="flex flex-wrap gap-x-6 gap-y-2">
                    {r.includes.map((f) => (
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

      {/* ===== Как проходит вечер ===== */}
      <Section tone="raised">
        <Container size="wide">
          <div data-reveal className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <SectionHeading
              eyebrow="Как заказать"
              title="Баня и чан — по согласованию"
              lead="Достаточно предупредить о желании попариться при бронировании — остальное согласуем заранее."
            />

            <ol className="flex flex-col">
              {ritualSteps.map((s) => (
                <li
                  key={s.time}
                  className="grid gap-2 border-t border-border py-6 sm:grid-cols-[6rem_1fr] sm:gap-8"
                >
                  <span className="font-display text-xl font-semibold text-accent">{s.time}</span>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[15px] font-medium tracking-wide text-foreground">
                      {s.title}
                    </h3>
                    <p className="text-pretty text-[15px] leading-relaxed text-muted-foreground">
                      {s.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      <BookingCta
        title="Добавьте баню и чан к отдыху"
        lead="Сообщите об этом при бронировании — подтвердим стоимость, доступность и время подготовки для ваших дат."
        image="/images/estate/winter-lights.jpg"
        imageAlt="Подсвеченная усадьба зимним вечером"
      />
    </>
  )
}
