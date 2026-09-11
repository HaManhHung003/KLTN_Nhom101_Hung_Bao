import { useEffect, useState } from 'react'
import { Loader2, SlidersHorizontal } from 'lucide-react'
import { PropertyCard } from '@/components/common/PropertyCard'
import { PageHeader } from '@/components/common/PageHeader'
import { propertyService } from '@/services/property.service'
import { propertyTypeLabels, transactionLabels } from '@/utils/format'
import type { Property, PropertyType, TransactionType } from '@/types'

interface MarketSearchProps {
  basePath: string
  title: string
  description: string
  showFavorite?: boolean
  filterStatus?: 'active' | 'all'
}

export function MarketSearch({
  basePath,
  title,
  description,
  showFavorite = false,
  filterStatus = 'active',
}: MarketSearchProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  const [transaction, setTransaction] = useState<'all' | TransactionType>('all')
  const [type, setType] = useState<'all' | PropertyType>('all')
  const [sort, setSort] = useState<'newest' | 'ai' | 'price-asc' | 'price-desc'>('newest')

  useEffect(() => {
    setLoading(true)
    propertyService
      .getProperties({ limit: 100 })
      .then((res) => {
        const list = res?.data ?? []
        setProperties(list)
      })
      .catch(() => setProperties([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = properties
    .filter((p) =>
      filterStatus === 'all' ? true : p.status === 'active' || p.status === 'pending',
    )
    .filter((p) => transaction === 'all' || p.transactionType === transaction)
    .filter((p) => type === 'all' || p.type === type)
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price
      if (sort === 'price-desc') return b.price - a.price
      if (sort === 'ai') return (b.aiScore ?? 0) - (a.aiScore ?? 0)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  return (
    <div>
      {title && <PageHeader title={title} description={description} />}

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <SlidersHorizontal className="h-4 w-4" />
          Bộ lọc đa tiêu chí — giá, loại, pháp lý, hình thức
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <div>
            <label className="text-xs font-medium text-slate-500">Hình thức</label>
            <select
              value={transaction}
              onChange={(e) => setTransaction(e.target.value as typeof transaction)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
            >
              <option value="all">Tất cả</option>
              <option value="sale">{transactionLabels.sale}</option>
              <option value="rent">{transactionLabels.rent}</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Loại BĐS</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
            >
              <option value="all">Tất cả</option>
              {Object.entries(propertyTypeLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Pháp lý</label>
            <select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500">
              <option>Tất cả</option>
              <option>Sổ hồng</option>
              <option>Sổ đỏ</option>
              <option>Hợp đồng</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Sắp xếp</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
            >
              <option value="newest">Mới nhất</option>
              <option value="ai">Phù hợp AI</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="mb-4 flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang nạp danh sách BĐS từ hệ thống...
        </div>
      ) : (
        <p className="mb-4 text-sm text-slate-500">{filtered.length} kết quả</p>
      )}
      {loading ? null : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
          Không có BĐS phù hợp bộ lọc. Hãy thử điều chỉnh hình thức hoặc loại BĐS.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              detailPath={`${basePath}/property/${p.id}`}
              isFavorite={showFavorite ? p.isFavorited : false}
              onToggleFavorite={showFavorite ? () => undefined : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}