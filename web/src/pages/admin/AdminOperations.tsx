import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Tabs, TabPanel } from '@/components/common/Tabs'
import { AdminAppointments } from './AdminAppointments'
import { AdminChatMonitor } from './AdminChatMonitor'
import { AdminReports } from './AdminReports'
import { PaymentsView } from '@/pages/shared/PaymentsView'

const TABS = [
  { id: 'lich-hen', label: 'Lịch hẹn' },
  { id: 'giao-dich', label: 'Giao dịch cọc' },
  { id: 'chat', label: 'Giám sát Chat' },
  { id: 'bao-cao', label: 'Báo cáo vi phạm', badge: 2 },
] as const

export function AdminOperations() {
  const [params, setParams] = useSearchParams()
  const initial = params.get('tab') ?? 'lich-hen'
  const [active, setActive] = useState(
    TABS.some((t) => t.id === initial) ? initial : 'lich-hen',
  )

  function handleTabChange(id: string) {
    setActive(id)
    setParams({ tab: id }, { replace: true })
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Vận hành hệ thống</h1>
        <p className="mt-1 text-slate-500">
          Giám sát lịch hẹn, giao dịch cọc, chat và báo cáo vi phạm — một console thống nhất
        </p>
      </div>

      <Tabs tabs={[...TABS]} active={active} onChange={handleTabChange} />

      <TabPanel active={active} id="lich-hen">
        <AdminAppointments embedded />
      </TabPanel>
      <TabPanel active={active} id="giao-dich">
        <PaymentsView role="admin" />
      </TabPanel>
      <TabPanel active={active} id="chat">
        <AdminChatMonitor embedded />
      </TabPanel>
      <TabPanel active={active} id="bao-cao">
        <AdminReports embedded />
      </TabPanel>
    </div>
  )
}
