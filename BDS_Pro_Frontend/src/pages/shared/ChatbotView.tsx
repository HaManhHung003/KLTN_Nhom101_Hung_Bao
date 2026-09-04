import { Bot, Send, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PropertyCard } from '@/components/common/PropertyCard'
import { PageHeader } from '@/components/common/PageHeader'
import { properties } from '@/data/mockData'

interface ChatbotViewProps {
  messages: { id: string; role: 'bot' | 'user'; content: string }[]
  title: string
  description: string
  transferPath?: string
  transferLabel?: string
}

export function ChatbotView({
  messages,
  title,
  description,
  transferPath,
  transferLabel = 'Chuyển sang môi giới thật',
}: ChatbotViewProps) {
  const suggestions = properties.filter((p) => p.status === 'active').slice(0, 3)

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={title} description={description} />

      <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 p-5 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/20 p-3">
            <Bot className="h-7 w-7" />
          </div>
          <div>
            <p className="font-bold">Trợ lý AI BDS Pro</p>
            <p className="text-sm text-violet-100">Phân tích nhu cầu · Gợi ý BĐS · FAQ tự động</p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="max-h-96 space-y-4 overflow-y-auto p-6">
          {messages.map((m) => (
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
            <input type="text" placeholder="Nhập câu hỏi..." className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" />
            <button type="button" className="rounded-xl bg-violet-600 p-2.5 text-white hover:bg-violet-700">
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-600" />
          <h2 className="font-bold text-slate-900">BĐS được AI gợi ý</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {suggestions.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
        {transferPath && (
          <p className="mt-4 text-center text-sm text-slate-500">
            <Link to={transferPath} className="font-medium text-brand-600 hover:underline">{transferLabel}</Link>
          </p>
        )}
      </section>
    </div>
  )
}
