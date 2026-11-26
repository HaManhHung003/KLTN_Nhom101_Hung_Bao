import { Link } from 'react-router-dom'
import { Edit, Eye } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { properties } from '@/data/mockData'
import { formatPrice, statusColors, statusLabels, propertyTypeLabels } from '@/utils/format'

export function AdminListings() {
  return (
    <div>
      <PageHeader
        title="Quản lý tin đăng"
        description="Xem, sửa tất cả tin BĐS trên hệ thống — Admin + Môi giới"
        action={
          <Link to="/admin/moderation" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            Hàng đợi duyệt
          </Link>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-slate-500">
              <th className="p-4 font-medium">Tin đăng</th>
              <th className="p-4 font-medium">Chủ tin</th>
              <th className="p-4 font-medium">Giá</th>
              <th className="p-4 font-medium">Trạng thái</th>
              <th className="p-4 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={p.images[0]} alt="" className="h-12 w-16 rounded-lg object-cover" />
                    <div>
                      <p className="font-medium text-slate-900 line-clamp-1">{p.title}</p>
                      <p className="text-xs text-slate-500">{propertyTypeLabels[p.type]} · {p.district}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-slate-600">{p.ownerName}</td>
                <td className="p-4 font-medium text-brand-700">{formatPrice(p.price, p.transactionType)}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[p.status]}`}>
                    {statusLabels[p.status]}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-1">
                    <Link to={`/admin/property/${p.id}`} className="rounded-lg p-2 hover:bg-slate-100" title="Xem">
                      <Eye className="h-4 w-4 text-slate-500" />
                    </Link>
                    <Link to={`/admin/listings/${p.id}/edit`} className="rounded-lg p-2 hover:bg-slate-100" title="Sửa">
                      <Edit className="h-4 w-4 text-slate-500" />
                    </Link>
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
