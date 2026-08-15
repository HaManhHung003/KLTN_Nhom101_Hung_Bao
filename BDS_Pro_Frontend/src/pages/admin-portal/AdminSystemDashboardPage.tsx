import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Building2, DollarSign, FileCheck, ShieldAlert, Users } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard'
import {
  adminAuditLogs,
  adminDailyListingsChart,
  adminStats,
  adminTransactionVolumeChart,
} from '@/data/mockData'
import { ADMIN_ROUTES } from '@/config/routes'
import type { AuditLogEntry } from '@/types/admin'

function formatUsd(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(2)}B`
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  return `$${amount.toLocaleString('vi-VN')}`
}

function formatVolumeTick(value: number): string {
  return `$${(value / 1_000_000).toFixed(0)}M`
}

const ROLE_COLORS: Record<AuditLogEntry['actorRole'], string> = {
  broker: 'bg-sky-100 text-sky-700',
  admin: 'bg-indigo-100 text-indigo-700',
  buyer: 'bg-emerald-100 text-emerald-700',
  system: 'bg-slate-100 text-slate-600',
}

const ROLE_LABELS: Record<AuditLogEntry['actorRole'], string> = {
  broker: 'Môi giới',
  admin: 'Quản trị',
  buyer: 'Người mua',
  system: 'Hệ thống',
}

export function AdminSystemDashboardPage() {
  const transactionChartData = adminTransactionVolumeChart.map((d) => ({
    ...d,
    volumeM: d.volume / 1_000_000,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bảng điều khiển hệ thống</h1>
          <p className="text-slate-500">KPI nền tảng, xu hướng và hoạt động kiểm toán gần đây</p>
        </div>
        <Link
          to={ADMIN_ROUTES.moderation}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
        >
          <ShieldAlert className="h-4 w-4" />
          {adminStats.pendingModeration} tin chờ duyệt
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tin đăng đang hiển thị"
          value={adminStats.activeListings.toLocaleString('vi-VN')}
          change={`${adminStats.totalListings.toLocaleString('vi-VN')} tin trong hệ thống`}
          icon={Building2}
          trend="up"
        />
        <StatCard
          title="Người dùng đã xác minh"
          value={adminStats.verifiedUsers.toLocaleString('vi-VN')}
          change={`trong tổng ${adminStats.totalUsers.toLocaleString('vi-VN')} đã đăng ký`}
          icon={Users}
          trend="up"
        />
        <StatCard
          title="Giao dịch tháng này"
          value={formatUsd(adminStats.monthlyTransactionVolume)}
          change={`${adminStats.totalTransactions} giao dịch tích lũy`}
          icon={DollarSign}
          trend="up"
        />
        <StatCard
          title="Chờ kiểm duyệt"
          value={adminStats.pendingModeration}
          change="Cần admin xem xét"
          icon={FileCheck}
          trend="neutral"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-900">Tin đăng theo ngày — Mới vs Đã duyệt</h2>
          <p className="mt-1 text-xs text-slate-500">7 ngày gần nhất</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={adminDailyListingsChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="newListings"
                  name="Tin mới"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="approvedListings"
                  name="Tin đã duyệt"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-900">Khối lượng giao dịch</h2>
          <p className="mt-1 text-xs text-slate-500">Giá trị đặt cọc theo ngày (quy đổi USD)</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transactionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={formatVolumeTick} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`$${Number(v).toFixed(1)}M`, 'Khối lượng']} />
                <Bar dataKey="volumeM" name="Khối lượng (M)" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Audit log */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-bold text-slate-900">Nhật ký kiểm toán gần đây</h2>
          <Link to={ADMIN_ROUTES.logs} className="text-sm font-medium text-indigo-600 hover:underline">
            Xem tất cả →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Người thực hiện</th>
                <th className="px-5 py-3 font-semibold">Hành động</th>
                <th className="px-5 py-3 font-semibold">Đối tượng</th>
                <th className="px-5 py-3 font-semibold">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adminAuditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[log.actorRole]}`}>
                      {ROLE_LABELS[log.actorRole]}
                    </span>
                    <p className="mt-1 font-medium text-slate-800">{log.actor}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-700">{log.action}</td>
                  <td className="px-5 py-3 text-slate-600">{log.target ?? '—'}</td>
                  <td className="px-5 py-3 whitespace-nowrap text-slate-500">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
