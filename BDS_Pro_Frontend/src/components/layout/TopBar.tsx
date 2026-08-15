import { Bell, LogOut, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { User } from '@/types'

interface TopBarProps {
  user: User
  title?: string
  showSearch?: boolean
  notificationCount?: number
  notificationPath?: string
}

export function TopBar({
  user,
  title,
  showSearch = false,
  notificationCount = 0,
  notificationPath = '/buyer/notifications',
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur-md">
      <div>{title && <h1 className="text-lg font-bold text-slate-900">{title}</h1>}</div>
      <div className="flex items-center gap-3">
        {showSearch && (
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Tìm BĐS, địa điểm..."
              className="w-72 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
            />
          </div>
        )}
        <Link
          to={notificationPath}
          className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          title="Thông báo"
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {notificationCount}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
          <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-full object-cover ring-2 ring-brand-100" />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user.role === 'buyer' ? 'Người tìm BĐS' : user.role === 'agent' ? 'Môi giới' : 'Admin'}</p>
          </div>
        </div>
        <Link to="/login" className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600" title="Đăng xuất">
          <LogOut className="h-4 w-4" />
        </Link>
      </div>
    </header>
  )
}
