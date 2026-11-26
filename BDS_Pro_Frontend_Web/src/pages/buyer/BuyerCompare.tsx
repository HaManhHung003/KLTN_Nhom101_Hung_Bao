import { properties, favoriteIds } from '@/data/mockData'
import { formatPrice, propertyTypeLabels, transactionLabels } from '@/utils/format'

export function BuyerCompare({ embedded = false }: { embedded?: boolean }) {
  const compareList = properties.filter((p) => favoriteIds.includes(p.id)).slice(0, 3)

  const rows = [
    { label: 'Giá', key: 'price' as const },
    { label: 'Diện tích', key: 'area' as const },
    { label: 'Loại', key: 'type' as const },
    { label: 'Hình thức', key: 'transaction' as const },
    { label: 'Phòng ngủ', key: 'bedrooms' as const },
    { label: 'Quận/Huyện', key: 'district' as const },
    { label: 'AI Score', key: 'aiScore' as const },
  ]

  return (
    <div className={embedded ? '' : 'space-y-6'}>
      {!embedded && (
        <div>
          <h1 className="text-2xl font-bold text-slate-900">So sánh BĐS</h1>
          <p className="text-slate-500">So sánh tối đa 3 BĐS (demo: {compareList.length} tin)</p>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="p-4 text-left font-medium text-slate-500">Tiêu chí</th>
              {compareList.map((p) => (
                <th key={p.id} className="p-4 text-left">
                  <img src={p.images[0]} alt="" className="mb-2 h-24 w-full rounded-lg object-cover" />
                  <p className="font-semibold text-slate-900 line-clamp-2">{p.title}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-slate-50">
                <td className="p-4 font-medium text-slate-600">{row.label}</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-4 text-slate-900">
                    {row.key === 'price' && formatPrice(p.price, p.transactionType)}
                    {row.key === 'area' && `${p.area} m²`}
                    {row.key === 'type' && propertyTypeLabels[p.type]}
                    {row.key === 'transaction' && transactionLabels[p.transactionType]}
                    {row.key === 'bedrooms' && (p.bedrooms ? `${p.bedrooms} PN` : '—')}
                    {row.key === 'district' && p.district}
                    {row.key === 'aiScore' && (p.aiScore ? `${p.aiScore}%` : '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
