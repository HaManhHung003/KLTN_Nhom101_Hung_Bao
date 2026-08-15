import { useState } from 'react'
import { Tabs, TabPanel } from '@/components/common/Tabs'
import { AgentListings } from './AgentListings'
import { MarketSearch } from '@/pages/shared/MarketSearch'
import { MapView } from '@/pages/shared/MapView'
import { statusLabels, statusColors } from '@/utils/format'
import { properties, currentUsers } from '@/data/mockData'

export function AgentListingsHub() {
  const [active, setActive] = useState('mine')
  const mine = properties.filter((p) => p.ownerId === currentUsers.agent.id)
  const pipeline = ['draft', 'pending', 'active', 'sold'] as const

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quản lý tin đăng</h1>
        <p className="mt-1 text-slate-500">
          Nháp → Chờ duyệt → Hiển thị → Đã giao dịch — workflow đăng tin BĐS
        </p>
      </div>

      {/* Pipeline kanban summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {pipeline.map((status) => {
          const count = mine.filter((p) => p.status === status).length
          return (
            <div key={status} className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[status]}`}>
                {statusLabels[status]}
              </span>
              <p className="mt-2 text-2xl font-bold text-slate-900">{count}</p>
            </div>
          )
        })}
      </div>

      <Tabs
        tabs={[
          { id: 'mine', label: 'Tin của tôi' },
          { id: 'market', label: 'Thị trường' },
          { id: 'map', label: 'Bản đồ' },
        ]}
        active={active}
        onChange={setActive}
      />

      <TabPanel active={active} id="mine">
        <AgentListings embedded />
      </TabPanel>
      <TabPanel active={active} id="market">
        <MarketSearch basePath="/agent" title="" description="" filterStatus="all" />
      </TabPanel>
      <TabPanel active={active} id="map">
        <MapView basePath="/agent" title="" description="" />
      </TabPanel>
    </div>
  )
}
