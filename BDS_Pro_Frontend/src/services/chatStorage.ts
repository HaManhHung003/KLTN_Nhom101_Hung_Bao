import type { Conversation, Message } from '@/types'

const CONVERSATIONS_KEY = 'bdspro_conversations'
const MESSAGES_PREFIX = 'bdspro_messages_'

export const chatStorage = {
  getConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(CONVERSATIONS_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  getMessages(conversationId: string): Message[] {
    try {
      const data = localStorage.getItem(MESSAGES_PREFIX + conversationId)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  getUnreadCount(): number {
    const conversations = this.getConversations()
    return conversations.reduce((s, c) => s + (c.unread || 0), 0)
  },

  createOrGetConversation(params: {
    propertyId?: string
    propertyTitle?: string
    hostName?: string
    hostAvatar?: string
    buyerName?: string
    buyerAvatar?: string
    initialMessage?: string
  }): Conversation {
    const conversations = this.getConversations()
    const targetHost = params.hostName || 'Môi giới / Chủ nhà'
    const propTitle = params.propertyTitle || 'Bất động sản'

    // Find existing conversation for this property & host
    let existing = conversations.find(
      (c) => c.propertyTitle === propTitle && c.participantName === targetHost
    )

    if (existing) {
      return existing
    }

    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    const initMsg = params.initialMessage || `Chào ${targetHost}, tôi quan tâm đến ${propTitle}. Cho tôi xin thêm thông tin nhé!`

    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      participantName: targetHost,
      participantAvatar: params.hostAvatar || 'https://i.pravatar.cc/150?u=agent',
      propertyTitle: propTitle,
      lastMessage: initMsg,
      lastMessageTime: 'Vừa xong',
      unread: 1,
      online: true,
    }

    const firstMsg: Message = {
      id: `msg_${Date.now()}`,
      senderId: 'buyer',
      content: initMsg,
      time: now,
      isOwn: true,
    }

    const updated = [newConv, ...conversations]
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updated))
    localStorage.setItem(MESSAGES_PREFIX + newConv.id, JSON.stringify([firstMsg]))

    window.dispatchEvent(new Event('bdspro_chat_updated'))
    return newConv
  },

  sendMessage(conversationId: string, content: string, isOwn = true): Message {
    const messages = this.getMessages(conversationId)
    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      senderId: isOwn ? 'own' : 'other',
      content: content.trim(),
      time: now,
      isOwn,
    }

    const updatedMessages = [...messages, newMsg]
    localStorage.setItem(MESSAGES_PREFIX + conversationId, JSON.stringify(updatedMessages))

    // Update conversation last message
    const conversations = this.getConversations()
    const updatedConvs = conversations.map((c) =>
      c.id === conversationId
        ? { ...c, lastMessage: content.trim(), lastMessageTime: 'Vừa xong', unread: isOwn ? 0 : c.unread + 1 }
        : c
    )
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updatedConvs))

    window.dispatchEvent(new Event('bdspro_chat_updated'))
    return newMsg
  },

  markAsRead(conversationId: string) {
    const conversations = this.getConversations()
    const updatedConvs = conversations.map((c) =>
      c.id === conversationId ? { ...c, unread: 0 } : c
    )
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updatedConvs))
    window.dispatchEvent(new Event('bdspro_chat_updated'))
  },
}
