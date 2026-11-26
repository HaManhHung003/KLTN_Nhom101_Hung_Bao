import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Tabs, TabPanel } from '@/components/common/Tabs'
import { AgentChat } from './AgentChat'
import { chatService, type ConversationItem } from '@/services/chat.service'
import { authStorage } from '@/services/auth.service'
import { MessageCircle, TrendingUp, UserPlus } from 'lucide-react'

const TABS = [
  { id: 'hop-thu', label: 'Hộp thư' },
  { id: 'lead', label: 'Lead mới' },
] as const

export function AgentCustomers() {
  const currentUser = authStorage.getUser()
  const currentUserId = currentUser?.id || ''

  const [params, setParams] = useSearchParams()
  const tabParam = params.get('tab') ?? 'hop-thu'
  const [active, setActive] = useState(
    TABS.some((t) => t.id === tabParam) ? tabParam : 'hop-thu',
  )
  const [selectedLeadId, setSelectedLeadId] = useState<string | undefined>(undefined)
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadChatData = async () => {
    try {
      const list = await chatService.getConversations()
      setConversations(list)
    } catch {
      // Ignored
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadChatData()
    const timer = setInterval(loadChatData, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (tabParam && TABS.some((t) => t.id === tabParam)) {
      setActive(tabParam)
    }
  }, [tabParam])

  function handleTabChange(id: string) {
    setActive(id)
    setParams({ tab: id }, { replace: true })
  }

  function handleReplyLead(leadId: string) {
    setSelectedLeadId(leadId)
    setActive('hop-thu')
    setParams({ tab: 'hop-thu', conv: leadId }, { replace: true })
  }

  const tabsWithBadge = TABS.map((t) =>
    t.id === 'hop-thu'
      ? { ...t, badge: conversations.length > 0 ? conversations.length : undefined }
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
        {loading && conversations.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Đang tải danh sách khách hàng...
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <UserPlus className="h-10 w-10 text-slate-300 mb-2" />
            <h3 className="font-bold text-slate-900">Chưa có lead mới</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm">
              Khi khách hàng xem tin đăng của bạn và nhấn "Nhắn tin tư vấn", thông tin lead và tin nhắn sẽ tự động xuất hiện tại đây.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((c) => {
              const other = chatService.getOtherParticipant(c, currentUserId)
              const name = other?.name || other?.email?.split('@')[0] || 'Khách hàng'
              const formattedTime = c.lastMessageAt
                ? new Date(c.lastMessageAt).toLocaleString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                  })
                : ''

              return (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">{name}</p>
                      {other?.phone && (
                        <span className="text-xs text-slate-500 font-medium">({other.phone})</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 font-medium line-clamp-1">
                      {c.property?.title || 'Bất động sản quan tâm'}
                    </p>
                    {c.lastMessage && (
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        "{c.lastMessage}"
                      </p>
                    )}
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                    Khách quan tâm
                  </span>
                  {formattedTime && (
                    <span className="text-xs text-slate-400">{formattedTime}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleReplyLead(c.id)}
                    className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    Phản hồi
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <UserPlus className="h-5 w-5 text-emerald-600" />
            <p className="mt-2 text-2xl font-bold text-slate-900">{conversations.length}</p>
            <p className="text-xs text-slate-500">Tổng số Lead & Hội thoại</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <MessageCircle className="h-5 w-5 text-violet-600" />
            <p className="mt-2 text-2xl font-bold text-slate-900">100%</p>
            <p className="text-xs text-slate-500">Tỷ lệ kết nối DB</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <TrendingUp className="h-5 w-5 text-sky-600" />
            <p className="mt-2 text-2xl font-bold text-slate-900">Realtime</p>
            <p className="text-xs text-slate-500">Cập nhật tự động (Polling)</p>
          </div>
        </div>
      </TabPanel>
    </div>
  )
}

