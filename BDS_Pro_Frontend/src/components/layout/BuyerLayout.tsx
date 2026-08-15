import { Link, Outlet, useLocation } from 'react-router-dom'
import { Bell, Bot, CalendarDays, Heart, Home, LogOut, Search, User } from 'lucide-react'
import type { User as UserType } from '@/types'

const navItems = [
  { label: 'Trang chủ', path: '/buyer', icon: Home, exact: true },
  { label: 'Khám phá', path: '/buyer/explore', icon: Search },
  { label: 'Hoạt động', path: '/buyer/activity', icon: CalendarDays },
  { label: 'Đã lưu', path: '/buyer/saved', icon: Heart },
]

interface BuyerLayoutProps {
  user: UserType
  notificationCount: number
}

export function BuyerLayout({ user, notificationCount }: BuyerLayoutProps) {
  const location = useLocation()
  const isActive = (path: string, exact?: boolean) =>
    exact ? location.pathname === path : location.pathname.startsWith(path)

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/buyer" className="flex shrink-0 items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 to-teal-600 text-sm font-bold text-white shadow-md shadow-sky-200">
              BP
            </div>
            <span className="hidden font-bold text-slate-900 sm:block">BDS Pro</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const active = isActive(item.path, item.exact)
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                    active ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/buyer/chatbot"
              className="hidden rounded-xl bg-violet-50 p-2.5 text-violet-600 transition hover:bg-violet-100 sm:flex"
              title="Trợ lý AI"
            >
              <Bot className="h-5 w-5" />
            </Link>
            <Link to="/buyer/profile" className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
              )}
            </Link>
            <Link to="/buyer/profile" className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-3 hover:bg-slate-100">
              <img src={user.avatar} alt="" className="h-8 w-8 rounded-full ring-2 ring-sky-100" />
              <span className="hidden text-sm font-medium text-slate-700 lg:block">{user.name.split(' ').pop()}</span>
            </Link>
            <Link to="/login" className="rounded-xl p-2 text-slate-400 hover:bg-slate-100" title="Đăng xuất">
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <nav className="flex border-t border-slate-100 md:hidden">
          {navItems.map((item) => {
            const active = isActive(item.path, item.exact)
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${
                  active ? 'text-sky-600' : 'text-slate-500'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
          <Link to="/buyer/profile" className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-slate-500">
            <User className="h-5 w-5" />
            Tài khoản
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 pb-24 md:pb-6">
        <Outlet />
      </main>

      <Link
        to="/buyer/chatbot"
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-300 transition hover:scale-105 md:bottom-6"
        title="Trợ lý AI"
      >
        <Bot className="h-6 w-6" />
      </Link>
    </div>
  )
}
