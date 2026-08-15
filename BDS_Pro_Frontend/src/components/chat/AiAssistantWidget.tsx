import { useState } from 'react'
import { Bot, ChevronDown, Send, Sparkles, X } from 'lucide-react'
import { AiPropertyMiniCard } from '@/components/chat/AiPropertyMiniCard'
import { AI_QUICK_PROMPTS, type AiChatMessage } from '@/types/chat'
import { aiChatSession as seedSession, properties } from '@/data/mockData'

interface AiAssistantWidgetProps {
  /** Start expanded (e.g. on dedicated chat page) */
  defaultOpen?: boolean
}

export function AiAssistantWidget({ defaultOpen = false }: AiAssistantWidgetProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [expanded, setExpanded] = useState(defaultOpen)
  const [messages, setMessages] = useState<AiChatMessage[]>(seedSession)
  const [input, setInput] = useState('')

  function resolveProperties(ids?: string[]) {
    if (!ids?.length) return []
    return ids.map((id) => properties.find((p) => p.id === id)).filter(Boolean) as typeof properties
  }

  function sendPrompt(text: string) {
    const userMsg: AiChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])

    setTimeout(() => {
      const lower = text.toLowerCase()
      const isRedBook = lower.includes('sổ hồng') || lower.includes('so hong') || lower.includes('red book')
      const botReply: AiChatMessage = {
        id: `b-${Date.now()}`,
        role: 'bot',
        content: isRedBook
          ? 'Đây là các tin đăng đã xác minh pháp lý sổ hồng tại TP.HCM:'
          : 'Dựa trên tiêu chí của bạn, tôi gợi ý các bất động sản sau:',
        propertyIds: isRedBook
          ? ['p2', 'p5', 'p7']
          : ['p1', 'p6', 'p4'],
      }
      setMessages((prev) => [...prev, botReply])
    }, 600)
  }

  function handleSend() {
    const text = input.trim()
    if (!text) return
    setInput('')
    sendPrompt(text)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => { setOpen(true); setExpanded(true) }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-xl shadow-violet-400/40 transition hover:scale-105"
        aria-label="Mở Trợ lý AI Bất động sản"
      >
        <Bot className="h-6 w-6" />
      </button>
    )
  }

  return (
    <div
      className={`fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-violet-200/60 bg-white shadow-2xl transition-all ${
        expanded
          ? 'bottom-4 right-4 h-[min(560px,calc(100vh-2rem))] w-[min(400px,calc(100vw-2rem))]'
          : 'bottom-6 right-6 h-14 w-80'
      }`}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-white/20 p-1.5">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold">Trợ lý AI Bất động sản</p>
            <p className="text-[10px] text-violet-200">Tìm kiếm thông minh · Gợi ý tức thì</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-lg p-1.5 hover:bg-white/10"
            aria-label={expanded ? 'Thu gọn' : 'Mở rộng'}
          >
            <ChevronDown className={`h-4 w-4 transition ${expanded ? '' : 'rotate-180'}`} />
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); setExpanded(false) }}
            className="rounded-lg p-1.5 hover:bg-white/10"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <>
          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-violet-50/50 to-white p-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {m.role === 'bot' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100">
                    <Bot className="h-3.5 w-3.5 text-violet-600" />
                  </div>
                )}
                <div className={`max-w-[90%] ${m.role === 'user' ? 'text-right' : ''}`}>
                  {m.content && (
                    <div
                      className={`inline-block rounded-2xl px-3 py-2 text-sm ${
                        m.role === 'user'
                          ? 'rounded-br-md bg-violet-600 text-white'
                          : 'rounded-bl-md bg-white text-slate-800 shadow-sm ring-1 ring-slate-100'
                      }`}
                    >
                      {m.content}
                    </div>
                  )}
                  {m.propertyIds && m.propertyIds.length > 0 && (
                    <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                      {resolveProperties(m.propertyIds).map((p) => (
                        <AiPropertyMiniCard key={p.id} property={p} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Quick prompts — show after greeting if only 1 bot message */}
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {AI_QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendPrompt(prompt)}
                    className="rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-medium text-violet-700 shadow-sm transition hover:bg-violet-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-slate-100 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Hỏi về bất động sản..."
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
              <button
                type="button"
                onClick={handleSend}
                className="rounded-xl bg-violet-600 p-2 text-white hover:bg-violet-700"
                aria-label="Gửi"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
