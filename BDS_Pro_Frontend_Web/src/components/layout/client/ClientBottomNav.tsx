import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ClipboardList, HandCoins, Home, Search, User } from 'lucide-react'
import { CLIENT_ROUTES } from '@/config/routes'
import { chatStorage } from '@/services/chatStorage'

const BASE_NAV_ITEMS: Array<{
  label: string
  path: string
  icon: typeof Home
  exact?: boolean
}> = [
  { label: 'Trang chủ', path: CLIENT_ROUTES.home, icon: Home, exact: true },
  { label: 'Tìm kiếm', path: CLIENT_ROUTES.search, icon: Search },
  { label: 'Giao dịch', path: CLIENT_ROUTES.deals, icon: HandCoins },
  { label: 'Hoạt động', path: CLIENT_ROUTES.activity, icon: ClipboardList },
  { label: 'Tài khoản', path: CLIENT_ROUTES.profile, icon: User },
]

export function ClientBottomNav() {
  const { pathname } = useLocation()
  const [unreadCount, setUnreadCount] = useState(() => chatStorage.getUnreadCount())

  useEffect(() => {
    function updateUnread() {
      setUnreadCount(chatStorage.getUnreadCount())
    }
    updateUnread()
    window.addEventListener('bdspro_chat_updated', updateUnread)
    window.addEventListener('storage', updateUnread)
    return () => {
      window.removeEventListener('bdspro_chat_updated', updateUnread)
      window.removeEventListener('storage', updateUnread)
    }
  }, [])

  return (
    <nav className="portal-bottom-nav" aria-label="Điều hướng chính">
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {BASE_NAV_ITEMS.map((item) => {
          const active = item.exact
            ? pathname === item.path
            : pathname.startsWith(item.path)
          const Icon = item.icon
          const badgeCount = item.path === CLIENT_ROUTES.activity && unreadCount > 0 ? unreadCount : undefined

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`portal-bottom-nav-item ${active ? 'portal-bottom-nav-item-active' : ''}`}
            >
              <Icon className={`h-5 w-5 ${active ? 'text-brand-600' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
              {badgeCount ? (
                <span className="absolute right-2 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {badgeCount}
                </span>
              ) : null}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
