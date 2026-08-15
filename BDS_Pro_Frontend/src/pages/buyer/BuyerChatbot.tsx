import { Bot, Send, Sparkles } from 'lucide-react'
import { chatbotMessages, properties } from '@/data/mockData'
import { PropertyCard } from '@/components/common/PropertyCard'
import { Link } from 'react-router-dom'

export function BuyerChatbot() {
  const suggestions = properties.filter((p) => p.status === 'active').slice(0, 3)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/20 p-3">
            <Bot className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Trợ lý AI BDS Pro</h1>
            <p className="text-sm text-violet-100">Phân tích nhu cầu và gợi ý BĐS phù hợp</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="space-y-4 p-6">
          {chatbotMessages.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {m.role === 'bot' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100">
                  <Bot className="h-4 w-4 text-violet-600" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line ${
                  m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-900'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-100 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Mô tả nhu cầu BĐS của bạn..."
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-500"
            />
            <button type="button" className="rounded-xl bg-violet-600 p-2.5 text-white hover:bg-violet-700">
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-600" />
          <h2 className="font-bold text-slate-900">BĐS được AI gợi ý</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {suggestions.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-slate-500">
          <Link to="/buyer/chat" className="text-brand-600 hover:underline">Chuyển sang môi giới thật</Link> khi cần tư vấn chi tiết
        </p>
      </section>
    </div>
  )
}
