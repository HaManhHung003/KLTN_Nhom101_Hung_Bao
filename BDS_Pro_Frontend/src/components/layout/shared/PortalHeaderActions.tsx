import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { LogoutButton } from '@/components/common/LogoutButton'
import type { Notification } from '@/types'

interface PortalHeaderActionsProps {
  user: { name: string; avatar: string; roleLabel: string }
  notifications: Notification[]
  profilePath?: string
}

export function PortalHeaderActions({ user, notifications, profilePath }: PortalHeaderActionsProps) {
  const [open, setOpen] = useState(false)
  const unread = notifications.filter((n) => !n.read)

  const profileBlock = (
    <>
      <img src={user.avatar} alt="" className="h-8 w-8 rounded-full ring-2 ring-brand-100 sm:h-9 sm:w-9" />
      <div className="hidden sm:block">
        <p className="max-w-[120px] truncate text-sm font-semibold text-slate-900">{user.name}</p>
        <p className="text-xs text-slate-500">{user.roleLabel}</p>
      </div>
    </>
  )

  return (
    <div className="flex shrink-0 items-center gap-1 sm:gap-3">
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 sm:p-2.5"
          aria-expanded={open}
          aria-haspopup="true"
        >
          <Bell className="h-5 w-5" />
          {unread.length > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unread.length}
            </span>
          )}
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
            <div className="absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-1.5rem))] rounded-2xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="font-semibold text-slate-900">Thông báo</p>
                <p className="text-xs text-slate-500">{unread.length} chưa đọc</p>
              </div>
              <ul className="max-h-72 overflow-y-auto p-2">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`rounded-xl px-3 py-2.5 text-sm ${n.read ? 'text-slate-600' : 'bg-brand-50 text-slate-900'}`}
                  >
                    <p className="font-medium">{n.title}</p>
                    <p className="text-xs text-slate-500">{n.message}</p>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>

      <div className="hidden items-center gap-2 border-l border-slate-200 pl-2 sm:flex sm:gap-3 sm:pl-3">
        {profilePath ? (
          <Link to={profilePath} className="flex items-center gap-2 transition hover:opacity-80">
            {profileBlock}
          </Link>
        ) : (
          <div className="flex items-center gap-2">{profileBlock}</div>
        )}
      </div>

      <LogoutButton variant="ghost" showLabel={false} />
    </div>
  )
}
