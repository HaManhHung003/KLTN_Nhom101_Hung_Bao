import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Tabs, TabPanel } from '@/components/common/Tabs'
import { BuyerAppointments } from './BuyerAppointments'
import { BuyerChat } from './BuyerChat'
import { PaymentsView } from '@/pages/shared/PaymentsView'

const TABS = [
  { id: 'lich-hen', label: 'Lịch hẹn xem' },
  { id: 'tin-nhan', label: 'Tin nhắn', badge: 2 },
  { id: 'dat-coc', label: 'Đặt cọc / Thanh toán' },
] as const

export function BuyerActivity() {
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
        <h1 className="text-2xl font-bold text-slate-900">Hoạt động của tôi</h1>
        <p className="mt-1 text-slate-500">
          Lịch xem nhà → Chat môi giới → Đặt cọc — một nơi theo dõi giao dịch
        </p>
      </div>

      <Tabs tabs={[...TABS]} active={active} onChange={handleTabChange} />

      <TabPanel active={active} id="lich-hen">
        <BuyerAppointments embedded />
      </TabPanel>
      <TabPanel active={active} id="tin-nhan">
        <BuyerChat embedded />
      </TabPanel>
      <TabPanel active={active} id="dat-coc">
        <PaymentsView role="buyer" />
      </TabPanel>
    </div>
  )
}
