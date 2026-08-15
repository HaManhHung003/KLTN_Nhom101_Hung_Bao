import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { agentChartData, properties } from '@/data/mockData'
import { currentUsers } from '@/data/mockData'
import { formatPrice } from '@/utils/format'

export function AgentAnalytics() {
  const myListings = properties
    .filter((p) => p.ownerId === currentUsers.agent.id && p.status === 'active')
    .sort((a, b) => b.viewCount - a.viewCount)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Thống kê hiệu suất</h1>
        <p className="text-slate-500">Phân tích lượt xem, click, lead và conversion theo tin</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-bold text-slate-900">Lượt xem theo ngày</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agentChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#059669" name="Lượt xem" radius={[6, 6, 0, 0]} />
              <Bar dataKey="leads" fill="#7c3aed" name="Lead" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-bold text-slate-900">Top tin hiệu quả</h2>
        <div className="mt-4 space-y-3">
          {myListings.map((p, i) => (
            <div key={p.id} className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <img src={p.images[0]} alt="" className="h-12 w-16 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-medium text-slate-900 line-clamp-1">{p.title}</p>
                <p className="text-sm text-brand-600">{formatPrice(p.price, p.transactionType)}</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-bold text-slate-900">{p.viewCount} views</p>
                <p className="text-slate-500">{Math.floor(p.viewCount / 30)} leads</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
