import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CalendarDays, Eye, Plus } from 'lucide-react';
import { StatCard } from '@/components/common/StatCard';
import { propertyService } from '@/services/property.service';
import { appointmentService } from '@/services/appointment.service';
import { useAuth } from '@/context/AuthContext';
import { BROKER_ROUTES } from '@/config/routes';
import type { Property } from '@/types';

export function AgentDashboard() {
  const { user } = useAuth();
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      propertyService.getMyProperties().catch(() => ({ data: [] })),
      appointmentService.getMyAppointments().catch(() => ({ data: [] })),
    ]).then(([propsRes, aptsRes]) => {
      if (propsRes && propsRes.data) setMyProperties(propsRes.data);
      const aptsList = Array.isArray(aptsRes) ? aptsRes : aptsRes?.data || [];
      setAppointmentsCount(aptsList.length);
    }).finally(() => setLoading(false));
  }, []);

  const pendingCount = myProperties.filter((p) => p.status === 'pending').length;
  const activeCount = myProperties.filter((p) => p.status === 'active').length;
  const totalViews = myProperties.reduce((sum, p) => sum + (p.viewCount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tổng quan Môi giới / Host</h1>
          <p className="text-slate-500">Xin chào {user?.name || 'Môi giới'} — Quản lý hiệu suất tin đăng BĐS thực tế</p>
        </div>
        <Link
          to={BROKER_ROUTES.properties}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Vào Quản lý Tin đăng & Tạo tin mới
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tin đang hiển thị (Active)"
          value={loading ? '...' : activeCount.toString()}
          icon={Building2}
        />
        <StatCard
          title="Tin chờ kiểm duyệt"
          value={loading ? '...' : pendingCount.toString()}
          icon={Building2}
        />
        <StatCard
          title="Tổng lượt xem tin"
          value={loading ? '...' : totalViews.toString()}
          icon={Eye}
        />
        <StatCard
          title="Lịch hẹn xem nhà"
          value={loading ? '...' : appointmentsCount.toString()}
          icon={CalendarDays}
        />
      </div>

      {/* Quick navigation */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Lối truy cập nhanh</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            to={BROKER_ROUTES.properties}
            className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 transition hover:border-emerald-500 hover:bg-emerald-50"
          >
            <Building2 className="h-6 w-6 text-emerald-600" />
            <p className="font-bold text-slate-900">Mục Tin đăng (Quản lý & Tạo tin mới)</p>
            <p className="text-xs text-slate-500">Đăng tin mới, ghim vị trí Leaflet map, tải ảnh Cloudinary, xem tin bài của tôi</p>
          </Link>
          <Link
            to={BROKER_ROUTES.bookings}
            className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 transition hover:border-emerald-500 hover:bg-emerald-50"
          >
            <CalendarDays className="h-6 w-6 text-sky-600" />
            <p className="font-bold text-slate-900">Lịch hẹn xem nhà</p>
            <p className="text-xs text-slate-500">Xem yêu cầu xem nhà từ khách hàng mua/thuê và xác nhận lịch</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
