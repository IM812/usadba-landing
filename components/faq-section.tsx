"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const fallbackFaq = [
  {
    question: "Сколько человек вмещает усадьба?",
    answer: "Усадьба рассчитана на 10–12 человек. В доме 4 просторные спальни с отдельными санузлами. При необходимости возможно размещение большего количества гостей — уточняйте при бронировании.",
  },
  {
    question: "Как далеко усадьба от Москвы и Петербурга?",
    answer: "От Москвы — около 5 часов езды (450 км). От Санкт-Петербурга — около 4 часов (350 км). Усадьба находится в Псковской области, Новосокольнический район.",
  },
  {
    question: "Что включено в стоимость аренды?",
    answer: "В стоимость входит проживание, постельное бельё и полотенца, лодка и велосипеды. Баня с чаном и сап-борды бронируются и оплачиваются отдельно — уточняйте при бронировании. Уборка перед заездом включена.",
  },
  {
    question: "Можно ли приехать с домашними животными?",
    answer: "Да, мы принимаем гостей с питомцами. Просим заранее предупредить об этом при бронировании.",
  },
  {
    question: "Есть ли минимальный срок аренды?",
    answer: "Минимальный срок — 1 ночь. При бронировании от 5 ночей действует скидка 10%.",
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="font-serif text-lg text-foreground leading-snug">{q}</span>
        <ChevronDown
          className={`size-5 shrink-0 text-muted-foreground transition-transform duration-200 mt-0.5 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="pb-5 text-pretty leading-relaxed text-muted-foreground">{a}</p>
      )}
    </div>
  )
}

export function FaqSection() {
  const { data } = useSWR("/api/faq", fetcher)
  const items = data?.data?.length ? data.data : fallbackFaq

  return (
    <section id="faq" className="bg-muted/40 py-16 sm:py-28">
      <div data-reveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header — stacked on mobile, side-by-side on desktop */}
        <div className="mb-8 sm:mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">FAQ</p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-balance font-serif text-3xl leading-tight text-foreground sm:text-4xl">
              Частые вопросы
            </h2>
            <a
              href="tel:+79951558842"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Позвонить нам
            </a>
          </div>
          <p className="mt-3 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Не нашли ответ? Напишите нам — ответим в течение нескольких часов.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-5 sm:px-6">
          {items.map((item: { question: string; answer: string }, idx: number) => (
            <FaqItem key={idx} q={item.question} a={item.answer} />
          ))}
        </div>
      </div>
    </section>
  )
}
