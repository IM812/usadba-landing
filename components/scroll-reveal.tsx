"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

/**
 * Показывает элементы с [data-reveal] при попадании во вьюпорт.
 *
 * Живёт в layout, поэтому обязан переподписываться на каждой навигации:
 * иначе блоки новой страницы никогда не получат .revealed и останутся
 * невидимыми. MutationObserver дополнительно подхватывает элементы,
 * которые появляются позже (данные из API, раскрытые списки).
 */
export function ScrollReveal() {
  const pathname = usePathname()

  useEffect(() => {
    const reveal = (el: Element) => el.classList.add("revealed")

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll("[data-reveal]").forEach(reveal)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target)
            io.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" },
    )

    const observe = (root: ParentNode) => {
      root.querySelectorAll?.("[data-reveal]:not(.revealed)").forEach((el) => io.observe(el))
    }

    observe(document)

    // Элементы, отрендеренные после первого прохода
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        for (const node of r.addedNodes) {
          if (!(node instanceof HTMLElement)) continue
          if (node.matches("[data-reveal]")) io.observe(node)
          observe(node)
        }
      }
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [pathname])

  return null
}
