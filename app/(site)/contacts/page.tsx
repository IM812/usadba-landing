import type { Metadata } from "next"
import { ArrowUpRight, Phone, MessageCircle, Send, Mail, MapPin } from "lucide-react"
import { PageHero } from "@/components/lux/page-hero"
import { Container, Section, SectionHeading, Eyebrow } from "@/components/lux/ui"
import { BookButton } from "@/components/lux/book-button"
import { contacts } from "@/lib/site"
import { getRates } from "@/lib/rates"

export const metadata: Metadata = {
  title: "Контакты",
  description:
    "Телефон, WhatsApp, Telegram и почта усадьбы в Антропково. Отвечаем ежедневно с 9:00 до 22:00 по московскому времени.",
}

const channels = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Ответим быстрее всего",
    href: contacts.whatsapp,
    external: true,
  },
  {
    icon: Phone,
    label: "Телефон",
    value: contacts.phoneLabel,
    href: contacts.phoneHref,
    external: false,
  },
  {
    icon: Send,
    label: "Telegram",
    value: "@usadba_antropkovo",
    href: contacts.telegram,
    external: true,
  },
  {
    icon: Mail,
    label: "Почта",
    value: contacts.email,
    href: contacts.emailHref,
    external: false,
  },
]

export default async function ContactsPage() {
  const { settings } = await getRates()

  const facts = [
    { k: "Адрес", v: contacts.addressFull },
    { k: "Координаты", v: "56.374633, 29.902963" },
    { k: "Заезд и выезд", v: `с ${settings.check_in_time} · до ${settings.check_out_time}` },
    { k: "Мы на связи", v: "Ежедневно 9:00 — 22:00 (МСК)" },
  ]

  return (
    <>
      <PageHero
        eyebrow="Контакты"
        title="Напишите нам напрямую"
        lead="Усадьбой занимаются хозяева, а не отдел бронирования. Ответим на любой вопрос — от свободных дат до того, какие сапоги брать в ноябре."
        image="/images/real/photo7.jpg"
        imageAlt="Хозяйская спальня с окном в сосновый лес"
        size="short"
      />

      {/* Каналы связи */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Способы связи"
            title="Выберите удобный канал"
            lead="Обычно отвечаем в течение часа в рабочее время."
          />

          <div className="mt-14 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
            {channels.map((c) => (
              <a
                key={c.label}
                href={c.href}
                {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group flex items-center gap-5 bg-background p-8 transition-colors hover:bg-card lg:p-10"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-accent/40 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  <c.icon className="size-5" />
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <Eyebrow className="text-muted-foreground">{c.label}</Eyebrow>
                  <span className="truncate font-display text-xl font-semibold text-foreground">
                    {c.value}
                  </span>
                </span>
                <ArrowUpRight className="ml-auto size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-accent" />
              </a>
            ))}
          </div>
        </Container>
      </Section>

      {/* Реквизиты и карта */}
      <Section tone="raised">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col">
              <SectionHeading eyebrow="Где мы находимся" title="Антропково" />
              <dl className="mt-10 flex flex-col">
                {facts.map((f) => (
                  <div key={f.k} className="flex flex-col gap-1 border-b border-border py-5 first:border-t">
                    <dt className="eyebrow text-muted-foreground">{f.k}</dt>
                    <dd className="text-pretty text-foreground">{f.v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <BookButton>Забронировать даты</BookButton>
                <a
                  href={contacts.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em] text-foreground/80 transition-colors hover:text-accent"
                >
                  <MapPin className="size-4" />
                  Проложить маршрут
                </a>
              </div>
            </div>

            <div className="relative h-[340px] overflow-hidden rounded-2xl border border-border bg-secondary sm:h-[440px]">
              <iframe
                src={contacts.mapWidget}
                title="Усадьба в Антропково на карте"
                width="100%"
                height="100%"
                className="absolute inset-0 size-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
