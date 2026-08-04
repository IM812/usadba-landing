/**
 * Локальные утилиты для работы с датами-«днями» (YYYY-MM-DD).
 *
 * ВАЖНО: никогда не используйте `date.toISOString().slice(0, 10)` для
 * получения ключа дня. `toISOString()` переводит дату в UTC, поэтому у
 * пользователей с положительным смещением (МСК = UTC+3) локальная полночь
 * превращается в предыдущий день — и весь календарь съезжает на сутки.
 */

/** Ключ дня по локальному календарю: 2026-08-05 */
export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Разбирает YYYY-MM-DD в локальную полночь (без UTC-сдвига) */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

/** Локальная полночь сегодняшнего дня */
export function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

/** Ключ сегодняшнего дня */
export function todayKey(): string {
  return toDateKey(new Date())
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

/** Количество ночей между двумя днями (устойчиво к переходу на летнее время) */
export function nightsBetween(a: Date, b: Date): number {
  const from = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
  const to = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
  return Math.round((to - from) / 86_400_000)
}
