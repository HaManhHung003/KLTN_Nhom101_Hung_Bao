import { Building2, DollarSign, FileCheck, Users } from 'lucide-react'
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { StatCard } from '@/components/common/StatCard'
import { adminChartData, adminStats, pendingListings, reports } from '@/data/mockData'
import { Link } from 'react-router-dom'

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Quản trị</h1>
        <p className="text-slate-500">Tổng quan KPI toàn hệ thống BDS Pro</p>
      </div>

      <Link to="/admin/moderation" className="block rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 p-5 transition hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-800">Ưu tiên hôm nay</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{adminStats.pendingModeration} tin chờ kiểm duyệt</p>
            <p className="mt-1 text-sm text-slate-600">Xử lý hàng đợi để đảm bảo chất lượng nội dung</p>
          </div>
          <span className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white">Duyệt ngay →</span>
        </div>
      </Link>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Người dùng" value={adminStats.totalUsers.toLocaleString()} change="+8% tháng này" icon={Users} trend="up" />
        <StatCard title="Tin đăng" value={adminStats.totalListings.toLocaleString()} change={`${adminStats.pendingModeration} chờ duyệt`} icon={Building2} />
        <StatCard title="Giao dịch" value={adminStats.totalTransactions} change="+15 giao dịch/tuần" icon={DollarSign} trend="up" />
        <StatCard title="Chờ kiểm duyệt" value={adminStats.pendingModeration} icon={FileCheck} trend="neutral" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-bold text-slate-900">Xu hướng hệ thống</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={adminChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#059669" strokeWidth={2} name="Tin mới" />
                <Line type="monotone" dataKey="leads" stroke="#7c3aed" strokeWidth={2} name="Lead" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Tin chờ duyệt</h2>
              <Link to="/admin/moderation" className="text-sm text-brand-600 hover:underline">Xử lý</Link>
            </div>
            <div className="mt-3 space-y-2">
              {pendingListings.map((p) => (
                <div key={p.id} className="rounded-lg bg-amber-50 p-3 text-sm">
                  <p className="font-medium text-slate-900 line-clamp-1">{p.title}</p>
                  <p className="text-xs text-slate-500">{p.ownerName}</p>
                </div>
              ))}
              {pendingListings.length === 0 && <p className="text-sm text-slate-500">Không có tin chờ</p>}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Báo cáo vi phạm</h2>
              <Link to="/admin/system" className="text-sm text-brand-600 hover:underline">Xem</Link>
            </div>
            <p className="mt-2 text-2xl font-bold text-red-600">
              {reports.filter((r) => r.status === 'pending').length}
            </p>
            <p className="text-sm text-slate-500">khiếu nại chờ xử lý</p>
          </div>
        </div>
      </div>
    </div>
  )
}
