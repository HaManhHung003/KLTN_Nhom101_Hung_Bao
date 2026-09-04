import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { PropertyCard } from '@/components/common/PropertyCard'
import { RealMap } from '@/components/common/RealMap'
import { PageHeader } from '@/components/common/PageHeader'
import { propertyService } from '@/services/property.service'
import type { Property } from '@/types'

interface MapViewProps {
  basePath: string
  title: string
  description: string
  showFavorite?: boolean
}

export function MapView({ basePath, title, description, showFavorite = false }: MapViewProps) {
  const [radius, setRadius] = useState('3')
  const [selectedId, setSelectedId] = useState<string>()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    propertyService
      .getMapProperties()
      .then((res) => {
        setProperties(Array.isArray(res) ? res : [])
      })
      .catch(() => setProperties([]))
      .finally(() => setLoading(false))
  }, [])

  const active = properties.filter((p) => p.status === 'active' || p.status === 'pending')
  const selected = active.find((p) => p.id === selectedId)

  return (
    <div>
      {title && <PageHeader title={title} description={description} />}

      <div className="flex h-[calc(100vh-12rem)] flex-col gap-4 lg:flex-row">
        <div className="flex w-full flex-col lg:w-96">
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <label className="text-xs font-medium text-slate-500">Bán kính tìm kiếm</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {['1', '3', '5', '10'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadius(r)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    radius === r
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang nạp danh sách BĐS...
              </div>
            ) : active.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                Chưa có BĐS nào hiển thị trên bản đồ.
              </div>
            ) : (
              active.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`cursor-pointer rounded-xl transition ${
                    selectedId === p.id ? 'ring-2 ring-brand-500 ring-offset-2' : ''
                  }`}
                >
                  <PropertyCard
                    property={p}
                    detailPath={`${basePath}/property/${p.id}`}
                    isFavorite={showFavorite ? p.isFavorited : false}
                  />
                </div>
              ))
            )}
          </div>
        </div>
        <div className="flex-1">
          <RealMap
            mode="search"
            properties={active}
            selectedPropertyId={selectedId}
            onSelectProperty={(p) => setSelectedId(p.id)}
            height="100%"
          />
          {selected && (
            <p className="mt-2 text-center text-sm text-slate-500">
              {selected.title} · Bán kính {radius}km · {selected.district}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}