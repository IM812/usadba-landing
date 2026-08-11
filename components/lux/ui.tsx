import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

/* ============================================================
   Базовые элементы «тёмного лесного люкса».
   Серверные компоненты без состояния — можно использовать везде.
   ============================================================ */

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("eyebrow flex items-center gap-3 text-accent", className)}>
      <span aria-hidden="true" className="inline-block h-px w-8 bg-accent/60" />
      {children}
    </p>
  )
}

export function Container({
  children,
  className,
  size = "default",
}: {
  children: React.ReactNode
  className?: string
  size?: "default" | "narrow" | "wide"
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 sm:px-8 lg:px-12",
        size === "narrow" && "max-w-3xl",
        size === "default" && "max-w-6xl",
        size === "wide" && "max-w-[1600px]",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Section({
  children,
  className,
  id,
  tone = "base",
}: {
  children: React.ReactNode
  className?: string
  id?: string
  tone?: "base" | "raised" | "deep"
}) {
  return (
    <section
      id={id}
      className={cn(
        "py-20 sm:py-28 lg:py-36",
        // slab: тональная полоса читается как плита со своей кромкой и тенью,
        // а не как второй плоский прямоугольник, приставленный встык
        tone === "raised" && "slab relative bg-card",
        tone === "deep" && "slab relative bg-secondary",
        className,
      )}
    >
      {children}
    </section>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  lead?: React.ReactNode
  align?: "left" | "center"
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="max-w-3xl text-balance font-serif text-[2rem] font-light leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {lead ? (
        <p className="max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          {lead}
        </p>
      ) : null}
    </div>
  )
}

/* ---------- Кнопки ---------- */

/* Капслок с трекингом 0.14em — самый «музейный» элемент прежнего набора.
   Обычный регистр, плотный вес и форма таблетки читаются современнее и
   заодно перестают растягивать русские слова на пол-экрана. */
const buttonBase =
  "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full px-7 text-[15px] font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"

const buttonVariants = {
  brass: "bg-primary text-primary-foreground hover:bg-primary/88",
  outline: "border border-foreground/20 text-foreground hover:border-accent hover:text-accent",
  quiet: "text-foreground/80 hover:text-accent",
} as const

export function LuxButton({
  children,
  variant = "brass",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof buttonVariants }) {
  return (
    <button
      className={cn(buttonBase, buttonVariants[variant], className)}
      {...props}
    >
      {children}
    </button>
  )
}

export function LuxLink({
  children,
  href,
  variant = "outline",
  className,
  ...props
}: React.ComponentProps<typeof Link> & { variant?: keyof typeof buttonVariants }) {
  return (
    <Link
      href={href}
      className={cn(buttonBase, buttonVariants[variant], className)}
      {...props}
    >
      {children}
    </Link>
  )
}

/** Текстовая ссылка с подчёркиванием, которое растёт при наведении. */
export function TextLink({
  children,
  href,
  className,
}: {
  children: React.ReactNode
  href: string
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 text-[15px] font-semibold text-accent",
        className,
      )}
    >
      {children}
      <span aria-hidden="true" className="inline-block h-px w-6 bg-accent transition-all duration-300 group-hover:w-10" />
    </Link>
  )
}

/* ---------- Изображения ---------- */

/** Арочная фотография — подписной знак сайта (форма камина в усадьбе). */
export function ArchImage({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority,
}: {
  src: string
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
}) {
  return (
    <div
      className={cn(
        // photo-vignette + тень: кадр перестаёт быть плоской наклейкой,
        // края уходят в фон, под аркой появляется объём
        "arch photo-vignette relative overflow-hidden bg-secondary shadow-elev-2",
        className,
      )}
    >
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-[1.2s] ease-out hover:scale-[1.04]"
      />
    </div>
  )
}

export function FrameImage({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority,
}: {
  src: string
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
}) {
  return (
    <div
      className={cn(
        "photo-vignette relative overflow-hidden rounded-sm bg-secondary shadow-elev-2",
        className,
      )}
    >
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  )
}

/* ---------- Прочее ---------- */

export function Divider({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("rule-brass w-full", className)} />
}

export function FactList({
  items,
  className,
}: {
  items: readonly { value: string; unit?: string; label: string }[]
  className?: string
}) {
  return (
    <dl className={cn("grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4", className)}>
      {items.map((f) => (
        <div key={f.label} className="border-t border-border pt-4">
          <dt className="font-serif text-4xl font-light leading-none text-accent sm:text-5xl">
            {f.value}
            {f.unit ? <span className="ml-1 text-2xl sm:text-3xl">{f.unit}</span> : null}
          </dt>
          <dd className="mt-3 text-[13px] leading-snug text-muted-foreground">{f.label}</dd>
        </div>
      ))}
    </dl>
  )
}
