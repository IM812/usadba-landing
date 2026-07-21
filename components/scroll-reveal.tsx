"use client"

import { useEffect } from "react"

/**
 * Global scroll-reveal: observes all [data-reveal] elements and adds
 * .revealed when they enter the viewport. Respects reduced motion.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("revealed"))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed")
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    )

    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return null
}
