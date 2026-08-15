import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Tabs, TabPanel } from '@/components/common/Tabs'
import { AgentChat } from './AgentChat'
import { conversations } from '@/data/mockData'
import { MessageCircle, TrendingUp, UserPlus } from 'lucide-react'

const leads = [
  { id: 'l1', name: 'Nguyễn Minh Anh', property: 'Vinhomes Central Park', status: 'hot', time: '10 phút' },
  { id: 'l2', name: 'Phạm Thu Hà', property: 'Nhà phố Q7', status: 'warm', time: '2 giờ' },
  { id: 'l3', name: 'Võ Minh Tâm', property: 'Studio Thảo Điền', status: 'new', time: 'Hôm qua' },
]

const TABS = [
  { id: 'hop-thu', label: 'Hộp thư' },
  { id: 'lead', label: 'Lead mới', badge: 3 },
] as const

export function AgentCustomers() {
  const [params, setParams] = useSearchParams()
  const initial = params.get('tab') ?? 'hop-thu'
  const [active, setActive] = useState(
    TABS.some((t) => t.id === initial) ? initial : 'hop-thu',
  )
  const unread = conversations.reduce((s, c) => s + c.unread, 0)

  function handleTabChange(id: string) {
    setActive(id)
    setParams({ tab: id }, { replace: true })
  }

  const tabsWithBadge = TABS.map((t) =>
    t.id === 'hop-thu' ? { ...t, badge: unread } : t,
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Khách hàng & Lead</h1>
        <p className="mt-1 text-slate-500">
          Nhận lead real-time → Chat → Chuyển đổi — trọng tâm nghiệp vụ môi giới
        </p>
      </div>

      <Tabs tabs={tabsWithBadge} active={active} onChange={handleTabChange} />

      <TabPanel active={active} id="hop-thu">
        <AgentChat embedded />
      </TabPanel>

      <TabPanel active={active} id="lead">
        <div className="space-y-3">
          {leads.map((lead) => (
            <div key={lead.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                {lead.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{lead.name}</p>
                <p className="text-sm text-slate-500">{lead.property}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  lead.status === 'hot'
                    ? 'bg-red-100 text-red-700'
                    : lead.status === 'warm'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-sky-100 text-sky-700'
                }`}
              >
                {lead.status === 'hot' ? 'Nóng' : lead.status === 'warm' ? 'Ấm' : 'Mới'}
              </span>
              <span className="text-xs text-slate-400">{lead.time}</span>
              <button type="button" className="rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white">
                Phản hồi
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <UserPlus className="h-5 w-5 text-brand-600" />
            <p className="mt-2 text-2xl font-bold">38</p>
            <p className="text-xs text-slate-500">Lead tháng này</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <MessageCircle className="h-5 w-5 text-violet-600" />
            <p className="mt-2 text-2xl font-bold">82%</p>
            <p className="text-xs text-slate-500">Tỷ lệ phản hồi</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <p className="mt-2 text-2xl font-bold">12.5%</p>
            <p className="text-xs text-slate-500">Tỷ lệ chuyển đổi</p>
          </div>
        </div>
      </TabPanel>
    </div>
  )
}
