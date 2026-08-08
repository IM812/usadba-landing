import Link from "next/link"
import { MapPin, Phone, Send } from "lucide-react"
import { contacts, navigation, secondaryNavigation, site } from "@/lib/site"
import { Container, Eyebrow } from "@/components/lux/ui"
import { getRates } from "@/lib/rates"

export async function SiteFooter() {
  const year = new Date().getFullYear()
  const { settings } = await getRates()

  return (
    <footer className="border-t border-border bg-card">
      <Container size="wide" className="py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-16">
          {/* Лого и подпись */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex flex-col leading-none">
              <span className="font-serif text-3xl font-light text-foreground">Усадьба</span>
              <span className="eyebrow mt-2 text-accent">в Антропково</span>
            </Link>
            <p className="max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
              Бревенчатый дом на 250 м² в сосновом бору между двумя озёрами. Сдаётся целиком, без
              соседей и посторонних.
            </p>
            <p className="text-[13px] text-muted-foreground">
              <span className="text-accent">{site.rating.value}</span> из 5,0 · {site.rating.count}{" "}
              отзыв на {site.rating.source}
            </p>
          </div>

          {/* Разделы */}
          <nav aria-label="Разделы сайта" className="flex flex-col gap-5">
            <Eyebrow className="text-muted-foreground">Разделы</Eyebrow>
            <ul className="flex flex-col gap-3">
              {[...navigation, ...secondaryNavigation].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-foreground/75 transition-colors hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Контакты */}
          <div className="flex flex-col gap-5">
            <Eyebrow className="text-muted-foreground">Связаться</Eyebrow>
            <a
              href={contacts.phoneHref}
              className="flex items-start gap-3 text-sm text-foreground/75 transition-colors hover:text-accent"
            >
              <Phone className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
              {contacts.phoneLabel}
            </a>
            <a
              href={contacts.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 text-sm text-foreground/75 transition-colors hover:text-accent"
            >
              <Send className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
              WhatsApp и Telegram
            </a>
            <a
              href={contacts.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 text-sm leading-relaxed text-foreground/75 transition-colors hover:text-accent"
            >
              <MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
              {contacts.addressFull}
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-8 text-[12px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}
          </p>
          <p className="text-pretty">
            {`Дом сдаётся целиком · Заезд с ${settings.check_in_time}, выезд до ${settings.check_out_time} · Можно с детьми и питомцами`}
          </p>
        </div>
      </Container>
    </footer>
  )
}
