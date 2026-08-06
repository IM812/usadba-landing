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
      className={cn("group flex flex-col items-center leading-none", className)}
      aria-label={`${site.name} — на главную`}
    >
      <span className="font-serif text-[1.35rem] font-light tracking-[0.02em] text-foreground sm:text-2xl">
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
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
          solid
            ? "border-b border-border bg-background/85 backdrop-blur-xl"
            : "border-b border-transparent",
        )}
      >
        <nav className="mx-auto flex h-18 max-w-[1600px] items-center justify-between gap-4 px-4 sm:h-20 sm:px-8 lg:h-24 lg:px-12">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            className="group flex items-center gap-3 text-foreground transition-colors hover:text-accent"
          >
            <span aria-hidden="true" className="flex w-6 flex-col gap-[5px]">
              <span className="h-px w-full bg-current transition-all duration-300 group-hover:w-4" />
              <span className="h-px w-full bg-current" />
              <span className="h-px w-4 bg-current transition-all duration-300 group-hover:w-full" />
            </span>
            <span className="eyebrow hidden sm:inline">Меню</span>
          </button>

          <Wordmark className="absolute left-1/2 -translate-x-1/2" />

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
              className="inline-flex min-h-10 items-center rounded-sm border border-accent/70 px-4 text-[11px] font-medium uppercase tracking-[0.16em] text-accent transition-colors hover:bg-accent hover:text-accent-foreground sm:min-h-11 sm:px-6 sm:text-[12px]"
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
              className="flex items-center gap-3 text-foreground transition-colors hover:text-accent"
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
                          "font-serif text-[1.75rem] font-light leading-none transition-colors sm:text-4xl lg:text-[2.75rem]",
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
              <div className="relative aspect-4/5 w-full max-w-sm overflow-hidden rounded-sm bg-secondary lg:ml-auto">
                <Image
                  src="/images/real/photo2.jpg"
                  alt="Ночная подсветка соснового леса вокруг усадьбы зимой"
                  fill
                  sizes="(max-width: 1024px) 100vw, 30vw"
                  className={cn(
                    "object-cover transition-all duration-1000",
                    menuOpen ? "scale-100 opacity-100" : "scale-105 opacity-0",
                  )}
                />
              </div>

              <div className="flex flex-col gap-5 lg:ml-auto lg:max-w-sm lg:text-right">
                <div className="flex flex-wrap gap-x-6 gap-y-2 lg:justify-end">
                  {secondaryNavigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-[13px] tracking-wide text-muted-foreground transition-colors hover:text-accent"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
                <div className="rule-brass w-full lg:rotate-180" />
                <a
                  href={contacts.phoneHref}
                  className="font-serif text-2xl font-light text-foreground transition-colors hover:text-accent sm:text-3xl"
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
