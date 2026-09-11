import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  Bell,
  Home,
  LayoutGrid,
  LogOut,
  Settings,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import { adminStats } from '@/data/mockData'
import type { User } from '@/types'

const navItems = [
  { label: 'Tổng quan', path: '/admin', icon: Home, exact: true },
  { label: 'Kiểm duyệt', path: '/admin/moderation', icon: ShieldCheck, badge: adminStats.pendingModeration },
  { label: 'Nội dung BĐS', path: '/admin/listings', icon: LayoutGrid },
  { label: 'Vận hành', path: '/admin/operations', icon: Wrench },
  { label: 'Hệ thống', path: '/admin/system', icon: Settings },
]

interface AdminLayoutProps {
  user: User
  notificationCount: number
}

export function AdminLayout({ user, notificationCount }: AdminLayoutProps) {
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-slate-200">
      <aside className="flex w-60 shrink-0 flex-col bg-slate-900 text-slate-300">
        <div className="border-b border-slate-800 px-5 py-5">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-sm font-bold text-white ring-1 ring-white/20">
              BP
            </div>
            <div>
              <p className="font-bold text-white">BDS Pro</p>
              <p className="text-xs text-slate-400">Console Quản trị</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const active = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path)
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
                {'badge' in item && item.badge ? (
                  <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <img src={user.avatar} alt="" className="h-9 w-9 rounded-full ring-2 ring-slate-700" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user.name}</p>
              <p className="text-xs text-slate-500">Admin</p>
            </div>
            <Link to="/admin/notifications" className="relative rounded-lg p-1.5 hover:bg-white/10">
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500" />
              )}
            </Link>
            <Link to="/login" className="rounded-lg p-1.5 text-slate-500 hover:bg-white/10 hover:text-white">
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
