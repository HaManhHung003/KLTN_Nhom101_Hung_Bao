import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarCheck,
  CalendarDays,
  Check,
  Clock,
  Eye,
  HandCoins,
  Phone,
  Plus,
  User,
  Users,
  X,
} from 'lucide-react';
import { propertyService } from '@/services/property.service';
import { appointmentService } from '@/services/appointment.service';
import { useAuth } from '@/context/AuthContext';
import { BROKER_ROUTES } from '@/config/routes';
import { formatPrice, statusColors, statusLabels } from '@/utils/format';
import type { Appointment, Property } from '@/types';

export function AgentDashboard() {
  const { user } = useAuth();
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([
      propertyService.getMyProperties().catch(() => ({ data: [] })),
      appointmentService.getMyAppointments().catch(() => ({ data: [] })),
    ])
      .then(([propsRes, aptsRes]) => {
        if (propsRes && propsRes.data) {
          setMyProperties(propsRes.data);
        }
        const aptsList = Array.isArray(aptsRes) ? aptsRes : aptsRes?.data || [];
        setAppointments(aptsList);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
    window.addEventListener('bdspro_property_updated', fetchDashboardData);
    return () => window.removeEventListener('bdspro_property_updated', fetchDashboardData);
  }, []);

  // Quick Action to Confirm / Cancel Appointment
  const handleUpdateAppointment = async (id: string, status: 'confirmed' | 'cancelled') => {
    try {
      await appointmentService.updateStatus(id, status);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
      setActionSuccess(
        status === 'confirmed'
          ? 'Đã xác nhận lịch hẹn xem nhà thành công! Hệ thống đã gửi thông báo đến khách hàng.'
          : 'Đã từ chối lịch hẹn.'
      );
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật lịch hẹn.');
    }
  };

  // KPI Calculations
  const pendingProps = myProperties.filter((p) => p.status === 'pending').length;
  const activeProps = myProperties.filter((p) => p.status === 'active').length;
  const totalViews = myProperties.reduce((sum, p) => sum + (p.viewCount || 0), 0);
  const pendingApts = appointments.filter((a) => a.status === 'pending');
  const confirmedApts = appointments.filter((a) => a.status === 'confirmed');

  // Greeting helper
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  return (
    <div className="space-y-8">
      {/* ── 1. WELCOME BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                Kênh Môi Giới &amp; Chủ Sở Hữu (Broker CRM)
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
              {greeting}, {user?.name || 'Môi giới'}! 👋
            </h1>
            <p className="mt-1 text-sm text-slate-300 leading-relaxed">
              Quản lý danh mục tin đăng BĐS, tiếp nhận lịch hẹn xem nhà và kết nối khách hàng tiềm năng.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={BROKER_ROUTES.properties}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-300"
            >
              <Plus className="h-4 w-4" />
              <span>Đăng tin BĐS mới</span>
            </Link>
            <Link
              to={BROKER_ROUTES.bookings}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              <CalendarDays className="h-4 w-4" />
              <span>Xem lịch hẹn ({appointments.length})</span>
            </Link>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-medium text-emerald-800 animate-fade-in shadow-xs">
          <Check className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* ── 2. METRIC SCORECARDS ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tin đang hiển thị</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {loading ? '...' : activeProps}
            </span>
            <span className="text-xs text-slate-400">/ {myProperties.length} tổng tin</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Đã được kiểm duyệt &amp; lên sàn
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tin chờ duyệt</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">
              {loading ? '...' : pendingProps}
            </span>
            <span className="text-xs text-slate-400">chờ Admin duyệt</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Dự kiến duyệt trong vòng 2-4 giờ</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Lượt xem tin đăng</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Eye className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {loading ? '...' : totalViews.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs text-slate-400">lượt xem</span>
          </div>
          <p className="mt-2 text-[11px] text-sky-600 font-semibold">Tương tác từ khách hàng thật</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Lịch xem nhà</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {loading ? '...' : appointments.length}
            </span>
            {pendingApts.length > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                {pendingApts.length} mới
              </span>
            )}
          </div>
          <p className="mt-2 text-[11px] text-purple-600 font-semibold">
            {confirmedApts.length} lịch đã xác nhận
          </p>
        </div>
      </div>

      {/* ── 3. MAIN WORKSPACE: LỊCH HẸN CẦN XỬ LÝ & BĐS GẦN ĐÂY ── */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column (7 cols): Lịch hẹn xem nhà cần xác nhận */}
        <div className="space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Yêu cầu xem nhà từ Khách hàng</h2>
              <p className="text-xs text-slate-500">
                Xác nhận hoặc phản hồi nhanh để tăng tỷ lệ chốt giao dịch
              </p>
            </div>
            <Link
              to={BROKER_ROUTES.bookings}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Xem tất cả ({appointments.length})
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              <CalendarDays className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              Chưa có lịch hẹn xem nhà nào từ khách hàng.
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 4).map((apt) => {
                const isPending = apt.status === 'pending';

                return (
                  <div
                    key={apt.id}
                    className={`rounded-2xl border p-4.5 transition ${
                      isPending
                        ? 'border-amber-300 bg-amber-50/40 shadow-xs'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={
                            apt.propertyImage ||
                            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
                          }
                          alt=""
                          className="h-16 w-20 shrink-0 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              apt.status === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : apt.status === 'cancelled'
                                ? 'bg-slate-100 text-slate-500'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {apt.status === 'confirmed'
                              ? 'Đã xác nhận'
                              : apt.status === 'cancelled'
                              ? 'Đã hủy'
                              : 'Chờ xác nhận'}
                          </span>
                          <h4 className="mt-1 font-bold text-slate-900 text-sm line-clamp-1">
                            {apt.propertyTitle || 'Bất động sản'}
                          </h4>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1 font-medium text-slate-700">
                              <User className="h-3.5 w-3.5 text-slate-400" />
                              {apt.buyerName || 'Khách hàng'}
                            </span>
                            {apt.buyerPhone && (
                              <a
                                href={`tel:${apt.buyerPhone}`}
                                className="flex items-center gap-1 text-emerald-600 font-semibold hover:underline"
                              >
                                <Phone className="h-3.5 w-3.5" />
                                {apt.buyerPhone}
                              </a>
                            )}
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                              {apt.date} · {apt.time}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      {isPending && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateAppointment(apt.id, 'confirmed')}
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Xác nhận</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateAppointment(apt.id, 'cancelled')}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Từ chối</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Tin đăng của tôi & Lối tắt */}
        <div className="space-y-4 lg:col-span-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">BĐS của tôi</h2>
              <p className="text-xs text-slate-500">Tin đăng mới nhất trong danh mục</p>
            </div>
            <Link
              to={BROKER_ROUTES.properties}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Quản lý ({myProperties.length})
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-200" />
              ))}
            </div>
          ) : myProperties.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              <Building2 className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              Bạn chưa đăng tin BĐS nào.
              <div className="mt-3">
                <Link
                  to={BROKER_ROUTES.properties}
                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Đăng tin ngay
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {myProperties.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs transition hover:border-emerald-400"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        p.images?.[0] ||
                        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
                      }
                      alt=""
                      className="h-14 w-16 shrink-0 rounded-xl object-cover border border-slate-100"
                    />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-900 text-xs truncate">{p.title}</h4>
                      <p className="text-xs font-bold text-emerald-600 mt-0.5">
                        {formatPrice(p.price, p.transactionType)}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            statusColors[p.status || 'draft']
                          }`}
                        >
                          {statusLabels[p.status || 'draft']}
                        </span>
                        <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                          <Eye className="h-3 w-3" />
                          {p.viewCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/client/property/${p.id}`}
                    target="_blank"
                    className="shrink-0 rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    title="Xem chi tiết"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Quick Hub Navigation Cards */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Bộ công cụ Môi giới
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to={BROKER_ROUTES.customers}
                className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
              >
                <Users className="h-4 w-4 text-emerald-600" />
                <span>Khách hàng CRM</span>
              </Link>
              <Link
                to={BROKER_ROUTES.deals}
                className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
              >
                <HandCoins className="h-4 w-4 text-sky-600" />
                <span>Giao dịch / Cọc</span>
              </Link>
              <Link
                to={BROKER_ROUTES.analytics}
                className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
              >
                <BarChart3 className="h-4 w-4 text-purple-600" />
                <span>Phân tích chỉ số</span>
              </Link>
              <Link
                to={BROKER_ROUTES.profile}
                className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
              >
                <User className="h-4 w-4 text-amber-600" />
                <span>Hồ sơ môi giới</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
