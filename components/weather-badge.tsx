"use client"

import useSWR from "swr"
import { Thermometer } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const WEATHER_URL = "https://yandex.ru/pogoda/10496"

export function WeatherBadge() {
  const { data } = useSWR<{ ok: boolean; temp: number; label: string }>("/api/weather", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  // Show placeholder while loading, keep visible even on error
  const sign = data?.temp != null && data.temp > 0 ? "+" : ""
  const tempStr = data?.ok && data.temp != null ? `${sign}${data.temp}°` : "..."
  const labelStr = data?.ok && data.label ? `, ${data.label}` : ""

  return (
    <a
      href={WEATHER_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur transition hover:bg-primary-foreground/20 active:scale-95 sm:px-4 sm:py-1.5 sm:text-sm"
    >
      <Thermometer className="size-3.5" aria-hidden="true" />
      {`Сейчас в усадьбе ${tempStr}${labelStr}`}
    </a>
  )
}
