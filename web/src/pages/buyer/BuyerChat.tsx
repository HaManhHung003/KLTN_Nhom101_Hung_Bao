import { useState } from 'react'
import { Send } from 'lucide-react'
import { chatMessages, conversations } from '@/data/mockData'

export function BuyerChat({ embedded = false }: { embedded?: boolean }) {
  const [activeId, setActiveId] = useState(conversations[0].id)
  const active = conversations.find((c) => c.id === activeId)!

  return (
    <div
      className={`flex overflow-hidden rounded-2xl border border-slate-200 bg-white ${
        embedded ? 'h-[520px]' : 'h-[calc(100vh-8rem)]'
      }`}
    >
      <div className="w-80 shrink-0 border-r border-slate-100">
        <div className="border-b border-slate-100 p-4">
          <h2 className="font-bold text-slate-900">Tin nhắn</h2>
        </div>
        <div className="overflow-y-auto">
          {conversations.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveId(c.id)}
              className={`flex w-full gap-3 border-b border-slate-50 p-4 text-left hover:bg-slate-50 ${
                activeId === c.id ? 'bg-brand-50' : ''
              }`}
            >
              <div className="relative">
                <img src={c.participantAvatar} alt="" className="h-10 w-10 rounded-full" />
                {c.online && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between">
                  <p className="font-semibold text-slate-900">{c.participantName}</p>
                  <span className="text-xs text-slate-400">{c.lastMessageTime}</span>
                </div>
                <p className="truncate text-sm text-slate-500">{c.lastMessage}</p>
                {c.propertyTitle && (
                  <p className="mt-1 truncate text-xs text-brand-600">{c.propertyTitle}</p>
                )}
              </div>
              {c.unread > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs text-white">
                  {c.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-slate-100 p-4">
          <img src={active.participantAvatar} alt="" className="h-10 w-10 rounded-full" />
          <div>
            <p className="font-semibold text-slate-900">{active.participantName}</p>
            <p className="text-xs text-emerald-600">{active.online ? 'Đang online' : 'Offline'}</p>
          </div>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {chatMessages.map((m) => (
            <div key={m.id} className={`flex ${m.isOwn ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                  m.isOwn ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-900'
                }`}
              >
                {m.content}
                <p className={`mt-1 text-[10px] ${m.isOwn ? 'text-brand-200' : 'text-slate-400'}`}>{m.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-100 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
            />
            <button type="button" className="rounded-xl bg-brand-600 p-2.5 text-white hover:bg-brand-700">
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
