import { Bot, MessageSquare } from 'lucide-react'
import { AiAssistantWidget } from '@/components/chat/AiAssistantWidget'
import { MessagingInbox } from '@/components/chat/MessagingInbox'

export function ClientChatPage() {
  return (
    <div className="relative flex h-[calc(100vh-4rem)] flex-col">
      <div className="mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100">
            <MessageSquare className="h-5 w-5 text-sky-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Chat & Trợ lý AI</h1>
            <p className="text-sm text-slate-500">
              Nhắn tin trực tiếp với môi giới · Gợi ý bất động sản bằng AI
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <MessagingInbox />
      </div>

      {/* AI widget — open by default on this page */}
      <AiAssistantWidget defaultOpen />

      <p className="mt-3 flex shrink-0 items-center justify-center gap-1.5 text-center text-xs text-slate-400">
        <Bot className="h-3.5 w-3.5" />
        Trợ lý AI cũng có sẵn dạng widget nổi trên mọi trang
      </p>
    </div>
  )
}
