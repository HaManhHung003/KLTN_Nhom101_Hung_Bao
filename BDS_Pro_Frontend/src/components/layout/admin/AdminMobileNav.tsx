import { Link, useLocation } from 'react-router-dom'
import { adminNav } from '@/components/layout/admin/adminNav.tsx'

export function AdminMobileNav() {
  const location = useLocation()

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-2 py-2 md:hidden">
      {adminNav.map((item) => {
        const active =
          item.path === '/admin/dashboard'
            ? location.pathname === item.path || location.pathname === '/admin'
            : location.pathname.startsWith(item.path)
        const Icon = item.icon
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition ${
              active ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {item.label.split(' ')[0]}
          </Link>
        )
      })}
    </nav>
  )
}
