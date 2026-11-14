import { useState, useRef, useEffect } from 'react'
import { Bot, Maximize2, Minimize2, Send, Sparkles, X } from 'lucide-react'
import { AiPropertyMiniCard } from '@/components/chat/AiPropertyMiniCard'
import { AI_QUICK_PROMPTS, type AiChatMessage } from '@/types/chat'
import { aiChatSession as seedSession, properties } from '@/data/mockData'

interface AiAssistantWidgetProps {
  /** Start expanded (e.g. on dedicated chat page) */
  defaultOpen?: boolean
}

export function AiAssistantWidget({ defaultOpen = false }: AiAssistantWidgetProps) {
  const [expanded, setExpanded] = useState(defaultOpen)
  const [showBubble, setShowBubble] = useState(true)
  const [messages, setMessages] = useState<AiChatMessage[]>(seedSession)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const latestBotMessage = [...messages].reverse().find((m) => m.role === 'bot')

  function resolveProperties(ids?: string[]) {
    if (!ids?.length) return []
    return ids.map((id) => properties.find((p) => p.id === id)).filter(Boolean) as typeof properties
  }

  function sendPrompt(text: string) {
    const userMsg: AiChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)
    setShowBubble(true)

    setTimeout(() => {
      const lower = text.toLowerCase()
      const isRedBook = lower.includes('sổ hồng') || lower.includes('so hong') || lower.includes('red book') || lower.includes('pháp lý')
      const botReply: AiChatMessage = {
        id: `b-${Date.now()}`,
        role: 'bot',
        content: isRedBook
          ? 'Dưới đây là các tin đăng đã được thẩm định pháp lý sổ hồng riêng minh bạch tại TP.HCM:'
          : 'Dựa trên tiêu chí bạn tìm kiếm, tôi đề xuất các bất động sản phù hợp nhất sau đây:',
        propertyIds: isRedBook
          ? ['p2', 'p5', 'p7']
          : ['p1', 'p4', 'p2'],
      }
      setMessages((prev) => [...prev, botReply])
      setIsTyping(false)
    }, 500)
  }

  function handleSend() {
    const text = input.trim()
    if (!text) return
    setInput('')
    sendPrompt(text)
  }

  useEffect(() => {
    if (expanded && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, expanded, isTyping])

  // ── FULL EXPANDED WINDOW (Docked on left side) ──
  if (expanded) {
    return (
      <div className="fixed bottom-20 md:bottom-6 left-4 sm:left-6 z-40 flex h-[520px] max-h-[calc(100vh-6rem)] w-[360px] sm:w-[390px] flex-col overflow-hidden rounded-2xl border border-violet-200/80 bg-white shadow-2xl transition animate-in fade-in slide-in-from-bottom-3 duration-200">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">Trợ lý AI BDS Pro</p>
              <p className="text-[10px] text-violet-200">Tìm kiếm & phân tích BĐS thông minh</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-white/80">
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="rounded-lg p-1.5 hover:bg-white/20 transition"
              title="Thu nhỏ thành bong bóng"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setExpanded(false)
                setShowBubble(false)
              }}
              className="rounded-lg p-1.5 hover:bg-white/20 transition"
              title="Đóng cửa sổ"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Message history */}
        <div className="flex-1 space-y-3.5 overflow-y-auto bg-gradient-to-b from-violet-50/30 to-white p-3.5">
          {messages.map((m) => (
            <div key={m.id} className={`flex items-start gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {m.role === 'bot' && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 ring-2 ring-violet-200 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div className={`max-w-[82%] space-y-1.5 ${m.role === 'user' ? 'text-right' : ''}`}>
                {m.content && (
                  <div
                    className={`inline-block rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-2xs ${
                      m.role === 'user'
                        ? 'rounded-br-xs bg-violet-600 text-white'
                        : 'rounded-bl-xs bg-white text-slate-800 border border-slate-100'
                    }`}
                  >
                    {m.content}
                  </div>
                )}
                {m.propertyIds && m.propertyIds.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
                    {resolveProperties(m.propertyIds).map((p) => (
                      <AiPropertyMiniCard key={p.id} property={p} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-violet-600">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100">
                <Bot className="h-3 w-3" />
              </div>
              <span className="italic">AI đang phân tích dữ liệu...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-t border-slate-100 bg-slate-50/50 px-3 py-1.5 text-[11px] no-scrollbar">
          {AI_QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendPrompt(prompt)}
              className="shrink-0 rounded-full border border-violet-200 bg-white px-2.5 py-1 font-medium text-violet-700 hover:bg-violet-50 transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 bg-white p-2.5">
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Hỏi AI về bất động sản, pháp lý..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-violet-500 focus:bg-white transition"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 transition shrink-0"
              aria-label="Gửi"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── COLLAPSED / BUBBLE MODE (Avatar + Message beside avatar) ──
  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 sm:left-6 z-40 flex items-end gap-3 pointer-events-none">
      {/* 1. Round AI Avatar Button */}
      <div className="relative pointer-events-auto shrink-0">
        <button
          type="button"
          onClick={() => {
            if (showBubble) {
              setExpanded(true)
            } else {
              setShowBubble(true)
            }
          }}
          className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 text-white shadow-xl shadow-violet-400/40 ring-4 ring-white hover:scale-105 active:scale-95 transition"
          aria-label="Mở Trợ lý AI Bất động sản"
        >
          <Bot className="h-6 w-6" />
        </button>
        {/* Pulsing online status */}
        <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
        </span>
      </div>

      {/* 2. Message Bubble Beside Avatar */}
      {showBubble && (
        <div className="pointer-events-auto flex max-w-[290px] sm:max-w-[340px] flex-col rounded-2xl rounded-bl-xs border border-violet-200/80 bg-white/95 p-3.5 shadow-2xl backdrop-blur-md transition animate-in fade-in slide-in-from-left-2 duration-200">
          {/* Bubble header */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1 text-violet-700 text-xs font-bold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Trợ lý AI BDS Pro</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="rounded-md p-1 hover:bg-slate-100 hover:text-slate-700 transition"
                title="Mở rộng khung chat"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowBubble(false)}
                className="rounded-md p-1 hover:bg-slate-100 hover:text-slate-700 transition"
                title="Ẩn tin nhắn"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Message content beside avatar */}
          <p className="text-xs text-slate-700 leading-relaxed">
            {latestBotMessage?.content || '👋 Chào bạn! Bạn đang cần tìm BĐS ở khu vực nào hoặc cần thẩm định pháp lý không?'}
          </p>

          {/* Quick Prompts inside bubble */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {AI_QUICK_PROMPTS.slice(0, 2).map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => {
                  sendPrompt(prompt)
                  setExpanded(true)
                }}
                className="rounded-lg border border-violet-200 bg-violet-50/70 px-2.5 py-1 text-[11px] font-semibold text-violet-700 hover:bg-violet-100 transition truncate max-w-full"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Quick inline input */}
          <div className="mt-2.5 flex items-center gap-1 border-t border-slate-100 pt-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && input.trim()) {
                  handleSend()
                  setExpanded(true)
                }
              }}
              placeholder="Hỏi nhanh AI..."
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-violet-500 focus:bg-white transition"
            />
            <button
              type="button"
              onClick={() => {
                if (input.trim()) {
                  handleSend()
                  setExpanded(true)
                }
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition shrink-0"
              aria-label="Gửi"
            >
              <Send className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
