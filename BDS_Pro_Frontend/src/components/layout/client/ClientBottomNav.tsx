import { Link, useLocation } from 'react-router-dom'
import { ClipboardList, HandCoins, Home, Search, User } from 'lucide-react'
import { CLIENT_ROUTES } from '@/config/routes'

const NAV_ITEMS: Array<{
  label: string
  path: string
  icon: typeof Home
  exact?: boolean
  badge?: number
}> = [
  { label: 'Trang chủ', path: CLIENT_ROUTES.home, icon: Home, exact: true },
  { label: 'Tìm kiếm', path: CLIENT_ROUTES.search, icon: Search },
  { label: 'Giao dịch', path: CLIENT_ROUTES.deals, icon: HandCoins },
  { label: 'Hoạt động', path: CLIENT_ROUTES.activity, icon: ClipboardList, badge: 2 },
  { label: 'Tài khoản', path: CLIENT_ROUTES.profile, icon: User },
]

export function ClientBottomNav() {
  const { pathname } = useLocation()

  return (
    <nav className="portal-bottom-nav" aria-label="Điều hướng chính">
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {NAV_ITEMS.map((item) => {
          const active = item.exact
            ? pathname === item.path
            : pathname.startsWith(item.path)
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`portal-bottom-nav-item ${active ? 'portal-bottom-nav-item-active' : ''}`}
            >
              <Icon className={`h-5 w-5 ${active ? 'text-brand-600' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
              {item.badge ? (
                <span className="absolute right-2 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
