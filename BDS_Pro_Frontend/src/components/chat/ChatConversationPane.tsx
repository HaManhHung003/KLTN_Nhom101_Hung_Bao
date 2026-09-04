import { useRef, useState } from 'react'
import { CalendarPlus, ImagePlus, Send } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ChatMessageBubble } from '@/components/chat/ChatMessageBubble'
import type { ChatMessage, ChatThread } from '@/types/chat'
import { CLIENT_ROUTES } from '@/config/routes'
import { properties } from '@/data/mockData'

interface ChatConversationPaneProps {
  thread: ChatThread
  messages: ChatMessage[]
  onSend: (text: string) => void
  onSendBooking: () => void
}

const ROLE_LABELS = { buyer: 'Người mua', agent: 'Môi giới', admin: 'Quản trị' } as const

export function ChatConversationPane({ thread, messages, onSend, onSendBooking }: ChatConversationPaneProps) {
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const property = thread.propertyId ? properties.find((p) => p.id === thread.propertyId) : undefined

  function handleSend() {
    const text = draft.trim()
    if (!text) return
    onSend(text)
    setDraft('')
  }

  return (
    <div className="flex h-full flex-1 flex-col bg-slate-50">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <div className="relative">
          <img src={thread.participantAvatar} alt="" className="h-10 w-10 rounded-full" />
          {thread.online && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">{thread.participantName}</p>
          <p className="text-xs text-slate-500">
            {ROLE_LABELS[thread.participantRole]} ·{' '}
            <span className={thread.online ? 'text-emerald-600' : 'text-slate-400'}>
              {thread.online ? 'Đang hoạt động' : 'Ngoại tuyến'}
            </span>
          </p>
        </div>
        {property && (
          <Link
            to={CLIENT_ROUTES.property(property.id)}
            className="hidden items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 sm:flex"
          >
            <img src={property.images[0]} alt="" className="h-6 w-8 rounded object-cover" />
            <span className="max-w-[140px] truncate text-xs font-medium text-sky-800">
              {property.title}
            </span>
          </Link>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((m) => (
          <ChatMessageBubble key={m.id} message={m} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-slate-200 bg-white p-3">
        <div className="mb-2 flex gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            title="Đính kèm ảnh"
          >
            <ImagePlus className="h-3.5 w-3.5" />
            Ảnh
          </button>
          <button
            type="button"
            onClick={onSendBooking}
            className="flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100"
          >
            <CalendarPlus className="h-3.5 w-3.5" />
            Gửi lời mời xem nhà
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Nhập tin nhắn..."
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
          <button
            type="button"
            onClick={handleSend}
            className="rounded-xl bg-sky-600 p-2.5 text-white transition hover:bg-sky-700"
            aria-label="Gửi tin nhắn"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
