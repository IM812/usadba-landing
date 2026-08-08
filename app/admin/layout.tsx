import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Панель управления — Усадьба в Антропково',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Панель управления живёт в собственной светлой теме,
  // независимо от тёмной темы публичного сайта.
  return <div className="theme-admin min-h-screen bg-background text-foreground">{children}</div>
}
