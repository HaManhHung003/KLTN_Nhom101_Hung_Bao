import { Check, Clock, X } from 'lucide-react'
import { appointments } from '@/data/mockData'
import { currentUsers } from '@/data/mockData'

const statusConfig = {
  pending: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-emerald-100 text-emerald-700' },
  completed: { label: 'Hoàn thành', color: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
  no_show: { label: 'Không đến', color: 'bg-gray-100 text-gray-600' },
}

export function AgentAppointments() {
  const mine = appointments.filter((a) => a.agentId === currentUsers.agent.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quản lý lịch hẹn</h1>
        <p className="text-slate-500">Xác nhận, đề xuất giờ khác hoặc hủy lịch xem BĐS</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {mine.map((apt) => {
            const cfg = statusConfig[apt.status]
            return (
              <div key={apt.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex gap-4">
                  <img src={apt.propertyImage} alt="" className="h-20 w-28 rounded-xl object-cover" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{apt.propertyTitle}</h3>
                        <p className="text-sm text-slate-500">Khách: {apt.buyerName}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {new Date(apt.date).toLocaleDateString('vi-VN')} · {apt.time}
                    </p>
                    {apt.note && <p className="mt-1 text-sm text-slate-500">"{apt.note}"</p>}
                    {apt.status === 'pending' && (
                      <div className="mt-3 flex gap-2">
                        <button type="button" className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white">
                          <Check className="h-3.5 w-3.5" /> Xác nhận
                        </button>
                        <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium">
                          <Clock className="h-3.5 w-3.5" /> Đề xuất giờ khác
                        </button>
                        <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600">
                          <X className="h-3.5 w-3.5" /> Từ chối
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-bold text-slate-900">Lịch tuần này</h2>
          <div className="mt-4 space-y-2">
            {['T2 18/08', 'T3 19/08', 'T4 20/08', 'T5 21/08', 'T6 22/08'].map((d, i) => (
              <div key={d} className={`rounded-lg p-3 text-sm ${i === 0 ? 'bg-brand-50 border border-brand-200' : 'bg-slate-50'}`}>
                <p className="font-medium text-slate-900">{d}</p>
                <p className="text-slate-500">{i === 0 ? '1 lịch · 9:00' : i === 1 ? '1 lịch · 14:30' : 'Trống'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
