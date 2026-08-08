import type { Metadata } from "next"
import Image from "next/image"
import { BookingCta } from "@/components/lux/booking-cta"
import { PageHero } from "@/components/lux/page-hero"
import { PhotoGrid } from "@/components/lux/photo-grid"
import { Container, Section, SectionHeading } from "@/components/lux/ui"
import { galleryPhotos, seasons } from "@/lib/site"

export const metadata: Metadata = {
  title: "Галерея",
  description:
    "Фотографии усадьбы в Антропково: дом, гостиная с камином, спальни, баня, сибирский чан, озеро и причал во все четыре сезона.",
}

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Галерея"
        title="Усадьба без ретуши"
        lead="Все фотографии сделаны здесь, в разные годы и сезоны. Мы не заказывали рендеры и не переставляли мебель ради кадра."
        image="/images/real/photo6.jpg"
        imageAlt="Вид на озеро сквозь стволы сосен"
        meta={[`${galleryPhotos.length} фотографий`, "4 сезона", "дом, баня, чан, озеро"]}
      />

      <Section tone="base">
        <Container size="wide">
          <div data-reveal>
            <PhotoGrid photos={galleryPhotos} />
          </div>
        </Container>
      </Section>

      {/* ===== Сезоны ===== */}
      <Section tone="raised">
        <Container size="wide">
          <div data-reveal>
            <SectionHeading
              eyebrow="Сезоны"
              title="Одно место, четыре характера"
              lead="Гости, приехавшие зимой и летом, рассказывают о разных усадьбах — и оба раза правы."
            />
          </div>

          <div data-reveal className="mt-14 grid gap-8 sm:grid-cols-2">
            {seasons.map((s) => (
              <article key={s.id} className="group flex flex-col">
                <div className="relative aspect-16/10 w-full overflow-hidden rounded-sm bg-secondary">
                  <Image
                    src={s.image || "/placeholder.svg"}
                    alt={`Усадьба в сезон: ${s.name.toLowerCase()}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                  />
                </div>
                <div className="mt-5 flex items-baseline justify-between gap-4">
                  <h3 className="font-serif text-2xl font-light text-foreground">{s.name}</h3>
                  <span className="eyebrow text-accent">{s.months}</span>
                </div>
                <p className="mt-3 text-pretty text-[15px] leading-relaxed text-muted-foreground">
                  {s.line}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <BookingCta
        title="Хотите увидеть больше?"
        lead="Напишите нам — пришлём свежие фотографии и видео с территории, снятые на этой неделе."
        image="/images/real/photo12.jpg"
        imageAlt="Дорожка от дома к озеру летом"
      />
    </>
  )
}
