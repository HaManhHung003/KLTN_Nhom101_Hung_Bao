import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, FileCheck, ShieldAlert, Users } from 'lucide-react';
import { StatCard } from '@/components/common/StatCard';
import { ADMIN_ROUTES } from '@/config/routes';
import { adminService, type DashboardMetrics } from '@/services/admin.service';

export function AdminSystemDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    totalProperties: 0,
    pendingProperties: 0,
    totalReports: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getDashboardMetrics()
      .then((res) => {
        if (res) setMetrics(res);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bảng điều khiển Admin</h1>
          <p className="text-slate-500">Chỉ số thực tế hệ thống BDS Pro từ CSDL MySQL</p>
        </div>
        <Link
          to={ADMIN_ROUTES.moderation}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 shadow-sm"
        >
          <ShieldAlert className="h-4 w-4" />
          Trung tâm kiểm duyệt ({metrics.pendingProperties})
        </Link>
      </div>

      {/* Real Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng BĐS hệ thống"
          value={loading ? '...' : metrics.totalProperties.toLocaleString('vi-VN')}
          icon={Building2}
        />
        <StatCard
          title="Tin chờ duyệt (Pending)"
          value={loading ? '...' : metrics.pendingProperties.toLocaleString('vi-VN')}
          icon={FileCheck}
        />
        <StatCard
          title="Tổng Người dùng"
          value={loading ? '...' : metrics.totalUsers.toLocaleString('vi-VN')}
          icon={Users}
        />
        <StatCard
          title="Báo cáo vi phạm"
          value={loading ? '...' : metrics.totalReports.toLocaleString('vi-VN')}
          icon={ShieldAlert}
        />
      </div>

      {/* Quick Action Navigation */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Quản trị các phân hệ</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            to={ADMIN_ROUTES.moderation}
            className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 transition hover:border-brand-500 hover:bg-brand-50"
          >
            <ShieldAlert className="h-6 w-6 text-amber-600" />
            <p className="font-bold text-slate-900">Kiểm duyệt tin bài</p>
            <p className="text-xs text-slate-500">Duyệt hoặc từ chối các tin bài BĐS chờ đăng từ Host</p>
          </Link>
          <Link
            to={ADMIN_ROUTES.users}
            className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 transition hover:border-brand-500 hover:bg-brand-50"
          >
            <Users className="h-6 w-6 text-sky-600" />
            <p className="font-bold text-slate-900">Quản lý người dùng</p>
            <p className="text-xs text-slate-500">Xem danh sách Buyer, Host, Admin và quản lý trạng thái</p>
          </Link>
          <Link
            to={ADMIN_ROUTES.logs}
            className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 transition hover:border-brand-500 hover:bg-brand-50"
          >
            <FileCheck className="h-6 w-6 text-emerald-600" />
            <p className="font-bold text-slate-900">Nhật ký Audit Logs</p>
            <p className="text-xs text-slate-500">Giám sát các hành động đăng nhập, tạo tin, duyệt tin của hệ thống</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
