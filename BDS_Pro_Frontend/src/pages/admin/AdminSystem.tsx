import { useState } from 'react'
import { Tabs, TabPanel } from '@/components/common/Tabs'
import { AdminUsers } from './AdminUsers'
import { AdminReports } from './AdminReports'
import { AdminAnalytics } from './AdminAnalytics'
import { AdminSettings } from './AdminSettings'
import { NotificationsView } from '@/pages/shared/NotificationsView'
import { adminNotifications } from '@/data/mockData'

export function AdminSystem() {
  const [active, setActive] = useState('users')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quản trị hệ thống</h1>
        <p className="mt-1 text-slate-500">Người dùng, báo cáo vi phạm, KPI và cấu hình nền tảng</p>
      </div>

      <Tabs
        tabs={[
          { id: 'users', label: 'Người dùng' },
          { id: 'reports', label: 'Vi phạm', badge: 2 },
          { id: 'analytics', label: 'Báo cáo KPI' },
          { id: 'settings', label: 'Cấu hình' },
          { id: 'notifications', label: 'Thông báo' },
        ]}
        active={active}
        onChange={setActive}
      />

      <TabPanel active={active} id="users">
        <AdminUsers embedded />
      </TabPanel>
      <TabPanel active={active} id="reports">
        <AdminReports embedded />
      </TabPanel>
      <TabPanel active={active} id="analytics">
        <AdminAnalytics embedded />
      </TabPanel>
      <TabPanel active={active} id="settings">
        <AdminSettings embedded />
      </TabPanel>
      <TabPanel active={active} id="notifications">
        <NotificationsView notifications={adminNotifications} title="" description="" />
      </TabPanel>
    </div>
  )
}
