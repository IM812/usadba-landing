import { SITE_URL, contacts, site } from "@/lib/site"

/** Абсолютный URL из относительного пути (домен кириллический — URL сам даст punycode). */
const abs = (path = "/") => new URL(path, SITE_URL).toString()

function Script({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Данные статические и не содержат пользовательского ввода
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

/**
 * LodgingBusiness для главной: адрес, координаты, контакты и рейтинг.
 * Это то, что Яндекс и Google используют для карточки объекта в выдаче.
 */
export function LodgingJsonLd({ checkIn, checkOut }: { checkIn: string; checkOut: string }) {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "LodgingBusiness",
        "@id": abs("/#lodging"),
        name: site.name,
        description: `Бревенчатый дом 250 м² в сосновом бору между двух озёр. Баня на дровах, сибирский чан, собственный причал. ${site.region}.`,
        url: abs("/"),
        telephone: contacts.phoneLabel,
        email: contacts.email,
        address: {
          "@type": "PostalAddress",
          addressCountry: "RU",
          addressRegion: site.region,
          addressLocality: "д. Антропково",
          streetAddress: "Новосокольнический район",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: contacts.coords.lat,
          longitude: contacts.coords.lon,
        },
        hasMap: contacts.mapsUrl,
        petsAllowed: true,
        numberOfRooms: 4,
        maximumAttendeeCapacity: 15,
        checkinTime: checkIn,
        checkoutTime: checkOut,
        priceRange: "₽₽",
        currenciesAccepted: "RUB",
        amenityFeature: [
          "Баня на дровах",
          "Сибирский чан",
          "Причал на озере",
          "Мангальная зона",
          "Wi-Fi",
          "Парковка",
        ].map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })),
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: site.rating.value.replace(",", "."),
          reviewCount: site.rating.count,
          bestRating: "5",
        },
        sameAs: [contacts.mapsUrl, contacts.telegram],
      }}
    />
  )
}

/** FAQPage — даёт раскрывающиеся вопросы прямо в результатах поиска. */
export function FaqJsonLd({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }}
    />
  )
}
