import type { Metadata } from "next"
import { Check } from "lucide-react"

import { PageHero } from "@/components/lux/page-hero"
import { BookingCta } from "@/components/lux/booking-cta"
import { BookButton } from "@/components/lux/book-button"
import { Container, Section, SectionHeading, Eyebrow, LuxLink, Divider } from "@/components/lux/ui"
import { getRates, formatMonthDay, formatMoney, seasonTitle } from "@/lib/rates"
import { includedInStay } from "@/lib/site"

export const metadata: Metadata = {
  title: "Цены и тарифы",
  description:
    "Стоимость аренды усадьбы целиком: сезонные тарифы, цена будних и выходных дней, доплата за гостей сверх базового размещения. Всё включено — баня, чан, лодка и сапы.",
}

export const revalidate = 300

export default async function PricesPage() {
  const { settings, seasons } = await getRates()

  const minPrice = seasons.length
    ? Math.min(...seasons.map((s) => s.base_price))
    : settings.base_price

  const rules = [
    { label: "Заезд", value: `с ${settings.check_in_time}` },
    { label: "Выезд", value: `до ${settings.check_out_time}` },
    { label: "Минимальный срок", value: `${settings.minimum_nights} ${settings.minimum_nights === 1 ? "ночь" : "ночи"}` },
    { label: "Базовое размещение", value: `${settings.base_guests} гостей` },
    { label: "Максимум гостей", value: `${settings.max_guests} гостей` },
    { label: "Предоплата", value: "30% при бронировании" },
  ]

  return (
    <>
      <PageHero
        eyebrow="Цены"
        title={<>От {formatMoney(minPrice)} ₽ за дом целиком</>}
        lead="Вы платите за усадьбу, а не за место в ней: 250 м², четыре спальни, баня и чан достаются одной компании. Тариф зависит только от сезона и дня недели."
        image="/images/real/photo1.jpg"
        imageAlt="Терраса усадьбы в золотую осень"
      />

      {/* Сезонные тарифы */}
      <Section tone="raised">
        <Container>
          <SectionHeading
            eyebrow="Тарифы по сезонам"
            title="Стоимость за сутки"
            lead="Цена указана за весь дом при базовом размещении. Выходные — с вечера пятницы по воскресенье."
          />

          <div className="mt-14 overflow-hidden rounded-2xl border border-border">
            {/* Заголовок таблицы — только на планшете и шире */}
            <div className="hidden grid-cols-[1.4fr_1fr_1fr] gap-6 border-b border-border bg-secondary/60 px-7 py-4 sm:grid">
              <span className="eyebrow text-muted-foreground">Сезон</span>
              <span className="eyebrow text-muted-foreground">Будни</span>
              <span className="eyebrow text-muted-foreground">Выходные</span>
            </div>

            {seasons.map((s) => (
              <div
                key={s.id}
                className="grid gap-3 border-b border-border px-5 py-6 last:border-0 sm:grid-cols-[1.4fr_1fr_1fr] sm:items-baseline sm:gap-6 sm:px-7"
              >
                <div>
                    <p className="font-display text-2xl font-semibold text-foreground">
                      {seasonTitle(s.name)}
                    </p>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    {formatMonthDay(s.date_from)} — {formatMonthDay(s.date_to)}
                  </p>
                </div>
                <p className="font-display text-xl font-semibold text-accent sm:text-2xl">
                  <span className="eyebrow mr-2 text-muted-foreground sm:hidden">Будни</span>
                  {formatMoney(s.base_price)} ₽
                </p>
                <p className="font-display text-xl font-semibold text-foreground sm:text-2xl">
                  <span className="eyebrow mr-2 text-muted-foreground sm:hidden">Выходные</span>
                  {formatMoney(s.weekend_price)} ₽
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 text-[13px] leading-relaxed text-muted-foreground">
            {settings.extra_guest_price > 0 ? (
              <p>
                Свыше {settings.base_guests} гостей — {formatMoney(settings.extra_guest_price)} ₽ за
                каждого дополнительного гостя в сутки (до {settings.max_guests} человек).
              </p>
            ) : null}
            {settings.cleaning_fee > 0 ? (
              <p>Уборка после выезда — {formatMoney(settings.cleaning_fee)} ₽ единоразово.</p>
            ) : (
              <p>Уборка после выезда входит в стоимость — доплачивать ничего не нужно.</p>
            )}
            <p>Праздничные даты считаются по тарифу выходного дня.</p>
          </div>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <BookButton>Проверить даты</BookButton>
            <LuxLink href="/booking" variant="outline">
              Календарь и расчёт
            </LuxLink>
          </div>
        </Container>
      </Section>

      {/* Что включено */}
      <Section>
        <Container>
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
            <div>
              <SectionHeading
                eyebrow="Без доплат"
                title="Что входит в стоимость"
                lead="Мы не берём отдельных денег за баню, дрова или сапы — иначе отдых превращается в счёт из мини-бара."
              />
              <Divider className="mt-10" />
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                Единственная доплата — гости сверх базового размещения. Всё остальное уже готово к
                вашему приезду: баня протоплена, чан набран, дрова сложены.
              </p>
            </div>

            <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {includedInStay.map((item) => (
                <li key={item} className="flex gap-3 border-t border-border pt-5">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                  <span className="text-[15px] leading-relaxed text-foreground/90">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* Правила */}
      <Section tone="deep">
        <Container>
          <Eyebrow>Условия проживания</Eyebrow>
          <dl className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {rules.map((r) => (
              <div key={r.label} className="border-t border-border pt-5">
                <dt className="text-[13px] uppercase tracking-[0.14em] text-muted-foreground">
                  {r.label}
                </dt>
                <dd className="mt-2 font-display text-2xl font-semibold text-foreground">{r.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-12 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted-foreground">
            Приезд с детьми и питомцами — обычная история, отдельной платы за это нет. Если нужен
            поздний заезд или ранний выезд, напишите заранее: почти всегда получается подстроиться.
          </p>
        </Container>
      </Section>

      <BookingCta
        image="/images/real/photo3.jpg"
        imageAlt="Сибирский чан на фоне осеннего леса"
        title="Посчитаем ваши даты"
        lead="Откройте календарь — свободные дни, точная сумма и минимальный срок появятся сразу."
      />
    </>
  )
}
