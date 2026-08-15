import { Calendar, Clock, Eye } from 'lucide-react'
import { appointments } from '@/data/mockData'

const statusConfig = {
  pending: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-emerald-100 text-emerald-700' },
  completed: { label: 'Hoàn thành', color: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
  no_show: { label: 'Không đến', color: 'bg-gray-100 text-gray-600' },
}

export function AdminAppointments({ embedded = false }: { embedded?: boolean }) {
  return (
    <div className={embedded ? '' : 'space-y-6'}>
      {!embedded && (
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lịch hẹn toàn hệ thống</h1>
          <p className="text-slate-500">Xem và giám sát vòng đời đặt lịch xem BĐS — FR-A01~A04</p>
        </div>
      )}

      <div className="mb-4 grid gap-4 sm:grid-cols-4">
        {(['pending', 'confirmed', 'completed', 'cancelled'] as const).map((s) => (
          <div key={s} className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-slate-900">{appointments.filter((a) => a.status === s).length}</p>
            <p className="text-xs text-slate-500">{statusConfig[s].label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {appointments.map((apt) => {
          const cfg = statusConfig[apt.status]
          return (
            <div key={apt.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <img src={apt.propertyImage} alt="" className="h-16 w-20 rounded-xl object-cover" />
              <div className="flex-1 min-w-[200px]">
                <p className="font-semibold text-slate-900">{apt.propertyTitle}</p>
                <p className="text-sm text-slate-500">{apt.buyerName} ↔ {apt.agentName}</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(apt.date).toLocaleDateString('vi-VN')}
                  <Clock className="h-3.5 w-3.5 ml-2" />
                  {apt.time}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
              <button type="button" className="rounded-lg p-2 hover:bg-slate-100">
                <Eye className="h-4 w-4 text-slate-500" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
