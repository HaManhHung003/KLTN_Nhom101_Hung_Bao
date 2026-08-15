import { PortalSidebar } from '@/components/layout/shared/PortalSidebar'
import { BROKER_ROUTES } from '@/config/routes'
import { brokerNav } from './brokerNav'

interface BrokerSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function BrokerSidebar({ collapsed, onToggle }: BrokerSidebarProps) {
  return (
    <PortalSidebar
      collapsed={collapsed}
      onToggle={onToggle}
      config={{
        homePath: BROKER_ROUTES.dashboard,
        dashboardPath: BROKER_ROUTES.dashboard,
        badge: 'MG',
        title: 'BDS Pro',
        subtitle: 'Môi giới',
        nav: brokerNav,
      }}
    />
  )
}

// Re-export nav for mobile components
export { brokerNav } from './brokerNav'
