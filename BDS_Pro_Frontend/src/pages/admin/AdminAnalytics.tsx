import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts'
import { adminChartData, properties } from '@/data/mockData'
import { propertyTypeLabels } from '@/utils/format'

const typeData = Object.entries(
  properties.reduce<Record<string, number>>((acc, p) => {
    acc[p.type] = (acc[p.type] ?? 0) + 1
    return acc
  }, {}),
).map(([type, count]) => ({ name: propertyTypeLabels[type as keyof typeof propertyTypeLabels], value: count }))

const COLORS = ['#059669', '#0891b2', '#7c3aed', '#ea580c', '#db2777']

export function AdminAnalytics({ embedded = false }: { embedded?: boolean }) {
  return (
    <div>
      {!embedded && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Báo cáo hệ thống</h1>
          <p className="text-slate-500">Thống kê toàn nền tảng — FR-D02, FR-D03</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-bold text-slate-900">Tin đăng theo tháng</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adminChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#059669" name="Tin mới" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-bold text-slate-900">Phân bố loại BĐS</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {typeData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Khu vực hot</h2>
          <button type="button" className="text-sm font-medium text-brand-600 hover:underline">Xuất PDF/Excel</button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {['Bình Thạnh', 'Quận 7', 'Quận 2', 'Gia Lâm'].map((area, i) => (
            <div key={area} className="rounded-xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">{area}</p>
              <p className="text-2xl font-bold text-brand-600">{120 - i * 15}</p>
              <p className="text-xs text-slate-500">tin đăng active</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
