import { cache } from 'react'
import { createServiceClient } from '@/lib/supabase/server'

export type RateSettings = {
  base_price: number
  weekend_price: number
  extra_guest_price: number
  cleaning_fee: number
  minimum_nights: number
  base_guests: number
  max_guests: number
  price_mode: 'base' | 'seasonal'
  check_in_time: string
  check_out_time: string
}

export type SeasonalRate = {
  id: string
  name: string
  date_from: string
  date_to: string
  base_price: number
  weekend_price: number
  sort_order: number
}

const FALLBACK: RateSettings = {
  base_price: 20000,
  weekend_price: 24000,
  extra_guest_price: 1650,
  cleaning_fee: 0,
  minimum_nights: 1,
  base_guests: 8,
  max_guests: 15,
  price_mode: 'base',
  check_in_time: '14:00',
  check_out_time: '12:00',
}

/**
 * Читает тарифы из БД для серверного рендеринга.
 *
 * Обёрнуто в React cache(): на одной странице функцию вызывают и сама страница,
 * и футер, и подсчёт свободных окон — раньше это давало по 2–3 одинаковых
 * запроса к Supabase на каждый рендер и добавляло сотни миллисекунд.
 */
export const getRates = cache(async function getRates(): Promise<{
  settings: RateSettings
  seasons: SeasonalRate[]
}> {
  try {
    const supabase = createServiceClient()
    const [{ data: settings }, { data: seasons }] = await Promise.all([
      supabase
        .from('settings')
        .select(
          'base_price, weekend_price, extra_guest_price, cleaning_fee, minimum_nights, base_guests, max_guests, price_mode, check_in_time, check_out_time',
        )
        .eq('id', 1)
        .single(),
      supabase
        .from('seasonal_prices')
        .select('id, name, date_from, date_to, base_price, weekend_price, sort_order')
        .eq('active', true)
        // при равном sort_order (по умолчанию он одинаковый) сезоны идут
        // по календарю, а не в случайном порядке вставки
        .order('sort_order')
        .order('date_from'),
    ])

    // null-колонки не должны затирать дефолты
    const clean = Object.fromEntries(
      Object.entries(settings ?? {}).filter(([, v]) => v !== null && v !== undefined && v !== ''),
    )

    return {
      settings: { ...FALLBACK, ...clean } as RateSettings,
      seasons: (seasons ?? []) as SeasonalRate[],
    }
  } catch (err) {
    console.error('[rates] failed to load', err)
    return { settings: FALLBACK, seasons: [] }
  }
})

/** «06-01» → «1 июня» */
export function formatMonthDay(md: string): string {
  const MONTHS = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
  ]
  const [m, d] = md.split('-').map(Number)
  if (!m || !d) return md
  return `${d} ${MONTHS[m - 1]}`
}

export const formatMoney = (n: number) => new Intl.NumberFormat('ru-RU').format(n)

/** Название сезона из админки может быть введено с маленькой буквы. */
export const seasonTitle = (name: string) =>
  name ? name.charAt(0).toUpperCase() + name.slice(1) : name
