export function SiteFooter() {
  return (
    <footer className="bg-foreground pb-28 pt-8 text-background md:pb-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-center sm:flex-row sm:gap-3 sm:text-left sm:px-6 lg:px-8">
        <p className="font-serif text-lg">Усадьба в Антропково</p>
        <p className="text-sm text-background/70">© {new Date().getFullYear()} Все права защищены</p>
      </div>
    </footer>
  )
}
