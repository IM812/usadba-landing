"use client"

import { useEffect, useState } from "react"
import { CalendarDays, Phone } from "lucide-react"

/**
 * Липкая панель действий, видимая только на телефоне.
 * Появляется после того, как пользователь прокрутил первый экран.
 */
export function MobileCtaBar({ onBook, hidden = false }: { onBook: () => void; hidden?: boolean }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-3 pb-safe pt-3 backdrop-blur transition-transform duration-300 md:hidden ${
        visible && !hidden ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!visible || hidden}
    >
      <div className="flex items-center gap-2">
        <a
          href="tel:+79951558842"
          className="flex min-h-12 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-primary"
          aria-label="Позвонить в усадьбу"
        >
          <Phone className="size-5" />
        </a>
        <button
          type="button"
          onClick={onBook}
          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-semibold text-primary-foreground transition active:scale-[0.99]"
        >
          <CalendarDays className="size-4" />
          Забронировать
        </button>
      </div>
    </div>
  )
}
