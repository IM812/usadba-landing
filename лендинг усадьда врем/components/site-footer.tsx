export function SiteFooter() {
  return (
    <footer className="bg-foreground py-8 text-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-8">
        <p className="font-serif text-lg">Усадьба в Антропково</p>
        <p className="text-sm text-background/70">© {new Date().getFullYear()} Все права защищены</p>
      </div>
    </footer>
  )
}
