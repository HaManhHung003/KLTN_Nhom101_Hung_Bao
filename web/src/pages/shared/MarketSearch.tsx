import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { PropertyCard } from '@/components/common/PropertyCard'
import { PageHeader } from '@/components/common/PageHeader'
import { favoriteIds, properties } from '@/data/mockData'
import { propertyTypeLabels, transactionLabels } from '@/utils/format'

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
  const [transaction, setTransaction] = useState('all')
  const [type, setType] = useState('all')
  const [sort, setSort] = useState('newest')

  const filtered = properties
    .filter((p) => filterStatus === 'all' || p.status === filterStatus || p.status === 'pending')
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
            <select value={transaction} onChange={(e) => setTransaction(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500">
              <option value="all">Tất cả</option>
              <option value="sale">{transactionLabels.sale}</option>
              <option value="rent">{transactionLabels.rent}</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Loại BĐS</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500">
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
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500">
              <option value="newest">Mới nhất</option>
              <option value="ai">Phù hợp AI</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
            </select>
          </div>
        </div>
      </div>

      <p className="mb-4 text-sm text-slate-500">{filtered.length} kết quả</p>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => (
          <PropertyCard
            key={p.id}
            property={p}
            detailPath={`${basePath}/property/${p.id}`}
            isFavorite={showFavorite && favoriteIds.includes(p.id)}
          />
        ))}
      </div>
    </div>
  )
}
