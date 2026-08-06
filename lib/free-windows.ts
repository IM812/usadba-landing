import 'server-only'

import { createServiceClient } from '@/lib/supabase/server'
import { fetchAvitoRanges, type BusyRange } from '@/lib/ics'
import { addDays, startOfToday, toDateKey } from '@/lib/date'
import {
  DEFAULT_SETTINGS,
  isNightBusy,
  priceForNight,
  type AvailabilitySettings,
  type SeasonalPrice,
} from '@/lib/availability'

/** Готовое предложение по датам для главной страницы. */
export type FreeWindow = {
  /** Заезд, YYYY-MM-DD */
  start: string
  /** Выезд, YYYY-MM-DD */
  end: string
  nights: number
  total: number
  perNight: number
  /** «Ближайшие выходные», «Неделя у озера» и т.п. */
  label: string
  /** Сколько дней осталось до заезда. */
  inDays: number
}

const HORIZON_DAYS = 160

/** Максимальные отрезки подряд свободных ночей начиная с сегодня. */
function freeRuns(ranges: readonly BusyRange[], minNights: number) {
  const today = startOfToday()
  const runs: { start: Date; nights: number }[] = []

  let runStart: Date | null = null
  let nights = 0

  for (let i = 0; i < HORIZON_DAYS; i++) {
    const day = addDays(today, i)
    const free = !isNightBusy(toDateKey(day), ranges)

    if (free) {
      if (!runStart) runStart = day
      nights++
    } else if (runStart) {
      if (nights >= minNights) runs.push({ start: runStart, nights })
      runStart = null
      nights = 0
    }
  }
  if (runStart && nights >= minNights) runs.push({ start: runStart, nights })

  return runs
}

function build(
  start: Date,
  nights: number,
  label: string,
  seasons: readonly SeasonalPrice[],
  settings: AvailabilitySettings,
): FreeWindow {
  let total = 0
  for (let i = 0; i < nights; i++) total += priceForNight(addDays(start, i), seasons, settings)

  const inDays = Math.round((start.getTime() - startOfToday().getTime()) / 86_400_000)

  return {
    start: toDateKey(start),
    end: toDateKey(addDays(start, nights)),
    nights,
    total,
    perNight: Math.round(total / nights),
    label,
    inDays,
  }
}

/**
 * Три осмысленных варианта заезда вместо сырого списка дней:
 * самое раннее окно, ближайшие выходные и длинная неделя.
 */
export async function getFreeWindows(): Promise<{
  windows: FreeWindow[]
  settings: AvailabilitySettings
}> {
  let ranges: BusyRange[] = []
  let settings: AvailabilitySettings = DEFAULT_SETTINGS
  let seasons: SeasonalPrice[] = []

  try {
    const supabase = createServiceClient()

    // Календарь Авито тянем параллельно с базой: раньше он ждал её ответа,
    // и время рендера складывалось из двух задержек подряд.
    const envAvitoUrl = process.env.AVITO_ICS_URL || ''

    const [bookings, dbSettings, dbSeasons, envAvito] = await Promise.all([
      supabase.from('bookings').select('check_in, check_out').eq('status', 'confirmed'),
      supabase.from('settings').select('*').eq('id', 1).single(),
      supabase.from('seasonal_prices').select('*').eq('active', true).order('sort_order'),
      envAvitoUrl ? fetchAvitoRanges(envAvitoUrl) : Promise.resolve(null),
    ])

    ranges = (bookings.data ?? []).map((b) => ({ start: b.check_in, end: b.check_out }))
    seasons = (dbSeasons.data ?? []) as SeasonalPrice[]

    if (dbSettings.data) {
      const clean = Object.fromEntries(
        Object.entries(dbSettings.data).filter(([, v]) => v !== null && v !== undefined && v !== ''),
      )
      settings = { ...DEFAULT_SETTINGS, ...clean } as AvailabilitySettings
    }

    // Адрес из настроек приоритетнее: если он совпал с переменной окружения,
    // переиспользуем уже полученный параллельно ответ и не ходим по сети снова.
    const dbAvitoUrl = dbSettings.data?.avito_ics_url || ''
    const avitoUrl = dbAvitoUrl || envAvitoUrl

    if (avitoUrl) {
      const reuse = envAvito && avitoUrl === envAvitoUrl ? envAvito : await fetchAvitoRanges(avitoUrl)
      ranges = [...ranges, ...reuse.ranges]
    }
  } catch (err) {
    console.error('[free-windows] Не удалось получить занятость:', err)
  }

  const minNights = Math.max(1, settings.minimum_nights)
  const runs = freeRuns(ranges, minNights)
  if (!runs.length) return { windows: [], settings }

  const windows: FreeWindow[] = []
  const seen = new Set<string>()

  const push = (w: FreeWindow) => {
    const key = `${w.start}:${w.nights}`
    if (seen.has(key)) return
    seen.add(key)
    windows.push(w)
  }

  // 1. Самое раннее свободное окно
  const first = runs[0]
  push(build(first.start, Math.min(first.nights, Math.max(minNights, 3)), 'Раньше всего', seasons, settings))

  // 2. Ближайшая свободная пятница — «выходные под баню»
  const weekendNights = Math.max(minNights, 2)
  for (const run of runs) {
    let found: Date | null = null
    for (let i = 0; i + weekendNights <= run.nights; i++) {
      const day = addDays(run.start, i)
      if (day.getDay() === 5) {
        found = day
        break
      }
    }
    if (found) {
      push(build(found, weekendNights, 'Выходные с баней', seasons, settings))
      break
    }
  }

  // 3. Первое окно, где помещается целая неделя
  const weekNights = Math.max(minNights, 7)
  const longRun = runs.find((r) => r.nights >= weekNights)
  if (longRun) push(build(longRun.start, weekNights, 'Неделя у озера', seasons, settings))

  // Если вариантов меньше трёх — добираем следующими свободными окнами
  for (const run of runs.slice(1)) {
    if (windows.length >= 3) break
    push(build(run.start, Math.min(run.nights, Math.max(minNights, 3)), 'Свободно', seasons, settings))
  }

  return { windows: windows.slice(0, 3).sort((a, b) => a.start.localeCompare(b.start)), settings }
}
