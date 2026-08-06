"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

/**
 * Проявляет элементы с [data-reveal] при попадании во вьюпорт.
 *
 * Главный принцип: контент НИКОГДА не должен остаться невидимым.
 * Скрывающее правило в CSS висит на классе `reveal-ready`, который ставит
 * инлайн-скрипт в <head> (см. layout.tsx). Если JS не загрузился — правило
 * не применяется и страница видна целиком. Если JS загрузился, но наблюдатель
 * почему-то не сработал, всё раскрывает страховочный таймер.
 */
export function ScrollReveal() {
  const pathname = usePathname()

  useEffect(() => {
    const all = () => Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"))
    const reveal = (el: Element) => el.classList.add("revealed")
    const revealAll = () => all().forEach(reveal)

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealAll()
      return
    }

    if (typeof IntersectionObserver === "undefined") {
      revealAll()
      return
    }

    // threshold 0: достаточно одного пикселя во вьюпорте. С прежним 0.08
    // блок выше экрана мог не дотянуть до порога и остаться скрытым навсегда.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target)
            io.unobserve(entry.target)
          }
        }
      },
      { threshold: 0, rootMargin: "0px 0px -24px 0px" },
    )

    const scan = () => {
      for (const el of all()) {
        if (el.classList.contains("revealed")) continue
        // всё, что уже видно или осталось выше экрана, показываем сразу —
        // не ждём колбэка наблюдателя
        const top = el.getBoundingClientRect().top
        if (top < window.innerHeight) reveal(el)
        else io.observe(el)
      }
    }

    scan()

    // Контент, отрендеренный после первого прохода (данные из API и т.п.).
    // Точечные повторные проходы вместо MutationObserver на всём <body>:
    // тот срабатывал на каждое изменение DOM и заметно грузил телефон.
    const rescans = [120, 600, 1600].map((ms) => window.setTimeout(scan, ms))

    // Страховка: что бы ни случилось, через 3 секунды страница видна.
    const failsafe = window.setTimeout(revealAll, 3000)

    return () => {
      io.disconnect()
      rescans.forEach(clearTimeout)
      clearTimeout(failsafe)
    }
  }, [pathname])

  return null
}
