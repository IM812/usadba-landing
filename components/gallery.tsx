import Image from "next/image"

const photos = [
  { src: "/images/real/photo2.jpg",  alt: "Ночная подсветка соснового леса зимой", span: "sm:col-span-2 sm:row-span-2" },
  { src: "/images/real/photo3.jpg",  alt: "Сибирский чан с дымом осенью",           span: "" },
  { src: "/images/real/photo4.jpg",  alt: "Баня весной на фоне соснового леса",      span: "" },
  { src: "/images/real/photo5.jpg",  alt: "Чан с видом на озеро",                   span: "" },
  { src: "/images/real/photo6.jpg",  alt: "Вид на озеро через сосны",               span: "" },
  { src: "/images/real/photo1.jpg",  alt: "Терраса с подвесным креслом осенью",     span: "" },
  { src: "/images/real/photo12.jpg", alt: "Дорожка к озеру летом",                  span: "" },
  { src: "/images/real/photo9.jpg",  alt: "Камин в гостиной",                       span: "" },
  { src: "/images/real/photo7.jpg",  alt: "Уютная спальня с бревенчатыми стенами",  span: "" },
]

export function Gallery() {
  return (
    <section id="gallery" className="bg-secondary py-16 sm:py-28">
      <div data-reveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Галерея</p>
          <h2 className="mt-3 text-balance font-serif text-4xl leading-tight text-foreground sm:text-5xl">
            Загляните в усадьбу
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Дом, баня, терраса и природа вокруг — в каждом кадре.
          </p>
        </div>

        {/* Mobile: simple 2-col grid. Desktop: bento 3-col with spans */}
        <div className="grid grid-cols-2 gap-3 sm:auto-rows-[200px] sm:grid-cols-3 sm:gap-4 [&>*:first-child]:col-span-2 [&>*:first-child]:aspect-video sm:[&>*:first-child]:col-span-2 sm:[&>*:first-child]:row-span-2 sm:[&>*:first-child]:aspect-auto">
          {photos.map((p) => (
            <div
              key={p.src + p.alt}
              className={`group relative aspect-square overflow-hidden rounded-xl sm:aspect-auto sm:rounded-2xl ${p.span}`}
            >
              <Image
                src={p.src || "/placeholder.svg"}
                alt={p.alt}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="absolute bottom-3 left-4 text-sm font-medium text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100">
                {p.alt}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
