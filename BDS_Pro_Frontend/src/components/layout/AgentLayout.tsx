import { Link, Outlet, useLocation } from 'react-router-dom'
import { BarChart3, Bell, Calendar, FileText, Home, LogOut, Plus, Users } from 'lucide-react'
import type { User } from '@/types'

const navItems = [
  { label: 'Tổng quan', path: '/agent', icon: Home, exact: true },
  { label: 'Tin đăng', path: '/agent/listings', icon: FileText },
  { label: 'Khách hàng', path: '/agent/customers', icon: Users },
  { label: 'Lịch hẹn', path: '/agent/appointments', icon: Calendar },
  { label: 'Báo cáo', path: '/agent/analytics', icon: BarChart3 },
]

interface AgentLayoutProps {
  user: User
  notificationCount: number
}

export function AgentLayout({ user, notificationCount }: AgentLayoutProps) {
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="flex w-60 shrink-0 flex-col bg-white border-r border-slate-200">
        <div className="border-b border-slate-100 px-5 py-5">
          <Link to="/agent" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
              BP
            </div>
            <div>
              <p className="font-bold text-slate-900">BDS Pro</p>
              <p className="text-xs text-brand-600 font-medium">Kênh Môi giới</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const active =
              item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path)
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-brand-600' : ''}`} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <Link
            to="/agent/listings/new"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Đăng tin mới
          </Link>
        </div>

        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <img src={user.avatar} alt="" className="h-9 w-9 rounded-full ring-2 ring-brand-100" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
            <Link to="/agent/notifications" className="relative rounded-lg p-1.5 hover:bg-slate-100">
              <Bell className="h-4 w-4 text-slate-500" />
              {notificationCount > 0 && (
                <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500" />
              )}
            </Link>
            <Link to="/login" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
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
