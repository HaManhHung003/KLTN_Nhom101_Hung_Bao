import { Link } from 'react-router-dom'
import { Edit, Eye, MoreHorizontal, Plus } from 'lucide-react'
import { properties, currentUsers } from '@/data/mockData'
import { formatPrice, statusColors, statusLabels } from '@/utils/format'
import { BROKER_ROUTES } from '@/config/routes'

export function AgentListings({ embedded = false }: { embedded?: boolean }) {
  const myListings = properties.filter((p) => p.ownerId === currentUsers.agent.id)

  return (
    <div className={embedded ? 'space-y-4' : 'space-y-6'}>
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý tin đăng</h1>
            <p className="text-slate-500">{myListings.length} tin · CRUD với workflow duyệt Admin</p>
          </div>
          <Link
            to={BROKER_ROUTES.newProperty}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Tạo tin mới
          </Link>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-slate-500">
              <th className="p-4 font-medium">Tin đăng</th>
              <th className="p-4 font-medium">Giá</th>
              <th className="p-4 font-medium">Trạng thái</th>
              <th className="p-4 font-medium">Metrics</th>
              <th className="p-4 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {myListings.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={p.images[0]} alt="" className="h-12 w-16 rounded-lg object-cover" />
                    <div>
                      <p className="font-medium text-slate-900 line-clamp-1">{p.title}</p>
                      <p className="text-xs text-slate-500">{p.district}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 font-medium text-brand-700">{formatPrice(p.price, p.transactionType)}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[p.status]}`}>
                    {statusLabels[p.status]}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1 text-slate-500">
                    <Eye className="h-3.5 w-3.5" />
                    {p.viewCount} · ♥ {p.favoriteCount}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex gap-1">
                    <Link to={`/broker/property/${p.id}`} className="rounded-lg p-2 hover:bg-slate-100" title="Xem">
                      <Eye className="h-4 w-4 text-slate-500" />
                    </Link>
                    <Link to={`/broker/properties/${p.id}/edit`} className="rounded-lg p-2 hover:bg-slate-100" title="Sửa">
                      <Edit className="h-4 w-4 text-slate-500" />
                    </Link>
                    <button type="button" className="rounded-lg p-2 hover:bg-slate-100">
                      <MoreHorizontal className="h-4 w-4 text-slate-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
