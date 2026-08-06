import type { Metadata } from "next"
import { CalendarCheck, MessageCircle, KeyRound } from "lucide-react"

import { PageHero } from "@/components/lux/page-hero"
import { BookingCalendar } from "@/components/lux/booking-calendar"
import { Container, Section, SectionHeading, Eyebrow, TextLink } from "@/components/lux/ui"
import { contacts } from "@/lib/site"
import { getRates, formatMoney } from "@/lib/rates"

export const metadata: Metadata = {
  title: "Бронирование",
  description:
    "Календарь свободных дат усадьбы в Антропково. Выберите даты, посмотрите точную стоимость и отправьте заявку — подтвердим в течение дня.",
}

export const revalidate = 300

const steps = [
  {
    icon: CalendarCheck,
    title: "Выбираете даты",
    text: "Календарь показывает занятые дни в реальном времени — из нашей брони и с Авито.",
  },
  {
    icon: MessageCircle,
    title: "Мы подтверждаем",
    text: "Отвечаем в течение дня: уточняем детали, присылаем условия и реквизиты для предоплаты.",
  },
  {
    icon: KeyRound,
    title: "Приезжаете",
    text: "К вашему заезду баня протоплена, чан набран, дрова сложены. Встречаем лично.",
  },
]

export default async function BookingPage() {
  const { settings } = await getRates()

  return (
    <>
      <PageHero
        eyebrow="Бронирование"
        title="Свободные даты усадьбы"
        lead={`Дом сдаётся целиком: до ${settings.max_guests} гостей, базовое размещение — ${settings.base_guests} человек. Отметьте даты, и мы сразу посчитаем стоимость.`}
        image="/images/real/photo12.jpg"
        imageAlt="Дорожка от дома усадьбы к озеру"
        size="short"
      />

      <Section>
        <Container size="wide">
          <BookingCalendar />
        </Container>
      </Section>

      <Section tone="raised">
        <Container>
          <SectionHeading
            eyebrow="Как это работает"
            title="Три шага до поездки"
            align="center"
            className="items-center"
          />

          <div className="mt-16 grid gap-12 sm:grid-cols-3 sm:gap-10">
            {steps.map((s) => (
              <div key={s.title} className="flex flex-col items-center text-center">
                <s.icon className="size-6 text-accent" aria-hidden="true" />
                <h3 className="mt-6 font-serif text-2xl font-light text-foreground">{s.title}</h3>
                <p className="mt-3 max-w-xs text-pretty text-[15px] leading-relaxed text-muted-foreground">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="deep">
        <Container size="narrow" className="text-center">
          <Eyebrow className="justify-center">Нужна помощь</Eyebrow>
          <h2 className="mt-6 text-balance font-serif text-[2rem] font-light leading-tight text-foreground sm:text-4xl">
            Проще спросить — ответим лично
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-pretty text-[15px] leading-relaxed text-muted-foreground">
            Нужен трансфер от вокзала, поздний заезд или праздник на 15 человек? Напишите — почти
            всегда получается устроить.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-10">
            <a
              href={contacts.phoneHref}
              className="font-serif text-2xl font-light text-foreground transition-colors hover:text-accent sm:text-3xl"
            >
              {contacts.phoneLabel}
            </a>
            <TextLink href={contacts.whatsapp}>Написать в WhatsApp</TextLink>
          </div>

          <p className="mt-12 text-[13px] text-muted-foreground">
            Тариф начинается от {formatMoney(settings.base_price)} ₽ за дом целиком в сутки.
          </p>
        </Container>
      </Section>
    </>
  )
}
