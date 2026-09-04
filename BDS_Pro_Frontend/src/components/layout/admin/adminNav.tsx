import { Activity, CreditCard, LayoutDashboard, ScrollText, Settings, ShieldAlert, Users, Wrench } from 'lucide-react'
import { ADMIN_ROUTES } from '@/config/routes'
import type { NavItem } from '@/config/routes'
import { adminStats } from '@/data/mockData'

export const adminNav: NavItem[] = [
  { label: 'Tổng quan', path: ADMIN_ROUTES.dashboard, icon: LayoutDashboard },
  { label: 'Hàng đợi kiểm duyệt', path: ADMIN_ROUTES.moderation, icon: ShieldAlert, badge: adminStats.pendingModeration },
  { label: 'Quản lý người dùng', path: ADMIN_ROUTES.users, icon: Users },
  { label: 'Giao dịch / Đặt cọc', path: ADMIN_ROUTES.transactions, icon: CreditCard },
  { label: 'Vận hành hệ thống', path: ADMIN_ROUTES.operations, icon: Wrench },
  { label: 'Nhật ký hệ thống', path: ADMIN_ROUTES.logs, icon: ScrollText },
  { label: 'Cài đặt', path: ADMIN_ROUTES.settings, icon: Settings },
]

export function AdminSidebarFooter() {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs">
      <Activity className="h-4 w-4 shrink-0 text-brand-600" />
      <span className="text-slate-500">Hệ thống:</span>
      <span className="font-medium text-brand-700">Ổn định</span>
    </div>
  )
}
