/**
 * Общая логика расчёта цены проживания.
 *
 * Раньше эти правила были продублированы в трёх местах (калькулятор на
 * главной, форма бронирования, серверный обработчик брони) и легко могли
 * разойтись. Теперь все три места используют этот модуль.
 */

import { nightsBetween } from './date'

export type SeasonalPrice = {
  date_from: string // MM-DD
  date_to: string // MM-DD
  base_price: number
  weekend_price: number
}

export type NightPrice = {
  date: Date
  price: number
  weekend: boolean
  /** true, если к этой ночи применён коэффициент за одну ночь на выходных */
  singleNightSurcharge: boolean
}

export type StayPrice = {
  nights: number
  nightsList: NightPrice[]
  /** Сумма всех ночей (без доп. гостей и уборки) */
  subtotal: number
}

// --- Повышающий коэффициент за бронь ровно на одну ночь в Пт/Сб -----------
// Высокий сезон: 1 мая – 30 сентября. Низкий сезон: 1 октября – 30 апреля.
// Применяется только когда бронь состоит из ровно одной ночи и эта ночь —
// пятница или субботa.
export const HIGH_SEASON_SINGLE_NIGHT_SURCHARGE = 0.5 // +50%
export const LOW_SEASON_SINGLE_NIGHT_SURCHARGE = 0.2 // +20%

/** Допуслуга «Баня и чан» — фиксированная плата за топку, не зависит от числа ночей. */
export const SAUNA_ADDON_PRICE = 7700
export const SAUNA_ADDON_LABEL = 'Баня и чан (топка)'

/** Пт или Сб — «выходная» ночь для целей ценообразования. */
export function isWeekendNight(d: Date): boolean {
  const day = d.getDay()
  return day === 5 || day === 6
}

/** Высокий сезон: 1 мая (включительно) – 1 октября (не включая). */
export function isHighSeason(d: Date): boolean {
  const key = (d.getMonth() + 1) * 100 + d.getDate()
  return key >= 501 && key < 1001
}

/** Ширина сезона в днях — используется, чтобы более узкий диапазон имел приоритет. */
function seasonWidth(from: string, to: string): number {
  const [fm, fd] = from.split('-').map(Number)
  const [tm, td] = to.split('-').map(Number)
  const fromDay = fm * 31 + fd
  const toDay = tm * 31 + td
  return toDay >= fromDay ? toDay - fromDay : (12 * 31 + 31) - fromDay + toDay
}

/** Базовая цена ночи (без коэффициента за одну ночь на выходных). */
export function getSeasonalNightPrice(
  d: Date,
  seasons: SeasonalPrice[],
  fallbackBase: number,
  fallbackWeekend: number,
): number {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const key = `${mm}-${dd}`

  // Самый узкий совпадающий диапазон побеждает — конкретный сезон важнее общего
  const sorted = [...seasons].sort(
    (a, b) => seasonWidth(a.date_from, a.date_to) - seasonWidth(b.date_from, b.date_to),
  )

  for (const s of sorted) {
    const from = s.date_from
    const to = s.date_to
    const inRange = from <= to ? key >= from && key <= to : key >= from || key <= to
    if (inRange) return isWeekendNight(d) ? s.weekend_price : s.base_price
  }
  return isWeekendNight(d) ? fallbackWeekend : fallbackBase
}

/**
 * Считает цену за весь период [checkIn, checkOut).
 *
 * Если бронь ровно на одну ночь и это ночь Пт→Сб или Сб→Вс — цена этой ночи
 * умножается на повышающий коэффициент: +50% в высокий сезон (май–сентябрь),
 * +20% в остальное время (октябрь–апрель).
 */
export function calculateStayPrice(
  checkIn: Date,
  checkOut: Date,
  basePrice: number,
  weekendPrice: number,
  seasons: SeasonalPrice[] = [],
): StayPrice {
  const nights = Math.max(0, nightsBetween(checkIn, checkOut))

  const nightsList: NightPrice[] = []
  for (let i = 0; i < nights; i++) {
    const d = new Date(checkIn)
    d.setDate(d.getDate() + i)
    const weekend = isWeekendNight(d)
    let price = getSeasonalNightPrice(d, seasons, basePrice, weekendPrice)
    let singleNightSurcharge = false

    if (nights === 1 && weekend) {
      const surcharge = isHighSeason(d)
        ? HIGH_SEASON_SINGLE_NIGHT_SURCHARGE
        : LOW_SEASON_SINGLE_NIGHT_SURCHARGE
      price = Math.round(price * (1 + surcharge))
      singleNightSurcharge = true
    }

    nightsList.push({ date: d, price, weekend, singleNightSurcharge })
  }

  const subtotal = nightsList.reduce((sum, n) => sum + n.price, 0)
  return { nights, nightsList, subtotal }
}
