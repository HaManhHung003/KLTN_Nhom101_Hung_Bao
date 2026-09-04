import { useEffect, useState } from 'react'
import { Loader2, SlidersHorizontal } from 'lucide-react'
import { PropertyCard } from '@/components/common/PropertyCard'
import { propertyService } from '@/services/property.service'
import type { Property, PropertyType, TransactionType } from '@/types'
import { propertyTypeLabels, transactionLabels } from '@/utils/format'

type SortKey = 'ai' | 'newest' | 'price-asc' | 'price-desc'

export function BuyerSearch() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [transaction, setTransaction] = useState<'all' | TransactionType>('all')
  const [type, setType] = useState<'all' | PropertyType>('all')
  const [sort, setSort] = useState<SortKey>('ai')

  useEffect(() => {
    setLoading(true)
    propertyService
      .getProperties({ limit: 100 })
      .then((res) => {
        setProperties(res?.data ?? [])
      })
      .catch(() => setProperties([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = properties
    .filter((p) => p.status === 'active' || p.status === 'pending')
    .filter((p) => transaction === 'all' || p.transactionType === transaction)
    .filter((p) => type === 'all' || p.type === type)
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price
      if (sort === 'price-desc') return b.price - a.price
      if (sort === 'newest')
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      return (b.aiScore ?? 0) - (a.aiScore ?? 0)
    })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tìm kiếm BĐS</h1>
        <p className="text-slate-500">
          {loading ? 'Đang nạp dữ liệu...' : `${filtered.length} kết quả`}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <SlidersHorizontal className="h-4 w-4" />
          Bộ lọc
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
            <label className="text-xs font-medium text-slate-500">Khoảng giá</label>
            <select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500">
              <option>Tất cả mức giá</option>
              <option>Dưới 10 triệu/tháng</option>
              <option>10–30 triệu/tháng</option>
              <option>Trên 5 tỷ</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Sắp xếp</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
            >
              <option value="ai">Phù hợp AI</option>
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang nạp danh sách BĐS từ hệ thống...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
          Không có BĐS phù hợp bộ lọc. Hãy thử thay đổi hình thức hoặc loại BĐS.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              detailPath={`/client/property/${p.id}`}
              isFavorite={p.isFavorited}
            />
          ))}
        </div>
      )}
    </div>
  )
}