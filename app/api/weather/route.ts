import { NextResponse } from 'next/server'

// Антропково, Псковская область (примерные координаты)
const LAT = 56.34
const LON = 29.37

const weatherLabels: Record<number, string> = {
  0: 'ясно',
  1: 'преимущественно ясно',
  2: 'переменная облачность',
  3: 'пасмурно',
  45: 'туман',
  48: 'изморозь',
  51: 'лёгкая морось',
  53: 'морось',
  55: 'сильная морось',
  61: 'небольшой дождь',
  63: 'дождь',
  65: 'ливень',
  71: 'небольшой снег',
  73: 'снег',
  75: 'снегопад',
  77: 'снежные зёрна',
  80: 'кратковременный дождь',
  81: 'ливни',
  82: 'сильные ливни',
  85: 'снегопад',
  86: 'сильный снегопад',
  95: 'гроза',
}

export async function GET() {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code&timezone=Europe/Moscow`,
      { next: { revalidate: 1800 } }, // cache 30 min
    )

    if (!res.ok) {
      return NextResponse.json({ ok: false }, { status: 502 })
    }

    const data = await res.json()
    const temp = Math.round(data?.current?.temperature_2m ?? 0)
    const code: number = data?.current?.weather_code ?? 0

    return NextResponse.json({
      ok: true,
      temp,
      label: weatherLabels[code] ?? '',
    })
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 })
  }
}
