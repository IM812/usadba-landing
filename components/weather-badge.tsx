"use client"

import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const WEATHER_URL = "https://yandex.ru/pogoda/ru/velikie-luki"

/** Тихая строка с текущей погодой в усадьбе. */
export function WeatherBadge({ className }: { className?: string }) {
  const { data } = useSWR<{ ok: boolean; temp: number; label: string }>("/api/weather", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  if (!data?.ok || data.temp == null) return null

  const sign = data.temp > 0 ? "+" : ""
  const label = data.label ? `, ${data.label.toLowerCase()}` : ""

  return (
    <a
      href={WEATHER_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      <span className="inline-flex items-center gap-2.5">
        <span aria-hidden className="size-1.5 rounded-full bg-accent" />
        {`Сейчас в усадьбе ${sign}${data.temp}°${label}`}
      </span>
    </a>
  )
}
