import type { ChatThread } from '@/types/chat'

interface ChatThreadListProps {
  threads: ChatThread[]
  activeId: string
  onSelect: (id: string) => void
}

const ROLE_LABELS = { buyer: 'Người mua', agent: 'Môi giới', admin: 'Quản trị' } as const

export function ChatThreadList({ threads, activeId, onSelect }: ChatThreadListProps) {
  return (
    <div className="flex h-full flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-4">
        <h2 className="font-bold text-slate-900">Tin nhắn</h2>
        <p className="text-xs text-slate-500">{threads.length} cuộc trò chuyện</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {threads.map((thread) => (
          <button
            key={thread.id}
            type="button"
            onClick={() => onSelect(thread.id)}
            className={`flex w-full gap-3 border-b border-slate-50 p-4 text-left transition hover:bg-slate-50 ${
              activeId === thread.id ? 'bg-sky-50 ring-1 ring-inset ring-sky-200' : ''
            }`}
          >
            <div className="relative shrink-0">
              <img
                src={thread.participantAvatar}
                alt=""
                className="h-11 w-11 rounded-full ring-2 ring-white"
              />
              {thread.online && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{thread.participantName}</p>
                  <p className="text-[10px] font-medium uppercase text-slate-400">
                    {ROLE_LABELS[thread.participantRole]}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] text-slate-400">{thread.lastMessageTime}</span>
              </div>
              <p className="mt-1 truncate text-sm text-slate-500">{thread.lastMessage}</p>
              {thread.propertyThumbnail && (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={thread.propertyThumbnail}
                    alt=""
                    className="h-8 w-10 rounded object-cover ring-1 ring-slate-200"
                  />
                  <p className="truncate text-xs text-sky-600">{thread.propertyTitle}</p>
                </div>
              )}
            </div>

            {thread.unread > 0 && (
              <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-sky-600 px-1.5 text-[10px] font-bold text-white">
                {thread.unread}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
