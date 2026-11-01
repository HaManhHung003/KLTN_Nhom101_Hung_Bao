import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  HardDrive,
  ScrollText,
  Server,
  Settings,
  ShieldAlert,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { ADMIN_ROUTES } from '@/config/routes';
import { adminService, type DashboardMetrics } from '@/services/admin.service';
import { propertyService } from '@/services/property.service';
import { formatPrice } from '@/utils/format';
import type { Property } from '@/types';

export function AdminSystemDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    totalProperties: 0,
    pendingProperties: 0,
    totalReports: 0,
  });
  const [pendingList, setPendingList] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([
      adminService.getDashboardMetrics().catch(() => null),
      propertyService.getPendingProperties({ limit: 4 }).catch(() => ({ data: [] })),
    ])
      .then(([metricsRes, pendingRes]) => {
        if (metricsRes) setMetrics(metricsRes);
        const list = Array.isArray(pendingRes) ? pendingRes : pendingRes?.data || [];
        setPendingList(list);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
    window.addEventListener('bdspro_property_updated', fetchDashboardData);
    return () => window.removeEventListener('bdspro_property_updated', fetchDashboardData);
  }, []);

  // Quick Moderate Property directly from Dashboard
  const handleModerateQuick = async (id: string, status: 'active' | 'rejected') => {
    try {
      await propertyService.moderateProperty(
        id,
        status,
        status === 'active' ? 'Phê duyệt hợp lệ' : 'Tin chưa đạt yêu cầu'
      );
      setPendingList((prev) => prev.filter((p) => p.id !== id));
      setMetrics((prev) => ({
        ...prev,
        pendingProperties: Math.max(0, prev.pendingProperties - 1),
      }));
      setActionSuccess(
        status === 'active'
          ? 'Đã duyệt tin đăng thành công! Tin đã xuất hiện công khai trên sàn.'
          : 'Đã từ chối tin đăng.'
      );
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Lỗi kiểm duyệt tin');
    }
  };

  return (
    <div className="space-y-8">
      {/* ── 1. COMMAND CENTER HEADER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute right-0 top-0 -mr-12 -mt-12 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                Trung Tâm Điều Hành Quản Trị Hệ Thống (Admin Console)
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
              Bảng Điều Khiển Quản Trị Sàn BDS Pro
            </h1>
            <p className="mt-1 text-sm text-slate-300 leading-relaxed">
              Giám sát toàn bộ hoạt động, kiểm duyệt tin bài, quản lý tài khoản người dùng và bảo mật hệ thống.
            </p>

            {/* Live System Health Badges */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-2.5 py-1 font-medium text-emerald-300 border border-emerald-500/30">
                <Server className="h-3.5 w-3.5" />
                NestJS Backend: Port 4000
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500/20 px-2.5 py-1 font-medium text-sky-300 border border-sky-500/30">
                <HardDrive className="h-3.5 w-3.5" />
                MySQL Database: Connected
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-500/20 px-2.5 py-1 font-medium text-purple-300 border border-purple-500/30">
                <Activity className="h-3.5 w-3.5" />
                Vận hành: Ổn định
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={ADMIN_ROUTES.moderation}
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-amber-400 focus:ring-2 focus:ring-amber-300"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Kiểm duyệt ({metrics.pendingProperties})</span>
            </Link>
            <Link
              to={ADMIN_ROUTES.users}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              <Users className="h-4 w-4" />
              <span>Quản lý Người dùng</span>
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

      {/* ── 2. PRIMARY SYSTEM KPIS ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Properties */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tổng BĐS hệ thống</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {loading ? '...' : metrics.totalProperties.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs text-slate-400">tin đăng</span>
          </div>
          <p className="mt-2 text-[11px] text-indigo-600 font-semibold">Kho dữ liệu BĐS toàn quốc</p>
        </div>

        {/* Pending Moderation */}
        <div
          className={`rounded-2xl border p-5 shadow-xs transition hover:shadow-md ${
            metrics.pendingProperties > 0
              ? 'border-amber-300 bg-amber-50/30'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tin chờ kiểm duyệt</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-700">
              {loading ? '...' : metrics.pendingProperties.toLocaleString('vi-VN')}
            </span>
            {metrics.pendingProperties > 0 && (
              <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-900">
                Cần xử lý
              </span>
            )}
          </div>
          <p className="mt-2 text-[11px] text-amber-700 font-medium">
            {metrics.pendingProperties > 0
              ? 'Có tin mới từ Môi giới chờ duyệt'
              : 'Không có tin tồn đọng'}
          </p>
        </div>

        {/* Total Users */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Người dùng đã đăng ký</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {loading ? '...' : metrics.totalUsers.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs text-slate-400">tài khoản</span>
          </div>
          <p className="mt-2 text-[11px] text-sky-600 font-semibold">Buyer, Host/Agent &amp; Admin</p>
        </div>

        {/* Reports & Safety */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Báo cáo vi phạm</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {loading ? '...' : metrics.totalReports.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs text-slate-400">phản hồi</span>
          </div>
          <p className="mt-2 text-[11px] text-emerald-600 font-semibold">Kiểm soát an toàn tin đăng</p>
        </div>
      </div>

      {/* ── 3. HÀNG ĐỢI KIỂM DUYỆT KHẨN CẤP (QUICK ACTION MODERATION) ── */}
      <div className="space-y-4 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50/40 via-white to-slate-50 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Hàng đợi kiểm duyệt tin đăng
                </h2>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                  {metrics.pendingProperties} chờ duyệt
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Xem xét và phê duyệt hoặc từ chối trực tiếp các tin đăng mới từ Môi giới
              </p>
            </div>
          </div>

          <Link
            to={ADMIN_ROUTES.moderation}
            className="inline-flex items-center gap-1 text-sm font-semibold text-amber-800 hover:text-amber-900 transition"
          >
            <span>Vào Trung tâm kiểm duyệt</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : pendingList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-amber-300 bg-white p-8 text-center text-sm text-slate-600">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
            Hiện không có tin đăng nào đang chờ duyệt. Mọi tin đăng đều đã được xử lý!
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {pendingList.map((p) => (
              <div
                key={p.id}
                className="flex flex-col justify-between rounded-2xl border border-amber-200 bg-white p-4.5 shadow-xs transition hover:shadow-md"
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={
                      p.images?.[0] ||
                      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
                    }
                    alt=""
                    className="h-20 w-24 shrink-0 rounded-xl object-cover border border-slate-200"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase">
                      Chờ duyệt
                    </span>
                    <h4 className="mt-1 font-bold text-slate-900 text-sm line-clamp-1">
                      {p.title}
                    </h4>
                    <p className="mt-0.5 font-extrabold text-emerald-600 text-sm">
                      {formatPrice(p.price, p.transactionType)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                      📍 {p.address}, {p.district}, {p.city}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-[11px] text-slate-400">
                    Người đăng: <strong className="text-slate-700">{p.ownerName || 'Môi giới'}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleModerateQuick(p.id, 'active')}
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Duyệt tin</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModerateQuick(p.id, 'rejected')}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>Từ chối</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 4. ADMIN MODULES MANAGEMENT HUB (6 PHÂN HỆ CỐT LÕI) ── */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Các Phân Hệ Quản Trị Cốt Lõi</h2>
          <p className="text-xs text-slate-500">
            Truy cập trực tiếp các mô-đun quản lý chuyên sâu của nền tảng BDS Pro
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Module 1: Moderation */}
          <Link
            to={ADMIN_ROUTES.moderation}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:-translate-y-1 hover:border-amber-500 hover:shadow-md"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition group-hover:bg-amber-100">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="mt-3 font-bold text-slate-900 text-base">Trung tâm kiểm duyệt tin</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Kiểm tra thông tin pháp lý, hình ảnh, diện tích và quyết định phê duyệt hoặc từ chối tin đăng.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-amber-700">
              <span>{metrics.pendingProperties} tin đang chờ</span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Module 2: Users */}
          <Link
            to={ADMIN_ROUTES.users}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:-translate-y-1 hover:border-sky-500 hover:shadow-md"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition group-hover:bg-sky-100">
                <UserCheck className="h-6 w-6" />
              </div>
              <h3 className="mt-3 font-bold text-slate-900 text-base">Quản lý người dùng</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Danh sách Người tìm nhà (Buyer), Môi giới (Agent) và Cấp tài khoản Môi giới mới an toàn.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-sky-700">
              <span>{metrics.totalUsers} tài khoản</span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Module 3: Properties Catalog */}
          <Link
            to={ADMIN_ROUTES.properties}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:-translate-y-1 hover:border-indigo-500 hover:shadow-md"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="mt-3 font-bold text-slate-900 text-base">Kho danh mục BĐS</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Tra cứu, lọc trạng thái, gỡ bỏ tin vi phạm hoặc xem trước chi tiết mọi tin bài trên hệ thống.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-indigo-700">
              <span>{metrics.totalProperties} tin đăng</span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Module 4: Transactions & Escrow */}
          <Link
            to={ADMIN_ROUTES.transactions}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:-translate-y-1 hover:border-emerald-500 hover:shadow-md"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="mt-3 font-bold text-slate-900 text-base">Giao dịch &amp; Đặt cọc</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Theo dõi các khoản tiền đặt cọc an toàn, trạng thái hợp đồng mua bán/thuê và giải ngân ký quỹ.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-emerald-700">
              <span>Theo dõi giao dịch</span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Module 5: Audit Logs */}
          <Link
            to={ADMIN_ROUTES.logs}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:-translate-y-1 hover:border-purple-500 hover:shadow-md"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition group-hover:bg-purple-100">
                <ScrollText className="h-6 w-6" />
              </div>
              <h3 className="mt-3 font-bold text-slate-900 text-base">Nhật ký Audit Logs</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Ghi nhận chi tiết mọi hành vi đăng nhập, tạo tài khoản, duyệt tin và giao dịch hệ thống.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-purple-700">
              <span>Truy vết an ninh</span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Module 6: System Settings */}
          <Link
            to={ADMIN_ROUTES.settings}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:-translate-y-1 hover:border-slate-500 hover:shadow-md"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-200">
                <Settings className="h-6 w-6" />
              </div>
              <h3 className="mt-3 font-bold text-slate-900 text-base">Cài đặt hệ thống</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Cấu hình tham số sàn, chính sách duyệt tin bài tự động, kết nối AI Gateway và thông báo.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Cấu hình tham số</span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
