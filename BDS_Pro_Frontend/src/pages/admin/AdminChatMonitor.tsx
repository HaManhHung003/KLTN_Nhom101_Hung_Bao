import { Eye, Flag, MessageCircle } from 'lucide-react'
import { monitoredChats } from '@/data/mockData'

export function AdminChatMonitor({ embedded = false }: { embedded?: boolean }) {
  return (
    <div>
      {!embedded && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Giám sát Chat</h1>
          <p className="text-slate-500">Theo dõi hội thoại real-time — FR-C01</p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-slate-500">
              <th className="p-4 font-medium">Khách hàng</th>
              <th className="p-4 font-medium">Môi giới</th>
              <th className="p-4 font-medium">BĐS liên quan</th>
              <th className="p-4 font-medium">Tin nhắn</th>
              <th className="p-4 font-medium">Hoạt động</th>
              <th className="p-4 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {monitoredChats.map((c) => (
              <tr key={c.id} className={`border-t border-slate-100 ${c.flagged ? 'bg-red-50/50' : ''}`}>
                <td className="p-4 font-medium text-slate-900">{c.buyer}</td>
                <td className="p-4">{c.agent}</td>
                <td className="p-4 text-slate-600">{c.property}</td>
                <td className="p-4">{c.messages}</td>
                <td className="p-4 text-slate-400">{c.lastActive}</td>
                <td className="p-4">
                  <div className="flex gap-1">
                    <button type="button" className="rounded-lg p-2 hover:bg-slate-100" title="Xem chat">
                      <Eye className="h-4 w-4 text-slate-500" />
                    </button>
                    <button type="button" className="rounded-lg p-2 hover:bg-slate-100" title="Nhắn tin">
                      <MessageCircle className="h-4 w-4 text-slate-500" />
                    </button>
                    {c.flagged && (
                      <button type="button" className="rounded-lg p-2 hover:bg-red-100" title="Vi phạm">
                        <Flag className="h-4 w-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
