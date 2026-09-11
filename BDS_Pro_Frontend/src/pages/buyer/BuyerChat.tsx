import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Send, MessageCircle, Building2 } from 'lucide-react'
import { chatStorage } from '@/services/chatStorage'
import { CLIENT_ROUTES } from '@/config/routes'
import type { Conversation, Message } from '@/types'

interface BuyerChatProps {
  embedded?: boolean
  selectedId?: string
}

export function BuyerChat({ embedded = false, selectedId }: BuyerChatProps) {
  const [searchParams] = useSearchParams()
  const convParam = searchParams.get('conv')

  const [conversations, setConversations] = useState<Conversation[]>(() => chatStorage.getConversations())
  const [activeId, setActiveId] = useState<string>(
    selectedId || convParam || conversations[0]?.id || ''
  )
  const [inputText, setInputText] = useState('')

  // Listen to chat updates from localStorage / chatStorage events
  useEffect(() => {
    function loadChatData() {
      const latest = chatStorage.getConversations()
      setConversations(latest)
      if (!activeId && latest.length > 0) {
        setActiveId(selectedId || convParam || latest[0].id)
      }
    }

    loadChatData()
    window.addEventListener('bdspro_chat_updated', loadChatData)
    window.addEventListener('storage', loadChatData)

    return () => {
      window.removeEventListener('bdspro_chat_updated', loadChatData)
      window.removeEventListener('storage', loadChatData)
    }
  }, [activeId, convParam, selectedId])

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0]
  const currentMessages: Message[] = active ? chatStorage.getMessages(active.id) : []

  function handleSelectConversation(id: string) {
    setActiveId(id)
    chatStorage.markAsRead(id)
  }

  function handleSendMessage() {
    if (!inputText.trim() || !active) return
    chatStorage.sendMessage(active.id, inputText.trim(), true)
    setInputText('')
  }

  // If no conversations exist yet (no buyer has contacted host)
  if (conversations.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm ${
          embedded ? 'h-[500px]' : 'h-[calc(100vh-8rem)]'
        }`}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-4">
          <MessageCircle className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Chưa có cuộc trò chuyện nào</h3>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          Khi bạn xem bất kỳ bất động sản nào và nhấn nút <span className="font-semibold text-emerald-700">"Nhắn tin tư vấn"</span>, cuộc hội thoại trực tiếp với môi giới / chủ nhà sẽ hiển thị tại đây.
        </p>
        <Link
          to={CLIENT_ROUTES.search}
          className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
        >
          <Building2 className="h-4 w-4" />
          Khám phá bất động sản ngay
        </Link>
      </div>
    )
  }

  return (
    <div
      className={`flex overflow-hidden rounded-2xl border border-slate-200 bg-white ${
        embedded ? 'h-[540px]' : 'h-[calc(100vh-8rem)]'
      }`}
    >
      {/* Sidebar - Conversation List */}
      <div className="w-80 shrink-0 border-r border-slate-100 flex flex-col">
        <div className="border-b border-slate-100 p-4 bg-slate-50/50">
          <h2 className="font-bold text-slate-900">Tin nhắn & Khách hàng</h2>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {conversations.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleSelectConversation(c.id)}
              className={`flex w-full gap-3 p-4 text-left hover:bg-slate-50 transition-colors ${
                active?.id === c.id ? 'bg-emerald-50/70 border-l-4 border-l-emerald-600' : ''
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={c.participantAvatar}
                  alt={c.participantName}
                  className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200"
                />
                {c.online && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900 truncate text-sm">{c.participantName}</p>
                  <span className="text-[11px] text-slate-400 shrink-0">{c.lastMessageTime}</span>
                </div>
                <p className="truncate text-xs text-slate-500 mt-0.5">{c.lastMessage}</p>
                {c.propertyTitle && (
                  <p className="mt-1 truncate text-[11px] font-medium text-emerald-700">{c.propertyTitle}</p>
                )}
              </div>
              {c.unread > 0 && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                  {c.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {active ? (
          <>
            <div className="flex items-center gap-3 border-b border-slate-100 p-4 bg-slate-50/50">
              <div className="relative">
                <img
                  src={active.participantAvatar}
                  alt={active.participantName}
                  className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200"
                />
                {active.online && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{active.participantName}</p>
                <p className="text-xs text-emerald-600 flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {active.online ? 'Đang online' : 'Ngoại tuyến'}
                  {active.propertyTitle && <span className="text-slate-400">· {active.propertyTitle}</span>}
                </p>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4 bg-slate-50/30">
              {currentMessages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                  Hãy bắt đầu cuộc trò chuyện với {active.participantName}
                </div>
              ) : (
                currentMessages.map((m) => (
                  <div key={m.id} className={`flex ${m.isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                        m.isOwn
                          ? 'bg-emerald-600 text-white rounded-br-none'
                          : 'bg-white text-slate-900 border border-slate-100 rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.content}</p>
                      <p className={`mt-1 text-[10px] text-right ${m.isOwn ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {m.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-100 p-4 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-slate-400 text-sm">
            Chọn một cuộc trò chuyện từ danh sách
          </div>
        )}
      </div>
    </div>
  )
}
