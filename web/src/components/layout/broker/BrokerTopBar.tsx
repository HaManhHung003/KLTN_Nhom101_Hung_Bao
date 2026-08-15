import { PortalTopBar } from '@/components/layout/shared/PortalTopBar'
import { agentNotifications, currentUsers } from '@/data/mockData'

export function BrokerTopBar() {
  const user = currentUsers.agent

  return (
    <PortalTopBar
      searchPlaceholder="Tìm tin, lead, lịch hẹn..."
      user={{ name: user.name, avatar: user.avatar, roleLabel: 'Môi giới' }}
      notifications={agentNotifications}
    />
  )
}
