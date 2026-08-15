import { Check, Eye, X } from 'lucide-react'
import { pendingListings, properties } from '@/data/mockData'
import { formatPrice, propertyTypeLabels, transactionLabels } from '@/utils/format'

export function AdminModeration() {
  const queue = [...pendingListings, ...properties.filter((p) => p.status === 'pending')].filter(
    (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i,
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kiểm duyệt tin đăng</h1>
        <p className="text-slate-500">Hàng đợi duyệt — FR-AD01</p>
      </div>

      <div className="space-y-4">
        {queue.map((p) => (
          <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-4 lg:flex-row">
              <img src={p.images[0]} alt="" className="h-48 w-full rounded-xl object-cover lg:h-40 lg:w-56" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">{p.title}</h3>
                <p className="mt-1 text-brand-700 font-semibold">{formatPrice(p.price, p.transactionType)}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-500">
                  <span>{propertyTypeLabels[p.type]}</span>
                  <span>·</span>
                  <span>{transactionLabels[p.transactionType]}</span>
                  <span>·</span>
                  <span>{p.area} m²</span>
                  <span>·</span>
                  <span>{p.address}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{p.description}</p>
                <p className="mt-2 text-xs text-slate-400">Người đăng: {p.ownerName} · {p.createdAt}</p>
              </div>
              <div className="flex flex-row gap-2 lg:flex-col">
                <button type="button" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
                  <Check className="h-4 w-4" /> Duyệt
                </button>
                <button type="button" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50">
                  <Eye className="h-4 w-4" /> Xem chi tiết
                </button>
                <button type="button" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
                  <X className="h-4 w-4" /> Từ chối
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
