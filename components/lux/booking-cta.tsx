"use client"

import Image from "next/image"
import Link from "next/link"
import { contacts } from "@/lib/site"
import { useBooking } from "@/components/lux/booking-provider"
import { Container, Eyebrow } from "@/components/lux/ui"

export function BookingCta({
  title = "Дом свободен чаще, чем кажется",
  lead = "Напишите желаемые даты — ответим в течение часа и подскажем, какой сезон подойдёт вашей компании больше.",
  image = "/images/real/photo3.jpg",
  imageAlt = "Сибирский чан с дымом на фоне осеннего леса",
}: {
  title?: string
  lead?: string
  image?: string
  imageAlt?: string
}) {
  const { openBooking } = useBooking()

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <Image
        src={image || "/placeholder.svg"}
        alt={imageAlt}
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-background/80" />

      <Container size="narrow" className="relative flex flex-col items-center text-center">
        <Eyebrow>Бронирование</Eyebrow>
        <h2 className="mt-5 text-balance font-display text-[2rem] font-semibold leading-[1.1] text-foreground sm:text-5xl">
          {title}
        </h2>
        <p className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          {lead}
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <button
            type="button"
            onClick={() => openBooking()}
            className="inline-flex min-h-13 items-center justify-center rounded-full bg-accent px-8 text-[12px] font-medium uppercase tracking-[0.16em] text-accent-foreground transition-colors hover:bg-accent/85"
          >
            Проверить даты
          </button>
          <Link
            href="/booking"
            className="inline-flex min-h-13 items-center justify-center rounded-full border border-foreground/25 px-8 text-[12px] font-medium uppercase tracking-[0.16em] text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            Календарь и расчёт
          </Link>
        </div>

        <a
          href={contacts.phoneHref}
          className="mt-8 font-display text-xl font-semibold text-foreground/80 transition-colors hover:text-accent sm:text-2xl"
        >
          {contacts.phoneLabel}
        </a>
      </Container>
    </section>
  )
}
