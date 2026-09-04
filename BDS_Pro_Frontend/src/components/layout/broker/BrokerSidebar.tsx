import { useEffect, useState } from 'react'
import { PortalSidebar } from '@/components/layout/shared/PortalSidebar'
import { BROKER_ROUTES } from '@/config/routes'
import { brokerNav } from './brokerNav'
import { chatStorage } from '@/services/chatStorage'

interface BrokerSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function BrokerSidebar({ collapsed, onToggle }: BrokerSidebarProps) {
  const [unreadCount, setUnreadCount] = useState(() => chatStorage.getUnreadCount())

  useEffect(() => {
    function updateUnread() {
      setUnreadCount(chatStorage.getUnreadCount())
    }
    updateUnread()
    window.addEventListener('bdspro_chat_updated', updateUnread)
    window.addEventListener('storage', updateUnread)
    return () => {
      window.removeEventListener('bdspro_chat_updated', updateUnread)
      window.removeEventListener('storage', updateUnread)
    }
  }, [])

  const navWithBadge = brokerNav.map((item) =>
    item.path === BROKER_ROUTES.customers
      ? { ...item, badge: unreadCount > 0 ? unreadCount : undefined }
      : item
  )

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
        nav: navWithBadge,
      }}
    />
  )
}

// Re-export nav for mobile components
export { brokerNav } from './brokerNav'
