"use client"

import { useBooking } from "@/components/lux/booking-provider"
import { LuxButton } from "@/components/lux/ui"

/**
 * Кнопка «Забронировать» — открывает модальное окно из любого места сайта.
 * Полноценная страница бронирования доступна отдельно на /booking.
 */
export function BookButton({
  children = "Забронировать",
  variant = "brass",
  className,
}: {
  children?: React.ReactNode
  variant?: "brass" | "outline" | "quiet"
  className?: string
}) {
  const { openBooking } = useBooking()

  return (
    <LuxButton type="button" variant={variant} className={className} onClick={openBooking}>
      {children}
    </LuxButton>
  )
}
