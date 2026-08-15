import { MessagingInbox } from '@/components/chat/MessagingInbox'

export function BrokerInboxPage() {
  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col space-y-4">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-slate-900">Hộp thư</h1>
        <p className="text-slate-500">Nhắn tin trực tiếp với người mua và khách hàng tiềm năng.</p>
      </div>
      <div className="min-h-0 flex-1">
        <MessagingInbox />
      </div>
    </div>
  )
}
