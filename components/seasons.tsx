"use client"

import { useState } from "react"
import Image from "next/image"

const seasons = [
  {
    id: "winter",
    name: "Зима",
    image: "/images/seasons/winter.png",
    alt: "Усадьба зимой — заснеженный дом и горячий чан под открытым небом",
    description: "Жаркая баня и сибирский чан среди снегов, катание на ватрушках, тишина и звёздное небо",
  },
  {
    id: "spring",
    name: "Весна",
    image: "/images/seasons/spring.png",
    alt: "Усадьба весной — озеро в утреннем тумане и цветущие берега",
    description: "Утренние туманы над озером, пение птиц, первая рыбалка и прогулки на лодке",
  },
  {
    id: "summer",
    name: "Лето",
    image: "/images/seasons/summer.png",
    alt: "Усадьба летом — сап-борды на озере и солнечный день",
    description: "Сап-борды и купание в двух озёрах, шашлыки на берегу, велопрогулки по лесным тропам",
  },
  {
    id: "autumn",
    name: "Осень",
    image: "/images/seasons/autumn.png",
    alt: "Усадьба осенью — золотые берёзы отражаются в озере",
    description: "Золотой лес, грибы и ягоды, банные вечера и горячий чай на веранде под пледом",
  },
]

export function Seasons() {
  const [active, setActive] = useState("summer")

  return (
    <section id="seasons" className="bg-secondary/40 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div data-reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Круглый год</p>
          <h2 className="mt-2 text-balance font-serif text-3xl font-medium text-foreground sm:text-5xl">
            Усадьба в любое время года
          </h2>
          <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-muted-foreground sm:text-lg">
            Каждый сезон здесь особенный — наведите на карточку, чтобы увидеть
          </p>
        </div>

        {/* Desktop: expanding horizontal cards. Mobile: vertical stack */}
        <div data-reveal className="mt-8 flex flex-col gap-3 sm:mt-12 lg:h-[480px] lg:flex-row">
          {seasons.map((season) => {
            const isActive = active === season.id
            return (
              <button
                key={season.id}
                type="button"
                onMouseEnter={() => setActive(season.id)}
                onFocus={() => setActive(season.id)}
                onClick={() => setActive(season.id)}
                aria-expanded={isActive}
                className={`group relative overflow-hidden rounded-2xl text-left transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isActive ? "h-72 lg:h-auto lg:flex-[3]" : "h-20 lg:h-auto lg:flex-1"
                }`}
              >
                <Image
                  src={season.image || "/placeholder.svg"}
                  alt={season.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className={`object-cover transition-transform duration-700 ${isActive ? "scale-100" : "scale-110"}`}
                />
                <div
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    isActive
                      ? "bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-100"
                      : "bg-foreground/50 opacity-100"
                  }`}
                />
                <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
                  <h3
                    className={`font-serif font-medium text-primary-foreground transition-all duration-500 ${
                      isActive ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"
                    }`}
                  >
                    {season.name}
                  </h3>
                  <p
                    className={`mt-2 max-w-md text-pretty text-sm leading-relaxed text-primary-foreground/90 transition-all duration-500 sm:text-base ${
                      isActive ? "translate-y-0 opacity-100" : "hidden translate-y-4 opacity-0 lg:block"
                    }`}
                  >
                    {season.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
