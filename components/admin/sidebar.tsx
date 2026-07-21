'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Settings,
  Image,
  Star,
  HelpCircle,
  MessageSquare,
  CalendarSync,
  LogOut,
  Menu,
  X,
  Home,
  DollarSign,
  Wrench,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/bookings', label: 'Бронирования', icon: ClipboardList },
  { href: '/admin/calendar', label: 'Календарь', icon: CalendarDays },
  { href: null, label: 'Сайт', icon: null, section: true },
  { href: '/admin/settings/prices', label: 'Цены', icon: DollarSign },
  { href: '/admin/settings/site', label: 'Контент', icon: Home },
  { href: '/admin/settings/gallery', label: 'Галерея', icon: Image },
  { href: '/admin/settings/amenities', label: 'Удобства', icon: Wrench },
  { href: '/admin/settings/reviews', label: 'Отзывы', icon: Star },
  { href: '/admin/settings/faq', label: 'FAQ', icon: HelpCircle },
  { href: null, label: 'Интеграции', icon: null, section: true },
  { href: '/admin/settings/telegram', label: 'Telegram', icon: MessageSquare },
  { href: '/admin/settings/ics', label: 'ICS Синхронизация', icon: CalendarSync },
]

function NavLink({
  href,
  label,
  icon: Icon,
  exact,
  onClick,
}: {
  href: string
  label: string
  icon: React.ElementType
  exact?: boolean
  onClick?: () => void
}) {
  const pathname = usePathname()
  const active = exact ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
      )}
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </Link>
  )
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="size-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Settings className="size-4 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">Усадьба</p>
          <p className="text-xs text-muted-foreground">Панель управления</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {navItems.map((item, i) => {
          if (item.section) {
            return (
              <p key={i} className="px-3 pt-4 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {item.label}
              </p>
            )
          }
          return (
            <NavLink
              key={item.href}
              href={item.href!}
              label={item.label}
              icon={item.icon!}
              exact={item.exact}
              onClick={onClose}
            />
          )
        })}
      </nav>

      <div className="border-t border-border p-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <LogOut className="size-4 shrink-0" />
          Выйти
        </button>
      </div>
    </div>
  )
}

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between border-b border-border bg-card px-4 py-3 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-primary flex items-center justify-center">
            <Settings className="size-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground">Усадьба Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Открыть меню"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Закрыть меню"
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-card">
        <SidebarContent />
      </aside>
    </>
  )
}
