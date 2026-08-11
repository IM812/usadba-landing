"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Phone, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { contacts, navigation, secondaryNavigation, site } from "@/lib/site"
import { useBooking } from "@/components/lux/booking-provider"

function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("group flex min-h-11 flex-col items-center justify-center leading-none", className)}
      aria-label={`${site.name} — на главную`}
    >
      <span className="font-display text-[1.35rem] font-extrabold tracking-[-0.03em] text-foreground sm:text-2xl">
        Усадьба
      </span>
      <span className="eyebrow mt-1 text-[0.5rem] text-accent transition-colors sm:text-[0.5625rem]">
        в Антропково
      </span>
    </Link>
  )
}

export function SiteNav({ transparent = true }: { transparent?: boolean }) {
  const pathname = usePathname()
  const { openBooking } = useBooking()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [everOpened, setEverOpened] = useState(false)

  const openMenu = () => {
    setEverOpened(true)
    setMenuOpen(true)
  }

  // Состояние шапки считаем через IntersectionObserver, а не в обработчике
  // скролла: браузер сам решает, когда пересечь порог, и главный поток свободен.
  useEffect(() => {
    const sentinel = document.createElement("div")
    sentinel.setAttribute("aria-hidden", "true")
    sentinel.style.cssText = "position:absolute;top:24px;left:0;width:1px;height:1px;pointer-events:none"
    document.body.prepend(sentinel)

    const io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting), {
      threshold: 0,
    })
    io.observe(sentinel)

    return () => {
      io.disconnect()
      sentinel.remove()
    }
  }, [])

  // Меню закрывается при переходе на другую страницу
  useEffect(() => setMenuOpen(false), [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", onKey)
    }
  }, [menuOpen])

  const solid = scrolled || !transparent

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          // blur включаем только с планшета: на телефоне он заставляет
          // перерисовывать всю полосу на каждом кадре скролла
          solid
            ? // На телефоне blur отключён, поэтому фон должен быть полностью
              // непрозрачным — иначе текст страницы просвечивал сквозь полосу.
              "border-b border-border bg-background sm:bg-background/85 sm:backdrop-blur-lg"
            : "border-b border-transparent",
        )}
      >
        {/* Пока шапка прозрачная, она лежит на фото. На светлых кадрах
            (например, окно с чашками на «Контактах») логотип и «Меню»
            сливались с фоном — мягкая тень сверху возвращает читаемость,
            оставаясь незаметной. */}
        {!solid ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background/70 via-background/25 to-transparent"
          />
        ) : null}

        <nav className="relative mx-auto flex h-18 max-w-[1600px] items-center justify-between gap-4 px-4 sm:h-20 sm:px-8 lg:h-24 lg:px-12">
          <button
            type="button"
            onClick={openMenu}
            aria-expanded={menuOpen}
            aria-label="Открыть меню"
            /* -ml-2 + px-2: зона нажатия дорастает до 44px, штрих остаётся на месте */
            className="group -ml-2 flex min-h-11 items-center gap-3 px-2 text-foreground transition-colors hover:text-accent"
          >
            <span aria-hidden="true" className="flex w-6 flex-col gap-[5px]">
              <span className="h-px w-full bg-current transition-all duration-300 group-hover:w-4" />
              <span className="h-px w-full bg-current" />
              <span className="h-px w-4 bg-current transition-all duration-300 group-hover:w-full" />
            </span>
            <span className="eyebrow hidden sm:inline">Меню</span>
          </button>

          {/* На телефоне логотип стоит в потоке: абсолютное центрирование
              накладывало его на кнопку «Забронировать» при ширине ~390px. */}
          <Wordmark className="sm:absolute sm:left-1/2 sm:-translate-x-1/2" />

          <div className="flex items-center gap-2 sm:gap-6">
            <a
              href={contacts.phoneHref}
              className="hidden items-center gap-2 text-[13px] tracking-wide text-foreground/80 transition-colors hover:text-accent lg:flex"
            >
              <Phone className="size-3.5" aria-hidden="true" />
              {contacts.phoneLabel}
            </a>
            <button
              type="button"
              onClick={() => openBooking()}
              /* Залитая лаймовая пилюля обычным кеглем — главное действие
                 должно читаться как кнопка, а не как капительная надпись. */
              className="inline-flex min-h-10 shrink-0 items-center rounded-full bg-accent px-4 text-[13px] font-semibold tracking-[-0.01em] text-accent-foreground transition-all duration-200 hover:brightness-110 active:scale-[0.97] sm:min-h-11 sm:px-6 sm:text-[14px]"
            >
              Забронировать
            </button>
          </div>
        </nav>
      </header>

      {/* ===== Полноэкранное меню ===== */}
      <div
        className={cn(
          "fixed inset-0 z-60 transition-opacity duration-500",
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!menuOpen}
      >
        <div className="absolute inset-0 bg-background" />

        <div className="relative flex h-full flex-col overflow-y-auto">
          <div className="flex h-18 shrink-0 items-center justify-between px-4 sm:h-20 sm:px-8 lg:h-24 lg:px-12">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Закрыть меню"
              /* -ml-3 + px-3: иконка 20px, зона нажатия дорастает до 44px */
              className="-ml-3 flex min-h-11 items-center gap-3 px-3 text-foreground transition-colors hover:text-accent"
            >
              <X className="size-5" aria-hidden="true" />
              <span className="eyebrow hidden sm:inline">Закрыть</span>
            </button>
            <Wordmark className="absolute left-1/2 -translate-x-1/2" />
            <span className="eyebrow hidden text-muted-foreground lg:inline">
              {site.region}
            </span>
          </div>

          <div className="mx-auto grid w-full max-w-[1600px] flex-1 gap-12 px-5 pb-16 pt-6 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:gap-20 lg:px-12">
            <ul className="flex flex-col">
              {navigation.map((item, i) => {
                const active = pathname === item.href
                return (
                  <li key={item.href} className="border-b border-border/60">
                    <Link
                      href={item.href}
                      style={{ transitionDelay: menuOpen ? `${120 + i * 45}ms` : "0ms" }}
                      className={cn(
                        "group flex items-baseline justify-between gap-6 py-4 transition-all duration-500 sm:py-5",
                        menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                      )}
                    >
                      <span
                        className={cn(
                          "font-display text-[1.75rem] font-semibold leading-none transition-colors sm:text-4xl lg:text-[2.75rem]",
                          active ? "text-accent" : "text-foreground group-hover:text-accent",
                        )}
                      >
                        {item.label}
                      </span>
                      <span className="hidden max-w-[14rem] text-right text-xs leading-snug text-muted-foreground sm:block">
                        {item.note}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>

            <div className="flex flex-col justify-between gap-8">
              {/* Кадр грузится только после первого открытия меню — телефон
                  не тратит трафик и память на скрытую картинку */}
              <div className="relative hidden aspect-4/5 w-full max-w-sm overflow-hidden rounded-2xl bg-secondary sm:block lg:ml-auto">
                {everOpened ? (
                  <Image
                    src="/images/estate/winter-lights.jpg"
                    alt="Ночная подсветка соснового леса вокруг усадьбы зимой"
                    fill
                    sizes="(max-width: 1024px) 60vw, 30vw"
                    className={cn(
                      "object-cover transition-all duration-1000",
                      menuOpen ? "scale-100 opacity-100" : "scale-105 opacity-0",
                    )}
                  />
                ) : null}
              </div>

              <div className="flex flex-col gap-5 lg:ml-auto lg:max-w-sm lg:text-right">
                <div className="flex flex-wrap gap-x-6 lg:justify-end">
                  {secondaryNavigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="inline-flex min-h-11 items-center text-[13px] tracking-wide text-muted-foreground transition-colors hover:text-accent"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
                <div className="rule-brass w-full lg:rotate-180" />
                <a
                  href={contacts.phoneHref}
                  className="inline-flex min-h-11 items-center font-display text-2xl font-semibold text-foreground transition-colors hover:text-accent sm:text-3xl lg:justify-end"
                >
                  {contacts.phoneLabel}
                </a>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {contacts.addressFull}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
