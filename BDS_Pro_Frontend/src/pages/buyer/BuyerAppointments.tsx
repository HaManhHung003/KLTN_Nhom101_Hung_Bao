import { useEffect, useState } from 'react';
import { Calendar, Check, Clock, X } from 'lucide-react';
import { appointmentService } from '@/services/appointment.service';
import type { Appointment } from '@/types';

const statusConfig = {
  pending: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-700', icon: Clock },
  confirmed: { label: 'Đã xác nhận', color: 'bg-emerald-100 text-emerald-700', icon: Check },
  completed: { label: 'Hoàn thành', color: 'bg-blue-100 text-blue-700', icon: Check },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: X },
  no_show: { label: 'Không đến', color: 'bg-gray-100 text-gray-600', icon: X },
};

export function BuyerAppointments({ embedded = false }: { embedded?: boolean }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentService
      .getMyAppointments()
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setAppointments(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Lịch hẹn xem nhà của tôi</h1>
            <p className="text-slate-500">Quản lý và theo dõi các lịch xem nhà thực tế</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-sm text-slate-500">Đang nạp danh sách lịch hẹn...</div>
      ) : appointments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
          Bạn chưa có lịch hẹn xem nhà nào. Hãy vào chi tiết BĐS và bấm <strong>&quot;Đặt lịch xem nhà&quot;</strong>!
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => {
            const cfg = statusConfig[apt.status] || statusConfig.pending;
            const Icon = cfg.icon;
            return (
              <div key={apt.id} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <img
                  src={apt.propertyImage || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'}
                  alt=""
                  className="h-24 w-32 shrink-0 rounded-xl object-cover border border-slate-100"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900">{apt.propertyTitle || 'Bất động sản'}</h3>
                      <p className="text-xs text-slate-500">Môi giới: {apt.agentName || 'Trần Văn Bảo'}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.color}`}>
                      <Icon className="h-3 w-3" />
                      {cfg.label}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-emerald-600" />
                      {apt.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-emerald-600" />
                      {apt.time}
                    </span>
                  </div>
                  {apt.note && <p className="mt-2 text-xs text-slate-500">Ghi chú: {apt.note}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
