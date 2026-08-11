import type { Metadata } from "next"
import Image from "next/image"
import { BookingCta } from "@/components/lux/booking-cta"
import { PageHero } from "@/components/lux/page-hero"
import { Container, Divider, Eyebrow, Section, SectionHeading } from "@/components/lux/ui"
import { spaRituals, spaSurcharge } from "@/lib/site"

export const metadata: Metadata = {
  title: "Баня и сибирский чан",
  description:
    "Баня на дровах с купелью и комнатой отдыха, чугунный сибирский чан под открытым небом. Баня и чан вместе — 7 000 ₽ за топку, дрова и веники включены.",
}

const ritualSteps = [
  {
    time: "16:00",
    title: "Затапливаем",
    text: "К вашему приезду баня уже топится, а под чаном разложены дрова. Ничего разжигать самим не нужно.",
  },
  {
    time: "18:00",
    title: "Первый пар",
    text: "Парная выходит на рабочие 80–90°. Веники замочены, купель наполнена холодной водой.",
  },
  {
    time: "20:00",
    title: "Чан под звёздами",
    text: "Вода в чане доходит до 40°. Дальше — по кругу: парная, холодная вода, горячий чан, снова парная.",
  },
  {
    time: "23:00",
    title: "Комната отдыха",
    text: "Самовар, травяной чай и тишина. Многие остаются здесь до глубокой ночи, чтобы просто помолчать.",
  },
]

export default function SpaPage() {
  return (
    <>
      <PageHero
        eyebrow="Баня и чан"
        title="Парная на дровах и чан под открытым небом"
        lead="Два ритуала, за которыми к нам приезжают повторно: настоящая дровяная баня с купелью и чугунный сибирский чан, где вода греется живым огнём."
        image="/images/estate/banya-fire.jpg"
        imageAlt="Баня на дровах среди высоких сосен"
        meta={[spaSurcharge.short, "Веники дубовые и берёзовые", "Купель", "Чан до 40°"]}
      />

      {/* ===== Ритуалы ===== */}
      <Section tone="base">
        <Container size="wide">
          <div data-reveal>
            <SectionHeading
              eyebrow="Ритуалы"
              title="Три способа согреться"
              lead={`Баня и чан оплачиваются вместе — ${spaSurcharge.priceLabel} ${spaSurcharge.unit}, сколько бы гостей ни парилось. Дрова, веники и полотенца в эту сумму уже входят.`}
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
              eyebrow="Как проходит вечер"
              title="От дров до самовара"
              lead="Примерный распорядок банного вечера — мы подстроим его под ваш заезд."
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
        title="Затопим баню к вашему приезду"
        lead="Напишите время заезда — к вашему приезду парная будет прогрета, а под чаном уже будет гореть огонь."
        image="/images/estate/winter-lights.jpg"
        imageAlt="Подсвеченная усадьба зимним вечером"
      />
    </>
  )
}
