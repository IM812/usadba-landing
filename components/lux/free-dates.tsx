import { CalendarCheck } from "lucide-react"
import { FreeDateCard } from "@/components/lux/free-date-card"
import { Container, Section, SectionHeading, TextLink } from "@/components/lux/ui"
import { getFreeWindows } from "@/lib/free-windows"
import { nightsWord } from "@/lib/availability"

/**
 * Ближайшие свободные окна — считаются на сервере из подтверждённых броней
 * и календаря Авито, поэтому на телефоне блок не грузит ничего лишнего.
 */
export async function FreeDates() {
  const { windows, settings } = await getFreeWindows()

  return (
    <Section tone="base">
      <Container size="wide">
        <div data-reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Свободно прямо сейчас"
            title={
              <>
                Ближайшие
                <br />
                свободные даты
              </>
            }
          />
          <TextLink href="/booking" className="shrink-0">
            Весь календарь
          </TextLink>
        </div>

        {windows.length ? (
          <>
            <div data-reveal className="mt-12 grid gap-10 sm:mt-14 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-12">
              {windows.map((w) => (
                <FreeDateCard key={`${w.start}-${w.nights}`} window={w} />
              ))}
            </div>

            <p
              data-reveal
              className="mt-10 flex items-start gap-3 border-t border-border pt-6 text-[13px] leading-relaxed text-muted-foreground"
            >
              <CalendarCheck className="mt-px size-4 shrink-0 text-accent" aria-hidden />
              <span className="text-pretty">
                Даты обновляются автоматически вместе с календарём Авито. Минимальный заезд —{" "}
                {settings.minimum_nights} {nightsWord(settings.minimum_nights)}; дом всегда сдаётся
                целиком, без подселения.
              </span>
            </p>
          </>
        ) : (
          <p data-reveal className="mt-12 max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground">
            На ближайшие месяцы всё занято. Напишите нам — подскажем первые освободившиеся даты и
            поставим вас в лист ожидания.
          </p>
        )}
      </Container>
    </Section>
  )
}
