import { addDays, nightsBetween, toDateKey } from '@/lib/date'

export type BusyRange = { start: string; end: string }

export type AvailabilitySettings = {
  base_price: number
  weekend_price: number
  extra_guest_price: number
  cleaning_fee: number
  minimum_nights: number
  base_guests: number
  max_guests: number
  price_mode: 'base' | 'seasonal'
}

export type SeasonalPrice = {
  id: string
  name: string
  date_from: string // MM-DD
  date_to: string // MM-DD
  base_price: number
  weekend_price: number
}

export const DEFAULT_SETTINGS: AvailabilitySettings = {
  base_price: 20000,
  weekend_price: 24000,
  extra_guest_price: 0,
  cleaning_fee: 0,
  minimum_nights: 1,
  base_guests: 8,
  max_guests: 15,
  price_mode: 'base',
}

/**
 * Единая логика занятости для всего сайта.
 *
 * Жёстко заняты только дни СТРОГО внутри брони. День заезда предыдущего гостя
 * (r.start) и день его выезда (r.end) остаются доступными: выезд до 12:00,
 * заезд после 16:00 — в эти сутки дом успевает сменить гостей.
 */
export function isDayBusy(key: string, ranges: readonly BusyRange[]): boolean {
  return ranges.some((r) => key > r.start && key < r.end)
}

/** Ночь занята, если она попадает в интервал [start, end). */
export function isNightBusy(key: string, ranges: readonly BusyRange[]): boolean {
  return ranges.some((r) => key >= r.start && key < r.end)
}

/** Можно ли занять все ночи между заездом и выездом. */
export function isRangeFree(
  checkIn: Date,
  checkOut: Date,
  ranges: readonly BusyRange[],
): boolean {
  const nights = nightsBetween(checkIn, checkOut)
  for (let i = 0; i < nights; i++) {
    if (isNightBusy(toDateKey(addDays(checkIn, i)), ranges)) return false
  }
  return true
}

/** Пятница и суббота считаются выходными для тарифа. */
export function isWeekendNight(d: Date): boolean {
  const day = d.getDay()
  return day === 5 || day === 6
}

/** Ширина сезона в днях — узкий сезон перекрывает широкий. */
function seasonWidth(from: string, to: string): number {
  const [fm, fd] = from.split('-').map(Number)
  const [tm, td] = to.split('-').map(Number)
  const fromDay = fm * 31 + fd
  const toDay = tm * 31 + td
  return toDay >= fromDay ? toDay - fromDay : 12 * 31 + 31 - fromDay + toDay
}

/** Цена за конкретную ночь с учётом сезона и дня недели. */
export function priceForNight(
  d: Date,
  seasons: readonly SeasonalPrice[],
  settings: AvailabilitySettings,
): number {
  const key = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  if (settings.price_mode === 'seasonal' && seasons.length) {
    const sorted = [...seasons].sort(
      (a, b) =>
        seasonWidth(a.date_from, a.date_to) - seasonWidth(b.date_from, b.date_to),
    )
    for (const s of sorted) {
      const inRange =
        s.date_from <= s.date_to
          ? key >= s.date_from && key <= s.date_to
          : key >= s.date_from || key <= s.date_to
      if (inRange) return isWeekendNight(d) ? s.weekend_price : s.base_price
    }
  }

  return isWeekendNight(d) ? settings.weekend_price : settings.base_price
}

export type Quote = {
  nights: number
  nightsTotal: number
  extraGuests: number
  extraGuestFee: number
  cleaningFee: number
  total: number
  belowMinimum: boolean
}

/** Полный расчёт стоимости проживания. */
export function quoteStay(
  checkIn: Date,
  checkOut: Date,
  guests: number,
  seasons: readonly SeasonalPrice[],
  settings: AvailabilitySettings,
): Quote {
  const nights = Math.max(0, nightsBetween(checkIn, checkOut))

  let nightsTotal = 0
  for (let i = 0; i < nights; i++) {
    nightsTotal += priceForNight(addDays(checkIn, i), seasons, settings)
  }

  const extraGuests = Math.max(0, guests - settings.base_guests)
  const extraGuestFee = extraGuests * nights * settings.extra_guest_price
  const cleaningFee = settings.cleaning_fee

  return {
    nights,
    nightsTotal,
    extraGuests,
    extraGuestFee,
    cleaningFee,
    total: nightsTotal + extraGuestFee + cleaningFee,
    belowMinimum: nights > 0 && nights < settings.minimum_nights,
  }
}

export const money = (n: number) => new Intl.NumberFormat('ru-RU').format(n)

export const plural = (n: number, one: string, few: string, many: string) => {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}

export const nightsWord = (n: number) => plural(n, 'ночь', 'ночи', 'ночей')
export const guestsWord = (n: number) => plural(n, 'гость', 'гостя', 'гостей')
