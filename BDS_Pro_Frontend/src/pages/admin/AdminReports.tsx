import { Check, X } from 'lucide-react'
import { reports } from '@/data/mockData'

const statusLabels = {
  pending: { label: 'Chờ xử lý', color: 'bg-amber-100 text-amber-700' },
  resolved: { label: 'Đã xử lý', color: 'bg-emerald-100 text-emerald-700' },
  dismissed: { label: 'Bác bỏ', color: 'bg-slate-100 text-slate-600' },
}

export function AdminReports({ embedded = false }: { embedded?: boolean }) {
  return (
    <div>
      {!embedded && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Báo cáo vi phạm</h1>
          <p className="text-slate-500">Xử lý khiếu nại tin ảo, trùng lặp — FR-AD03</p>
        </div>
      )}

      <div className="space-y-3">
        {reports.map((r) => {
          const cfg = statusLabels[r.status]
          return (
            <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{r.propertyTitle}</h3>
                  <p className="mt-1 text-sm text-slate-500">Người báo cáo: {r.reporterName}</p>
                  <p className="mt-2 text-sm text-slate-700">Lý do: {r.reason}</p>
                  <p className="mt-1 text-xs text-slate-400">{r.createdAt}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
              </div>
              {r.status === 'pending' && (
                <div className="mt-4 flex gap-2">
                  <button type="button" className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white">
                    <Check className="h-3.5 w-3.5" /> Xử lý & ẩn tin
                  </button>
                  <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium">
                    <X className="h-3.5 w-3.5" /> Bác bỏ báo cáo
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
