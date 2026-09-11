import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Tabs, TabPanel } from '@/components/common/Tabs'
import { AgentChat } from './AgentChat'
import { chatStorage } from '@/services/chatStorage'
import { MessageCircle, TrendingUp, UserPlus } from 'lucide-react'

const TABS = [
  { id: 'hop-thu', label: 'Hộp thư' },
  { id: 'lead', label: 'Lead mới' },
] as const

export function AgentCustomers() {
  const [params, setParams] = useSearchParams()
  const tabParam = params.get('tab') ?? 'hop-thu'
  const [active, setActive] = useState(
    TABS.some((t) => t.id === tabParam) ? tabParam : 'hop-thu',
  )
  const [selectedLeadId, setSelectedLeadId] = useState<string | undefined>(undefined)
  const [conversations, setConversations] = useState(() => chatStorage.getConversations())

  useEffect(() => {
    function loadChatData() {
      setConversations(chatStorage.getConversations())
    }
    loadChatData()
    window.addEventListener('bdspro_chat_updated', loadChatData)
    window.addEventListener('storage', loadChatData)
    return () => {
      window.removeEventListener('bdspro_chat_updated', loadChatData)
      window.removeEventListener('storage', loadChatData)
    }
  }, [])

  useEffect(() => {
    if (tabParam && TABS.some((t) => t.id === tabParam)) {
      setActive(tabParam)
    }
  }, [tabParam])

  const unreadCount = conversations.reduce((s, c) => s + (c.unread || 0), 0)

  function handleTabChange(id: string) {
    setActive(id)
    setParams({ tab: id }, { replace: true })
  }

  function handleReplyLead(leadId: string) {
    setSelectedLeadId(leadId)
    setActive('hop-thu')
    setParams({ tab: 'hop-thu' }, { replace: true })
  }

  const tabsWithBadge = TABS.map((t) =>
    t.id === 'hop-thu'
      ? { ...t, badge: unreadCount > 0 ? unreadCount : undefined }
      : { ...t, badge: conversations.length > 0 ? conversations.length : undefined }
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Khách hàng & Lead</h1>
        <p className="mt-1 text-slate-500">
          Nhận lead từ người mua quan tâm BĐS → Chat trực tiếp → Chuyển đổi giao dịch
        </p>
      </div>

      <Tabs tabs={tabsWithBadge} active={active} onChange={handleTabChange} />

      <TabPanel active={active} id="hop-thu">
        <AgentChat embedded selectedId={selectedLeadId} />
      </TabPanel>

      <TabPanel active={active} id="lead">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <UserPlus className="h-10 w-10 text-slate-300 mb-2" />
            <h3 className="font-bold text-slate-900">Chưa có lead mới</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm">
              Khi khách hàng xem tin đăng của bạn và nhấn "Nhắn tin tư vấn", thông tin lead và tin nhắn sẽ tự động xuất hiện tại đây.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:gap-4 hover:shadow-md transition-shadow">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                  {c.participantName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{c.participantName}</p>
                  <p className="text-sm text-slate-500">{c.propertyTitle || 'Bất động sản'}</p>
                </div>
                <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                  Lead Mới
                </span>
                <span className="text-xs text-slate-400">{c.lastMessageTime}</span>
                <button
                  type="button"
                  onClick={() => handleReplyLead(c.id)}
                  className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                >
                  Phản hồi
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <UserPlus className="h-5 w-5 text-emerald-600" />
            <p className="mt-2 text-2xl font-bold text-slate-900">{conversations.length}</p>
            <p className="text-xs text-slate-500">Total Leads</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <MessageCircle className="h-5 w-5 text-violet-600" />
            <p className="mt-2 text-2xl font-bold text-slate-900">100%</p>
            <p className="text-xs text-slate-500">Tỷ lệ phản hồi</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <TrendingUp className="h-5 w-5 text-sky-600" />
            <p className="mt-2 text-2xl font-bold text-slate-900">Realtime</p>
            <p className="text-xs text-slate-500">Trạng thái kết nối</p>
          </div>
        </div>
      </TabPanel>
    </div>
  )
}
