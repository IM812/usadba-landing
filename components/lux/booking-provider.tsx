"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"
import { BookingModal } from "@/components/booking-modal"

type BookingContextValue = {
  openBooking: () => void
  closeBooking: () => void
  isOpen: boolean
}

const BookingContext = createContext<BookingContextValue>({
  openBooking: () => {},
  closeBooking: () => {},
  isOpen: false,
})

/** Даёт любой странице доступ к модальному окну бронирования. */
export function useBooking() {
  return useContext(BookingContext)
}

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openBooking = useCallback(() => setIsOpen(true), [])
  const closeBooking = useCallback(() => setIsOpen(false), [])

  const value = useMemo(
    () => ({ openBooking, closeBooking, isOpen }),
    [openBooking, closeBooking, isOpen],
  )

  return (
    <BookingContext.Provider value={value}>
      {children}
      <BookingModal open={isOpen} onClose={closeBooking} />
    </BookingContext.Provider>
  )
}
