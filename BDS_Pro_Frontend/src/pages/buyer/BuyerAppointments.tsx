import { Calendar, Check, Clock, X } from 'lucide-react'
import { appointments } from '@/data/mockData'
import { currentUsers } from '@/data/mockData'

const statusConfig = {
  pending: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-700', icon: Clock },
  confirmed: { label: 'Đã xác nhận', color: 'bg-emerald-100 text-emerald-700', icon: Check },
  completed: { label: 'Hoàn thành', color: 'bg-blue-100 text-blue-700', icon: Check },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: X },
  no_show: { label: 'Không đến', color: 'bg-gray-100 text-gray-600', icon: X },
}

export function BuyerAppointments({ embedded = false }: { embedded?: boolean }) {
  const mine = appointments.filter((a) => a.buyerId === currentUsers.buyer.id)

  return (
    <div className="space-y-4">
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Lịch hẹn xem BĐS</h1>
            <p className="text-slate-500">Quản lý vòng đời đặt lịch xem nhà</p>
          </div>
          <button type="button" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            + Đặt lịch mới
          </button>
        </div>
      )}
      {embedded && (
        <div className="flex justify-end">
          <button type="button" className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">
            + Đặt lịch mới
          </button>
        </div>
      )}

      <div className="space-y-4">
        {mine.map((apt) => {
          const cfg = statusConfig[apt.status]
          const Icon = cfg.icon
          return (
            <div key={apt.id} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
              <img src={apt.propertyImage} alt="" className="h-24 w-32 shrink-0 rounded-xl object-cover" />
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-900">{apt.propertyTitle}</h3>
                    <p className="text-sm text-slate-500">Môi giới: {apt.agentName}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.color}`}>
                    <Icon className="h-3 w-3" />
                    {cfg.label}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-brand-600" />
                    {new Date(apt.date).toLocaleDateString('vi-VN')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-brand-600" />
                    {apt.time}
                  </span>
                </div>
                {apt.note && <p className="mt-2 text-sm text-slate-500">Ghi chú: {apt.note}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
