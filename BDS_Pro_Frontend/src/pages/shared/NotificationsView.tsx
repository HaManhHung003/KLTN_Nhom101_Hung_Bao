import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import type { Notification } from '@/types'

interface NotificationsViewProps {
  notifications: Notification[]
  title?: string
  description?: string
}

const iconMap = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
}

const colorMap = {
  info: 'bg-blue-50 border-blue-100 text-blue-600',
  success: 'bg-emerald-50 border-emerald-100 text-emerald-600',
  warning: 'bg-amber-50 border-amber-100 text-amber-600',
}

export function NotificationsView({
  notifications,
  title = 'Thông báo',
  description = 'Push Notification & cập nhật hệ thống',
}: NotificationsViewProps) {
  const unread = notifications.filter((n) => !n.read).length

  return (
    <div>
      {title ? (
        <PageHeader
          title={title}
          description={description}
          action={
            unread > 0 ? (
              <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50">
                <CheckCheck className="h-4 w-4" />
                Đánh dấu đã đọc ({unread})
              </button>
            ) : undefined
          }
        />
      ) : null}

      <div className="space-y-3">
        {notifications.map((n) => {
          const Icon = iconMap[n.type]
          return (
            <div
              key={n.id}
              className={`flex gap-4 rounded-2xl border p-4 transition hover:shadow-sm ${
                n.read ? 'border-slate-100 bg-white' : 'border-brand-200 bg-brand-50/50'
              }`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colorMap[n.type]}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-slate-900">{n.title}</p>
                  <span className="shrink-0 text-xs text-slate-400">{n.time}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{n.message}</p>
              </div>
              {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
            </div>
          )
        })}
      </div>

      {notifications.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center">
          <Bell className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-slate-500">Chưa có thông báo</p>
        </div>
      )}
    </div>
  )
}
