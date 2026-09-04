import { Link, useLocation } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  section?: string
}

interface SidebarProps {
  items: NavItem[]
  title: string
  subtitle?: string
}

export function Sidebar({ items, subtitle }: SidebarProps) {
  const location = useLocation()

  const sections = items.reduce<string[]>((acc, item) => {
    const sec = item.section ?? 'Menu'
    if (!acc.includes(sec)) acc.push(sec)
    return acc
  }, [])

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-teal-600 text-sm font-bold text-white shadow-sm">
            BP
          </div>
          <div>
            <p className="font-bold text-slate-900">BDS Pro</p>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {sections.map((section) => (
          <div key={section} className="mb-4">
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {section}
            </p>
            <div className="space-y-0.5">
              {items
                .filter((item) => (item.section ?? 'Menu') === section)
                .map((item) => {
                  const active =
                    location.pathname === item.path ||
                    (item.path !== '/buyer' &&
                      item.path !== '/agent' &&
                      item.path !== '/admin' &&
                      location.pathname.startsWith(item.path))
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                        active
                          ? 'bg-brand-50 text-brand-700 shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-brand-600' : ''}`} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  )
                })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
