"use client"

import { useEffect, useState } from "react"
import { MessageCircle, Phone, Send, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { contacts } from "@/lib/site"

const WHATSAPP_TEXT = encodeURIComponent(
  "Здравствуйте! Хочу узнать о свободных датах в усадьбе.",
)

/** Ненавязчивый «консьерж» в углу экрана — вместо кислотной зелёной кнопки. */
export function ContactDock() {
  const [visible, setVisible] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const links = [
    { href: contacts.phoneHref, label: "Позвонить", icon: Phone },
    { href: `${contacts.whatsapp}?text=${WHATSAPP_TEXT}`, label: "WhatsApp", icon: MessageCircle },
    { href: contacts.telegram, label: "Telegram", icon: Send },
  ]

  return (
    <div
      className={cn(
        "fixed right-4 bottom-4 z-40 flex flex-col items-end gap-2 transition-all duration-500 sm:right-6 sm:bottom-6",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <div
        className={cn(
          "flex flex-col items-end gap-2 transition-all duration-300",
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="flex min-h-11 items-center gap-3 rounded-sm border border-border bg-card/95 px-4 text-[12px] font-medium uppercase tracking-[0.14em] text-foreground backdrop-blur-md transition-colors hover:border-accent hover:text-accent"
          >
            <l.icon className="size-4 text-accent" aria-hidden="true" />
            {l.label}
          </a>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Скрыть способы связи" : "Показать способы связи"}
        className="flex size-13 items-center justify-center rounded-full border border-accent/50 bg-background/90 text-accent backdrop-blur-md transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        {open ? (
          <X className="size-5" aria-hidden="true" />
        ) : (
          <MessageCircle className="size-5" aria-hidden="true" />
        )}
      </button>
    </div>
  )
}
