import { Star, Quote } from "lucide-react"

const reviews = [
  {
    name: "Гость усадьбы",
    date: "Ноябрь 2024",
    rating: 5,
    text: "Отлично провели время всей семьей, 2 взрослых и 3 детей! Мега чистая территория, ухоженный дом, 4 спальни и в каждой спальне туалет и душ. Весь персонал очень гостеприимный. Место очень красивое — наловили рыбы, набрали грибов, надышались свежим воздухом! Баня небольшая, но очень уютная и чистая, чан с видом на озеро и лес — восторг.",
  },
  {
    name: "Гость усадьбы",
    date: "Сентябрь 2024",
    rating: 5,
    text: "Провели несколько дней в этом чудесном уединённом месте. 5 часов от Москвы — и вы в усадьбе с собственным пляжем, баней, чаном на берегу. Дети резвятся, взрослые смотрят на них из окна кухни, неторопливо готовя обед — сказка. Вечером — барбекю, баня, прогулки на лодках и сап-бордах. Идеальная перезагрузка.",
  },
  {
    name: "Гость усадьбы",
    date: "Июнь 2025",
    rating: 5,
    text: "Мега прекрасное место в Псковской области! Красиво, уютно, пение птиц, ароматы цветов и леса. Шикарный дом — просторный, современный, кухня оборудована всем необходимым и даже больше! Идеальная чистота. Море развлечений: баня, подогреваемый чан на улице, рыбалка, велосипеды, лодка, сап-сёрф, бадминтон, теннис...",
  },
  {
    name: "Гость усадьбы",
    date: "Сентябрь 2023",
    rating: 5,
    text: "Чудесное местечко! Дом огромный, просторный — самое то для большой семьи. Уютные спальни, чистые туалетные комнаты, огромная гостиная с камином, полки с книгами, кухня с красивой посудой. Баня и сибирский чан на берегу озера — отдельный вид блаженства!",
  },
  {
    name: "Гость усадьбы",
    date: "Декабрь 2023",
    rating: 5,
    text: "Шикарное место, очень уютно и комфортно. Отдельные комнаты, санузлы. А какая атмосфера и вид зимой!! Никого из гостей не оставили равнодушными баня и чан — это восторг. Крутая идея, здорово что это в Псковской области. Уверена, летом здесь также красиво и душевно.",
  },
  {
    name: "Гость усадьбы",
    date: "Июль 2024",
    rating: 5,
    text: "Отличное место для отдыха. Чувствуется что хозяева вложили сердце и большой труд в усадьбу и территорию. И внутри и снаружи уютно и комфортно, есть всё необходимое. Даже в непогоду найдётся чем заняться. Хозяева отличные, большое им спасибо за гостеприимство!",
  },
]

export function Reviews() {
  return (
    <section id="reviews" className="bg-background py-16 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Отзывы</p>
            <h2 className="mt-3 text-balance font-serif text-3xl leading-tight text-foreground sm:text-5xl">
              Что говорят гости
            </h2>
          </div>
          <div className="flex w-fit items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
            <div className="flex gap-0.5 text-accent">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-current" />
              ))}
            </div>
            <span className="font-serif text-xl font-medium text-foreground">5,0</span>
            <span className="text-sm text-muted-foreground">· 41 отзыв</span>
          </div>
        </div>

        {/* Mobile: horizontal scroll. Desktop: grid */}
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
          {reviews.map((r, idx) => (
            <figure key={idx} className="flex w-[82vw] shrink-0 flex-col rounded-2xl border border-border bg-card p-5 sm:w-auto sm:p-6">
              <Quote className="size-8 text-accent" />
              <div className="mt-3 flex gap-0.5 text-accent">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-pretty leading-relaxed text-muted-foreground">
                {r.text}
              </blockquote>
              <figcaption className="mt-6 border-t border-border pt-4">
                <p className="font-serif text-lg text-foreground">{r.name}</p>
                <p className="text-sm text-muted-foreground">{r.date}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
