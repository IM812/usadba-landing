"use client"

import { Phone, Mail, MapPin, Clock } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function Contacts({ onBook }: { onBook: () => void }) {
  const { data } = useSWR("/api/admin/settings", fetcher)
  const s = data?.data

  const phone = s?.phone || "+7 (995) 155-88-42"
  const phoneRaw = phone.replace(/\D/g, "").replace(/^8/, "7")
  const address = s?.address || "Псковская обл., Новосокольнический р-н, Маевская волость"
  const telegram = s?.telegram || ""
  const whatsapp = s?.whatsapp || phone

  const items = [
    {
      icon: Phone,
      label: "Телефон",
      value: phone,
      href: `tel:+${phoneRaw}`,
    },
    {
      icon: Mail,
      label: "WhatsApp / Telegram",
      value: whatsapp || phone,
      href: whatsapp
        ? `https://wa.me/${whatsapp.replace(/\D/g, "")}`
        : telegram
        ? `https://t.me/${telegram.replace("@", "")}`
        : `tel:+${phoneRaw}`,
    },
    {
      icon: MapPin,
      label: "Адрес",
      value: address,
      href: "https://yandex.ru/maps/org/usadba_v_antropkovo/216703670267/",
    },
    {
      icon: Clock,
      label: "Скидка",
      value: "−10% от 5 ночей",
      href: null,
    },
  ]

  return (
    <section id="contacts" className="bg-primary py-16 text-primary-foreground sm:py-28">
      <div data-reveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">Контакты</p>
            <h2 className="mt-3 text-balance font-serif text-3xl leading-tight sm:text-5xl">
              Готовы принять вас в гости
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-primary-foreground/80">
              Напишите или позвоните нам — поможем выбрать даты и ответим на все вопросы. Или сразу оставьте заявку на
              бронирование.
            </p>
            <button
              type="button"
              onClick={onBook}
              className="mt-6 w-full rounded-xl bg-accent px-8 py-4 text-base font-semibold text-accent-foreground transition hover:opacity-90 active:scale-95 sm:mt-8 sm:w-auto sm:py-3.5"
            >
              Забронировать
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {items.map((item) => {
              const content = (
                <>
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary-foreground/10 text-accent">
                    <item.icon className="size-5" />
                  </div>
                  <p className="mt-3 text-sm text-primary-foreground/70">{item.label}</p>
                  <p className="mt-1 font-medium leading-snug">{item.value}</p>
                </>
              )
              const isExternal = item.href?.startsWith("http")
              return item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-5 transition hover:bg-primary-foreground/10 active:bg-primary-foreground/15"
                >
                  {content}
                </a>
              ) : (
                <div key={item.label} className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-5">
                  {content}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
