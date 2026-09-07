import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MapPin } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Страница не найдена — Усадьба в Антропково',
  description: 'Запрашиваемая страница не найдена.',
}

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-svh overflow-hidden bg-primary text-primary-foreground">
      <Image
        src="/images/real/photo11.jpg"
        alt="Усадьба в Антропково у озера"
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary via-primary/85 to-primary/35" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-foreground/60 via-transparent to-foreground/20" />

      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Link
          href="/"
          className="flex w-fit items-center gap-3 rounded-lg text-primary-foreground transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
          aria-label="Перейти на главную страницу усадьбы"
        >
          <span className="flex size-11 items-center justify-center rounded-full border border-primary-foreground/30 bg-primary-foreground/10 backdrop-blur-sm">
            <MapPin aria-hidden="true" className="size-5" />
          </span>
          <span>
            <span className="block font-serif text-xl leading-none">Усадьба</span>
            <span className="mt-1 block text-xs text-primary-foreground/70">в Антропково</span>
          </span>
        </Link>

        <section className="flex flex-1 items-center py-16 sm:py-20">
          <div className="max-w-2xl">
            <p className="font-sans text-sm font-semibold uppercase tracking-[0.24em] text-accent">
              Кажется, вы свернули не туда
            </p>
            <p
              aria-hidden="true"
              className="mt-4 font-serif text-8xl font-medium leading-none text-primary-foreground/20 sm:text-9xl lg:text-[11rem]"
            >
              404
            </p>
            <h1 className="-mt-3 text-balance font-serif text-4xl font-medium leading-tight sm:-mt-5 sm:text-6xl">
              Здесь только тишина и озёра
            </h1>
            <p className="mt-5 max-w-xl text-pretty font-sans text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
              Такой страницы в нашей усадьбе нет. Вернитесь на главную или свяжитесь с нами — поможем найти нужную информацию.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className={cn(buttonVariants({ size: 'lg' }), 'min-h-12 px-5 text-base')}
              >
                <ArrowLeft data-icon="inline-start" aria-hidden="true" />
                Вернуться на главную
              </Link>
              <Link
                href="/#contacts"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'min-h-12 border-primary-foreground/40 bg-primary-foreground/10 px-5 text-base text-primary-foreground backdrop-blur-sm hover:bg-primary-foreground/20 hover:text-primary-foreground',
                )}
              >
                Связаться с нами
              </Link>
            </div>
          </div>
        </section>

        <p className="font-sans text-sm text-primary-foreground/60">
          Псковская область · между двух озёр
        </p>
      </div>
    </main>
  )
}
