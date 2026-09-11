import { useState } from 'react'
import { Tabs, TabPanel } from '@/components/common/Tabs'
import { BuyerFavorites } from './BuyerFavorites'
import { BuyerCompare } from './BuyerCompare'

export function BuyerSaved() {
  const [active, setActive] = useState('favorites')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Đã lưu</h1>
        <p className="mt-1 text-slate-500">Yêu thích và so sánh BĐS trước khi quyết định xem nhà</p>
      </div>

      <Tabs
        tabs={[
          { id: 'favorites', label: 'Yêu thích' },
          { id: 'compare', label: 'So sánh BĐS' },
        ]}
        active={active}
        onChange={setActive}
      />

      <TabPanel active={active} id="favorites">
        <BuyerFavorites embedded />
      </TabPanel>
      <TabPanel active={active} id="compare">
        <BuyerCompare embedded />
      </TabPanel>
    </div>
  )
}
