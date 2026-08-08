import { ScrollReveal } from "@/components/scroll-reveal"
import { BookingProvider } from "@/components/lux/booking-provider"
import { ContactDock } from "@/components/lux/contact-dock"
import { SiteNav } from "@/components/lux/site-nav"
import { SiteFooter } from "@/components/lux/site-footer"

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <BookingProvider>
      <ScrollReveal />
      <SiteNav />
      <main id="content">{children}</main>
      <SiteFooter />
      <ContactDock />
    </BookingProvider>
  )
}
