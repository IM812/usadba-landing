import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
})

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Усадьба в Антропково — частная усадьба между двух озёр',
    template: '%s — Усадьба в Антропково',
  },
  description:
    'Частная бревенчатая усадьба 250 м² между двумя озёрами в Псковской области. Баня на дровах, сибирский чан, причал, лодка и сап-борды. Рейтинг 5,0 · 41 отзыв. 5 часов от Москвы.',
  keywords: [
    'усадьба Антропково',
    'дом на озере Псковская область',
    'баня и чан посуточно',
    'загородный дом целиком',
  ],
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'Усадьба в Антропково',
    title: 'Усадьба в Антропково — частная усадьба между двух озёр',
    description:
      'Бревенчатый дом 250 м² в сосновом лесу между двумя озёрами. Баня на дровах, сибирский чан, свой причал. Дом сдаётся целиком.',
    images: [{ url: '/images/real/photo11.jpg', width: 1024, height: 768 }],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: 'dark',
  themeColor: '#111a15',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className={`bg-background ${cormorant.variable} ${inter.variable}`}>
      <body className="bg-background text-foreground font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
