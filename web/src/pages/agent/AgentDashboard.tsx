import { Link } from 'react-router-dom'
import {
  AlertCircle,
  CalendarDays,
  Eye,
  FileText,
  MessageCircle,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { StatCard } from '@/components/common/StatCard'
import { agentChartData, agentStats, appointments, properties } from '@/data/mockData'
import { currentUsers } from '@/data/mockData'
import { formatPrice } from '@/utils/format'
import { statusColors, statusLabels } from '@/utils/format'
import { BROKER_ROUTES } from '@/config/routes'
import { conversations } from '@/data/mockData'

export function AgentDashboard() {
  const myListings = properties.filter((p) => p.ownerId === currentUsers.agent.id)
  const pendingApts = appointments.filter((a) => a.agentId === currentUsers.agent.id && a.status === 'pending')
  const pendingListings = myListings.filter((p) => p.status === 'pending')
  const unread = conversations.reduce((s, c) => s + c.unread, 0)

  const todoItems = [
    ...(pendingApts.length > 0
      ? [{
          id: 'apt',
          title: `${pendingApts.length} lịch hẹn chờ xác nhận`,
          desc: `${pendingApts[0]?.buyerName} · ${pendingApts[0]?.propertyTitle}`,
          path: BROKER_ROUTES.bookings,
          icon: CalendarDays,
          urgent: true,
        }]
      : []),
    ...(unread > 0
      ? [{
          id: 'chat',
          title: `${unread} tin nhắn chưa đọc`,
          desc: 'Phản hồi nhanh để tăng tỷ lệ chuyển đổi',
          path: `${BROKER_ROUTES.customers}?tab=hop-thu`,
          icon: MessageCircle,
          urgent: true,
        }]
      : []),
    ...(pendingListings.length > 0
      ? [{
          id: 'mod',
          title: `${pendingListings.length} tin chờ duyệt`,
          desc: pendingListings[0]?.title.slice(0, 40) ?? '',
          path: BROKER_ROUTES.properties,
          icon: AlertCircle,
          urgent: false,
        }]
      : []),
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tổng quan môi giới</h1>
        <p className="text-slate-500">Xin chào {currentUsers.agent.name} — theo dõi hiệu suất tin đăng</p>
      </div>

      {todoItems.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
          <h2 className="font-bold text-slate-900">Việc cần làm hôm nay</h2>
          <div className="mt-3 space-y-2">
            {todoItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className="flex items-center gap-3 rounded-xl border border-white/80 bg-white p-3 transition hover:shadow-sm"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.urgent ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="truncate text-sm text-slate-500">{item.desc}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Lượt xem tuần" value={agentStats.totalViews.toLocaleString('vi-VN')} change="+12% so với tuần trước" icon={Eye} trend="up" />
        <StatCard title="Lead mới" value={agentStats.totalLeads} change="+5 lead hôm nay" icon={Users} trend="up" />
        <StatCard title="Tỷ lệ chuyển đổi" value={`${agentStats.conversionRate}%`} change="+2.1%" icon={TrendingUp} trend="up" />
        <StatCard title="Tin đang hiển thị" value={agentStats.activeListings} icon={FileText} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <h2 className="font-bold text-slate-900">Xu hướng lượt xem & Lead</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={agentChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="views" stroke="#059669" fill="#d1fae5" name="Lượt xem" />
                <Area type="monotone" dataKey="leads" stroke="#7c3aed" fill="#ede9fe" name="Lead" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Lịch chờ xác nhận</h2>
            <Link to={BROKER_ROUTES.bookings} className="text-sm text-brand-600 hover:underline">Xem tất cả</Link>
          </div>
          <div className="mt-4 space-y-3">
            {pendingApts.length === 0 ? (
              <p className="text-sm text-slate-500">Không có lịch chờ</p>
            ) : (
              pendingApts.map((a) => (
                <div key={a.id} className="rounded-xl bg-slate-50 p-3">
                  <p className="font-medium text-slate-900">{a.buyerName}</p>
                  <p className="text-sm text-slate-500">{a.propertyTitle}</p>
                  <p className="mt-1 text-xs text-brand-600">{a.date} · {a.time}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold text-slate-900">Tin đăng của tôi</h2>
          <Link to={BROKER_ROUTES.newProperty} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            + Tạo tin mới
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
                <th className="pb-3 font-medium">Tiêu đề</th>
                <th className="pb-3 font-medium">Giá</th>
                <th className="pb-3 font-medium">Trạng thái</th>
                <th className="pb-3 font-medium">Lượt xem</th>
                <th className="pb-3 font-medium">Lead</th>
              </tr>
            </thead>
            <tbody>
              {myListings.map((p) => (
                <tr key={p.id} className="border-b border-slate-50">
                  <td className="py-3 font-medium text-slate-900">{p.title.slice(0, 40)}...</td>
                  <td className="py-3">{formatPrice(p.price, p.transactionType)}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[p.status]}`}>
                      {statusLabels[p.status]}
                    </span>
                  </td>
                  <td className="py-3">{p.viewCount}</td>
                  <td className="py-3">{Math.floor(p.viewCount / 30)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Link
        to={`${BROKER_ROUTES.customers}?tab=hop-thu`}
        className="flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 transition hover:bg-brand-100"
      >
        <MessageCircle className="h-6 w-6 text-brand-600" />
        <div>
          <p className="font-semibold text-slate-900">{unread || 2} tin nhắn chưa đọc từ khách hàng</p>
          <p className="text-sm text-slate-500">Phản hồi nhanh để tăng tỷ lệ chuyển đổi</p>
        </div>
      </Link>
    </div>
  )
}
