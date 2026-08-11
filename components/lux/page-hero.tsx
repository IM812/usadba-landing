import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Container } from "@/components/lux/ui"

/** Заголовочный блок внутренних страниц: фото на всю ширину и крупная антиква. */
export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  imageAlt,
  meta,
  size = "default",
}: {
  eyebrow: string
  title: React.ReactNode
  lead?: string
  image: string
  imageAlt: string
  meta?: readonly string[]
  /** «short» — для утилитарных страниц, где важнее контент под хиро. */
  size?: "default" | "short"
}) {
  return (
    <section
      className={cn(
        // on-dark — тёмная логика токенов поверх фотографии, см. HomeHero
        "on-dark relative flex items-end overflow-hidden bg-background pt-28",
        size === "default"
          ? "min-h-[62svh] pb-14 sm:min-h-[70svh] sm:pb-20"
          : "min-h-[46svh] pb-12 sm:min-h-[52svh] sm:pb-16",
      )}
    >
      <Image
        src={image || "/placeholder.svg"}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="lux-ken-burns object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30"
      />

      <Container size="wide" className="relative">
        <nav aria-label="Хлебные крошки" className="mb-6">
          <ol className="eyebrow flex items-center gap-2 text-muted-foreground">
            <li>
              <Link href="/" className="transition-colors hover:text-accent">
                Главная
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-accent">{eyebrow}</li>
          </ol>
        </nav>

        <h1 className="max-w-4xl text-balance font-serif text-[2.5rem] font-light leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          {title}
        </h1>

        {lead ? (
          <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {lead}
          </p>
        ) : null}

        {meta?.length ? (
          <ul className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border pt-6">
            {meta.map((m) => (
              <li key={m} className="text-[13px] tracking-wide text-foreground/75">
                {m}
              </li>
            ))}
          </ul>
        ) : null}
      </Container>
    </section>
  )
}
