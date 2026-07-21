"use client"

import { useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { AvailableDates } from "@/components/available-dates"
import { About } from "@/components/about"
import { Gallery } from "@/components/gallery"
import { QuoteBanner } from "@/components/quote-banner"
import { PriceCalculator } from "@/components/price-calculator"
import { Reviews } from "@/components/reviews"
import { FaqSection } from "@/components/faq-section"
import { HowToGetThere } from "@/components/how-to-get-there"
import { Contacts } from "@/components/contacts"
import { SiteFooter } from "@/components/site-footer"
import { BookingModal } from "@/components/booking-modal"
import { ScrollReveal } from "@/components/scroll-reveal"
import { WhatsAppButton } from "@/components/whatsapp-button"

export default function Page() {
  const [bookingOpen, setBookingOpen] = useState(false)
  const openBooking = () => setBookingOpen(true)

  return (
    <main>
      <ScrollReveal />
      <SiteHeader onBook={openBooking} />
      <Hero onBook={openBooking} />
      <AvailableDates onBook={openBooking} />
      <About />
      <Gallery />
      <QuoteBanner />
      <PriceCalculator onBook={openBooking} />
      <Reviews />
      <FaqSection />
      <HowToGetThere />
      <Contacts onBook={openBooking} />
      <SiteFooter />
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
      <WhatsAppButton />
    </main>
  )
}
