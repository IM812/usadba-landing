import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Manrope } from 'next/font/google'
import { SITE_URL } from '@/lib/site'
import './globals.css'

// Заголовочный гротеск: плотный, с широким диапазоном веса и кириллицей.
const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
})

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
  themeColor: '#0c1714',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // suppressHydrationWarning: скрипт ниже дописывает класс на <html> до
    // гидратации, поэтому серверная и клиентская разметка тут расходятся штатно.
    <html
      lang="ru"
      suppressHydrationWarning
      className={`bg-background ${manrope.variable} ${inter.variable}`}
    >
      <head>
        {/*
          Включает анимацию появления блоков только при живом JS. Пока класса нет,
          [data-reveal] полностью видим — так пустой экран невозможен в принципе,
          даже если бандл не догрузился. Страховка снимает класс через 4 секунды.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;d.classList.add('reveal-ready');setTimeout(function(){d.classList.remove('reveal-ready')},4000)}catch(e){}})()`,
          }}
        />
      </head>
      <body className="bg-background text-foreground font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
