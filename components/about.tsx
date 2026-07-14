import Image from "next/image"
import { Trees, Flame, Wifi, Ship } from "lucide-react"

const features = [
  { icon: Trees, title: "Два озера рядом", text: "Дом стоит между двумя озёрами — со своим пляжем и причалом." },
  { icon: Flame, title: "Баня и чан", text: "Настоящая баня и сибирский чан на берегу озера под открытым небом." },
  { icon: Wifi, title: "Всё для комфорта", text: "Полностью оборудованная кухня, посудомойка, Wi-Fi, бельё." },
  { icon: Ship, title: "Лодка и сап-борд", text: "В аренду: лодка, сап-борды, спиннинг — рыбалка и прогулки." },
]

export function About() {
  return (
    <section id="about" className="bg-background py-16 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Image — shown first on mobile */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl lg:order-last">
            <Image
              src="/images/real/photo8.jpg"
              alt="Уютная спальня с бревенчатыми стенами, вид на лес"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Об усадьбе</p>
            <h2 className="mt-3 text-balance font-serif text-3xl leading-tight text-foreground sm:text-5xl">
              Место, куда хочется возвращаться
            </h2>
            <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">
              Усадьба в Антропково — это большой (250 м²) бревенчатый дом в Псковской области, который находится между
              двумя озёрами, со своим причалом, баней и купелью. Всего 5 часов от Москвы — и вы в уединённом месте
              с потрясающей природой.
            </p>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              Четыре просторные спальни с отдельными санузлами, огромная гостиная с камином, оборудованная кухня.
              Рядом — легендарная усадьба Ореховно. Скидка 10% при бронировании от 5 ночей.
            </p>

            <dl className="mt-8 grid grid-cols-3 gap-4">
              <div>
                <dt className="font-serif text-3xl text-primary sm:text-4xl">250 м²</dt>
                <dd className="mt-1 text-xs text-muted-foreground sm:text-sm">Площадь дома</dd>
              </div>
              <div>
                <dt className="font-serif text-3xl text-primary sm:text-4xl">4</dt>
                <dd className="mt-1 text-xs text-muted-foreground sm:text-sm">Спальни со своим санузлом</dd>
              </div>
              <div>
                <dt className="font-serif text-3xl text-primary sm:text-4xl">5,0</dt>
                <dd className="mt-1 text-xs text-muted-foreground sm:text-sm">Рейтинг Яндекс·Карты</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:mt-16 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-11">
                <f.icon className="size-5" />
              </div>
              <h3 className="mt-4 font-serif text-lg text-foreground sm:text-xl">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
