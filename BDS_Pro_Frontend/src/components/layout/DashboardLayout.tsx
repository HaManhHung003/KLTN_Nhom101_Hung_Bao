import { Outlet } from 'react-router-dom'
import { Sidebar, type NavItem } from './Sidebar'
import { TopBar } from './TopBar'
import type { User } from '@/types'

interface DashboardLayoutProps {
  user: User
  navItems: NavItem[]
  subtitle: string
  showSearch?: boolean
  notificationCount?: number
  notificationPath: string
}

export function DashboardLayout({
  user,
  navItems,
  subtitle,
  showSearch = false,
  notificationCount = 0,
  notificationPath,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar items={navItems} title={subtitle} subtitle={subtitle} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          user={user}
          showSearch={showSearch}
          notificationCount={notificationCount}
          notificationPath={notificationPath}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
