"use client"

import Image from "next/image"
import useSWR from "swr"
import {
  Trees, Flame, Wifi, Ship, Bath, Utensils, Car, Waves, Wind, Coffee,
  Dumbbell, Star, Home, Bed, Check, Sun, Snowflake, Music, Camera,
  Anchor, Fish, Bike, MapPin, Dog, Baby, FireExtinguisher, Tv, ChefHat,
  Thermometer, Droplets, type LucideIcon,
} from "lucide-react"
import type { Amenity } from "@/lib/types"

const iconMap: Record<string, LucideIcon> = {
  trees: Trees, flame: Flame, wifi: Wifi, ship: Ship, bath: Bath,
  utensils: Utensils, car: Car, waves: Waves, wind: Wind, coffee: Coffee,
  dumbbell: Dumbbell, star: Star, home: Home, bed: Bed, check: Check,
  sun: Sun, snowflake: Snowflake, music: Music, camera: Camera,
  anchor: Anchor, fish: Fish, bike: Bike, mappin: MapPin, dog: Dog,
  baby: Baby, fireextinguisher: FireExtinguisher, tv: Tv, chefhat: ChefHat,
  thermometer: Thermometer, droplets: Droplets,
}

const DEFAULTS: Amenity[] = [
  { id: "1", icon: "trees",    label: "Два озера рядом",    sort_order: 0 },
  { id: "2", icon: "flame",    label: "Баня и чан",          sort_order: 1 },
  { id: "3", icon: "wifi",     label: "Всё для комфорта",    sort_order: 2 },
  { id: "4", icon: "ship",     label: "Лодка и сап-борд",   sort_order: 3 },
]

const DESCRIPTIONS: Record<string, string> = {
  "Два озера рядом":  "Дом стоит между двумя озёрами — со своим пляжем и причалом.",
  "Баня и чан":       "Настоящая баня и сибирский чан на берегу озера под открытым небом.",
  "Всё для комфорта": "Полностью оборудованная кухня, посудомойка, Wi-Fi, бельё.",
  "Лодка и сап-борд": "В аренду: лодка, сап-борды, спиннинг — рыбалка и прогулки.",
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function About() {
  const { data } = useSWR<{ ok: boolean; data: Amenity[] }>("/api/admin/amenities", fetcher)
  const amenities: Amenity[] = data?.data?.length ? data.data : DEFAULTS

  return (
    <section id="about" className="bg-background py-16 sm:py-28">
      <div data-reveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl lg:order-last">
            <Image
              src="/images/real/photo8.jpg"
              alt="Уютная спальня с бревенчатыми стенами, вид на лес"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Об усадьбе</p>
            <h2 className="mt-3 text-balance font-serif text-3xl leading-tight text-foreground sm:text-5xl">
              Место, куда хочется возвращаться
            </h2>
            <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">
              Усадьба в Антропково — это большой (250 м²) бревенчатый дом в Псковской области, который находится между
              двумя озёрами, со своим причалом, баней и купелью. Всего 5 часов от Москвы — и вы в уединённом месте
              с потрясающей природой.
            </p>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              Четыре просторные спальни с отдельными санузлами, огромная гостиная с камином, оборудованная кухня.
              Рядом — легендарная усадьба Ореховно.
            </p>

            <dl className="mt-8 grid grid-cols-3 gap-4">
              <div>
                <dt className="font-serif text-3xl text-primary sm:text-4xl">250 м²</dt>
                <dd className="mt-1 text-xs text-muted-foreground sm:text-sm">Площадь дома</dd>
              </div>
              <div>
                <dt className="font-serif text-3xl text-primary sm:text-4xl">4</dt>
                <dd className="mt-1 text-xs text-muted-foreground sm:text-sm">Спальни со своим санузлом</dd>
              </div>
              <div>
                <dt className="font-serif text-3xl text-primary sm:text-4xl">5,0</dt>
                <dd className="mt-1 text-xs text-muted-foreground sm:text-sm">Рейтинг Яндекс·Карты</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {amenities.map((a) => {
            const Icon = iconMap[a.icon?.toLowerCase()] ?? Check
            const desc = DESCRIPTIONS[a.label] ?? ""
            return (
              <div
                key={a.id}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-col sm:gap-0 sm:p-6"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-11">
                  <Icon className="size-5" />
                </div>
                <div className="sm:mt-4">
                  <h3 className="font-serif text-lg text-foreground sm:text-xl">{a.label}</h3>
                  {desc && (
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground sm:mt-2">{desc}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
