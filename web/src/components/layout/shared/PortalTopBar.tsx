import { type ReactNode } from 'react'
import { Search } from 'lucide-react'
import { PortalHeaderActions } from '@/components/layout/shared/PortalHeaderActions'
import type { Notification } from '@/types'

interface PortalTopBarProps {
  searchPlaceholder?: string
  user: { name: string; avatar: string; roleLabel: string }
  notifications: Notification[]
  actions?: ReactNode
  profilePath?: string
}

export function PortalTopBar({
  searchPlaceholder = 'Tìm kiếm...',
  user,
  notifications,
  actions,
  profilePath,
}: PortalTopBarProps) {
  return (
    <header className="portal-topbar">
      <div className="relative min-w-0 flex-1 md:max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder={searchPlaceholder}
          className="portal-input w-full py-2 pl-10 pr-3"
        />
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-3">
        {actions}
        <PortalHeaderActions user={user} notifications={notifications} profilePath={profilePath} />
      </div>
    </header>
  )
}
