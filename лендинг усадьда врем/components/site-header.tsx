"use client"

import { useEffect, useState } from "react"
import { Phone, Menu, X } from "lucide-react"

const navLinks = [
  { label: "Главная", href: "#hero" },
  { label: "О нас", href: "#about" },
  { label: "Галерея", href: "#gallery" },
  { label: "Отзывы", href: "#reviews" },
  { label: "Контакты", href: "#contacts" },
]

export function SiteHeader({ onBook }: { onBook: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled ? "bg-primary/95 shadow-md backdrop-blur" : "bg-gradient-to-b from-foreground/50 to-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a href="#hero" className="flex items-center gap-2 text-primary-foreground" aria-label="Усадьба Антропкс">
          <LogoMark />
          <span className="hidden font-serif text-lg tracking-wide sm:block">Усадьба в Антропково</span>
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Основная навигация">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-primary-foreground/90 transition hover:text-primary-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="tel:+79951558842"
            className="hidden items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-sm font-semibold text-primary shadow-sm transition hover:bg-white sm:flex"
          >
            <Phone className="size-4 text-accent" />
            +7 (995) 155-88-42
          </a>
          <button
            type="button"
            onClick={onBook}
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90 active:scale-95"
          >
            Забронировать
          </button>
          <button
            type="button"
            aria-label="Открыть меню"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg p-2 text-primary-foreground md:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-primary-foreground/10 bg-primary/95 px-4 py-3 backdrop-blur md:hidden">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-primary-foreground/90 transition hover:bg-primary-foreground/10"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="tel:+79951558842"
                className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-primary-foreground/90"
              >
                <Phone className="size-4 text-accent" />
                +7 (995) 155-88-42
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}

function LogoMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      className="size-9"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 22 24 11l14 11" />
      <path d="M13 21v14h22V21" />
      <path d="M8 40c3-2 5-2 8 0s5 2 8 0 5-2 8 0 5 2 8 0" />
    </svg>
  )
}
