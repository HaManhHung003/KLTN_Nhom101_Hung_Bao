import { useState } from 'react'
import { PropertyCard } from '@/components/common/PropertyCard'
import { MapPlaceholder } from '@/components/common/MapPlaceholder'
import { favoriteIds, properties } from '@/data/mockData'

export function BuyerMap() {
  const [radius, setRadius] = useState('3')
  const [selectedId, setSelectedId] = useState<string>()
  const active = properties.filter((p) => p.status === 'active')
  const selected = active.find((p) => p.id === selectedId)

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 lg:flex-row">
      <div className="flex w-full flex-col lg:w-96">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900">Bản đồ BĐS</h1>
          <p className="text-sm text-slate-500">Tìm theo bán kính từ vị trí</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <label className="text-xs font-medium text-slate-500">Bán kính</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {['1', '3', '5', '10'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRadius(r)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  radius === r ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
          {active.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`cursor-pointer rounded-xl ${selectedId === p.id ? 'ring-2 ring-brand-500' : ''}`}
            >
              <PropertyCard property={p} isFavorite={favoriteIds.includes(p.id)} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1">
        <MapPlaceholder properties={active} selectedId={selectedId} onSelect={setSelectedId} height="100%" />
        {selected && (
          <p className="mt-2 text-center text-sm text-slate-500">
            Đang chọn: {selected.title} · Bán kính {radius}km
          </p>
        )}
      </div>
    </div>
  )
}
