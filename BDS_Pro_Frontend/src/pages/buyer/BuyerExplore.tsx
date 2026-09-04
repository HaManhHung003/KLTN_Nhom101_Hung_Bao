import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Tabs, TabPanel } from '@/components/common/Tabs'
import { MarketSearch } from '@/pages/shared/MarketSearch'
import { MapView } from '@/pages/shared/MapView'

export function BuyerExplore() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'map' ? 'map' : 'list'
  const [active, setActive] = useState(tab)

  const handleTab = (id: string) => {
    setActive(id)
    setParams(id === 'map' ? { tab: 'map' } : {})
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Khám phá BĐS</h1>
        <p className="mt-1 text-slate-500">
          Tìm kiếm danh sách hoặc bản đồ — theo hành trình nghiệp vụ khách hàng
        </p>
      </div>

      <Tabs
        tabs={[
          { id: 'list', label: 'Danh sách & Bộ lọc' },
          { id: 'map', label: 'Bản đồ tương tác' },
        ]}
        active={active}
        onChange={handleTab}
      />

      <TabPanel active={active} id="list">
        <MarketSearch
          basePath="/client"
          title=""
          description=""
          showFavorite
        />
      </TabPanel>
      <TabPanel active={active} id="map">
        <MapView basePath="/client" title="" description="" showFavorite />
      </TabPanel>
    </div>
  )
}
