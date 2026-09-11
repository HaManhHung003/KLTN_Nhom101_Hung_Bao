import { useState } from 'react'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { ChatConversationPane } from '@/components/chat/ChatConversationPane'
import { ChatThreadList } from '@/components/chat/ChatThreadList'
import { chatThreads as seedThreads, threadMessages as seedMessages } from '@/data/mockData'
import type { ChatMessage, ChatThread } from '@/types/chat'

export function MessagingInbox() {
  const [threads, setThreads] = useState<ChatThread[]>(seedThreads)
  const [messagesByThread, setMessagesByThread] = useState<Record<string, ChatMessage[]>>(seedMessages)
  const [activeId, setActiveId] = useState(seedThreads[0]?.id ?? '')
  const [mobileShowChat, setMobileShowChat] = useState(false)

  const activeThread = threads.find((t) => t.id === activeId)
  const messages = messagesByThread[activeId] ?? []

  function selectThread(id: string) {
    setActiveId(id)
    setMobileShowChat(true)
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, unread: 0 } : t)),
    )
  }

  function appendMessage(threadId: string, message: ChatMessage) {
    setMessagesByThread((prev) => ({
      ...prev,
      [threadId]: [...(prev[threadId] ?? []), message],
    }))
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? { ...t, lastMessage: message.content, lastMessageTime: 'Vừa xong' }
          : t,
      ),
    )
  }

  function handleSend(text: string) {
    appendMessage(activeId, {
      id: `m-${Date.now()}`,
      senderId: 'u1',
      content: text,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      isOwn: true,
      type: 'text',
      read: false,
    })
  }

  function handleSendBooking() {
    const thread = threads.find((t) => t.id === activeId)
    if (!thread?.propertyId || !thread.propertyThumbnail) return
    appendMessage(activeId, {
      id: `m-${Date.now()}`,
      senderId: 'u1',
      content: 'Lời mời xem nhà',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      isOwn: true,
      type: 'booking',
      read: false,
      booking: {
        propertyId: thread.propertyId,
        propertyTitle: thread.propertyTitle ?? 'Bất động sản',
        propertyImage: thread.propertyThumbnail,
        date: '2026-08-20',
        time: '14:00',
        status: 'pending',
        tourType: 'in_person',
      },
    })
  }

  if (!activeThread) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500">
        <MessageSquare className="mr-2 h-5 w-5" />
        Chưa có cuộc trò chuyện nào
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div
        className={`w-full shrink-0 md:block md:w-80 lg:w-96 ${
          mobileShowChat ? 'hidden md:block' : 'block'
        }`}
      >
        <ChatThreadList threads={threads} activeId={activeId} onSelect={selectThread} />
      </div>

      <div className={`min-w-0 flex-1 ${mobileShowChat ? 'flex flex-col' : 'hidden md:flex md:flex-col'}`}>
        <button
          type="button"
          onClick={() => setMobileShowChat(false)}
          className="flex items-center gap-2 border-b border-slate-100 px-4 py-2 text-sm font-medium text-sky-600 md:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          Tất cả tin nhắn
        </button>
        <ChatConversationPane
          thread={activeThread}
          messages={messages}
          onSend={handleSend}
          onSendBooking={handleSendBooking}
        />
      </div>
    </div>
  )
}
