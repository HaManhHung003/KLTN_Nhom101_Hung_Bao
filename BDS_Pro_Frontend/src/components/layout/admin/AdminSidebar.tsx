import { PortalSidebar } from '@/components/layout/shared/PortalSidebar'
import { ADMIN_ROUTES } from '@/config/routes'
import { adminNav, AdminSidebarFooter } from './adminNav.tsx'

interface AdminSidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function AdminSidebar({ collapsed = false, onToggle }: AdminSidebarProps) {
  return (
    <PortalSidebar
      collapsed={collapsed}
      onToggle={onToggle}
      footer={<AdminSidebarFooter />}
      config={{
        homePath: ADMIN_ROUTES.dashboard,
        dashboardPath: ADMIN_ROUTES.dashboard,
        badge: 'QT',
        title: 'BDS Pro',
        subtitle: 'Quản trị',
        nav: adminNav,
      }}
    />
  )
}

export { adminNav } from './adminNav.tsx'
