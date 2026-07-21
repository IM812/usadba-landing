"use client"

import useSWR from "swr"
import { Thermometer } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function WeatherBadge() {
  const { data } = useSWR<{ ok: boolean; temp: number; label: string }>("/api/weather", fetcher, {
    revalidateOnFocus: false,
  })

  if (!data?.ok) return null

  const sign = data.temp > 0 ? "+" : ""

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur sm:px-4 sm:py-1.5 sm:text-sm">
      <Thermometer className="size-3.5" aria-hidden="true" />
      {`Сейчас в усадьбе ${sign}${data.temp}°${data.label ? `, ${data.label}` : ""}`}
    </span>
  )
}
