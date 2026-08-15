import { Link } from 'react-router-dom'
import { Plus, Shield } from 'lucide-react'
import { PortalTopBar } from '@/components/layout/shared/PortalTopBar'
import { ADMIN_ROUTES } from '@/config/routes'
import { adminNotifications, currentUsers } from '@/data/mockData'

export function AdminTopBar() {
  const user = currentUsers.admin

  return (
    <PortalTopBar
      searchPlaceholder="Tìm user, tin, giao dịch..."
      user={{ name: user.name, avatar: user.avatar, roleLabel: 'Quản trị viên' }}
      notifications={adminNotifications}
      actions={
        <>
          <Link to={ADMIN_ROUTES.moderation} className="portal-btn-ghost hidden sm:inline-flex">
            <Shield className="h-4 w-4" />
            Duyệt tin
          </Link>
          <button type="button" className="portal-btn-primary !px-2.5 !py-1.5 text-xs sm:!px-3 sm:!py-2 sm:text-sm">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Thao tác nhanh</span>
          </button>
        </>
      }
    />
  )
}
