import type { Metadata } from "next"
import { PageHero } from "@/components/lux/page-hero"
import { BookingCta } from "@/components/lux/booking-cta"
import { Container, Section, SectionHeading, TextLink } from "@/components/lux/ui"
import { FaqJsonLd } from "@/components/json-ld"
import { contacts } from "@/lib/site"
import { getFaq } from "@/lib/faq"

export const metadata: Metadata = {
  title: "Вопросы и ответы",
  description:
    "Размещение, минимальный срок, баня и чан, дети и питомцы, магазины и связь — всё, что обычно спрашивают перед бронированием усадьбы.",
}

// Ответы собираются из настроек в админке — обновляем раз в 5 минут.
export const revalidate = 300

export default async function FaqPage() {
  const items = await getFaq()

  return (
    <>
      <FaqJsonLd items={items} />

      <PageHero
        eyebrow="Вопросы и ответы"
        title="Всё, что спрашивают до приезда"
        lead="Собрали настоящие вопросы гостей. Если своего не нашли — напишите, ответим лично."
        image="/images/real/photo2.jpg"
        imageAlt="Ночная подсветка соснового леса зимой"
        size="short"
      />

      <Section>
        <Container size="narrow">
          <SectionHeading eyebrow="FAQ" title="Коротко и по делу" />

          <div className="mt-12 flex flex-col">
            {items.map((item) => (
              <details
                key={item.question}
                className="group border-b border-border py-6 first:border-t"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 [&::-webkit-details-marker]:hidden">
                  <h2 className="text-pretty font-serif text-xl font-light leading-snug text-foreground transition-colors group-open:text-accent sm:text-2xl">
                    {item.question}
                  </h2>
                  <span
                    aria-hidden
                    className="relative mt-2.5 size-3.5 shrink-0 text-accent"
                  >
                    <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
                    <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current transition-transform duration-300 group-open:scale-y-0" />
                  </span>
                </summary>
                <p className="mt-4 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>

          <p className="mt-12 text-pretty leading-relaxed text-muted-foreground">
            {"Остались вопросы? Напишите в "}
            <TextLink href={contacts.whatsapp}>WhatsApp</TextLink>
            {" или позвоните — "}
            <TextLink href={contacts.phoneHref}>{contacts.phoneLabel}</TextLink>
            {"."}
          </p>
        </Container>
      </Section>

      <BookingCta
        image="/images/real/photo4.jpg"
        imageAlt="Баня на дровах на фоне соснового леса"
        title="Проверим ваши даты"
        lead="Отправьте заявку — подтвердим свободные дни и пришлём условия."
      />
    </>
  )
}
