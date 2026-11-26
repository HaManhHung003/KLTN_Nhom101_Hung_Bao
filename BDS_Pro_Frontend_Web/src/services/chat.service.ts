import { api } from './api';

export interface ChatParticipant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  role: string;
}

export interface ChatPropertyInfo {
  id: string;
  title: string;
  price: number;
  address: string;
  transactionType: string;
  type?: string;
  images?: string[];
}

export interface ConversationItem {
  id: string;
  userAId: string;
  userBId: string;
  propertyId: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  userA?: ChatParticipant;
  userB?: ChatParticipant;
  property?: ChatPropertyInfo;
  createdAt: string;
}

export interface ChatMessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  readAt: string | null;
  createdAt: string;
  sender?: ChatParticipant;
}

export const chatService = {
  /** Lấy danh sách cuộc hội thoại của tài khoản đang đăng nhập. */
  async getConversations(): Promise<ConversationItem[]> {
    try {
      const res = await api.get<any, any>('/chat/conversations');
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      return [];
    } catch {
      return [];
    }
  },

  /** Tạo hoặc tìm cuộc hội thoại 1-1 với đối tác (môi giới hoặc khách hàng). */
  async startConversation(recipientId: string, propertyId?: string): Promise<ConversationItem> {
    const res = await api.post<any, any>('/chat/conversations', {
      recipientId,
      propertyId: propertyId || undefined,
    });
    return res.data || res;
  },

  /** Lấy danh sách tin nhắn trong cuộc hội thoại (sắp xếp tăng dần theo thời gian). */
  async getMessages(conversationId: string, page = 1, limit = 50): Promise<ChatMessageItem[]> {
    try {
      const res = await api.get<any, any>(`/chat/conversations/${conversationId}/messages`, {
        params: { page, limit },
      });
      const list: ChatMessageItem[] = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : [];
      // Backend order is DESC (newest first), reverse to ASC (oldest to newest) for chat display
      return list.slice().reverse();
    } catch {
      return [];
    }
  },

  /** Gửi tin nhắn mới trong cuộc hội thoại. */
  async sendMessage(conversationId: string, content: string): Promise<ChatMessageItem> {
    const res = await api.post<any, any>('/chat/messages', {
      conversationId,
      content,
    });
    const message = res.data || res;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bdspro_chat_updated'));
    }
    return message;
  },

  /** Lấy đối tác trò chuyện (người còn lại không phải currentUser). */
  getOtherParticipant(conv: ConversationItem, currentUserId?: string): ChatParticipant {
    if (!currentUserId) {
      return conv.userB || conv.userA || { id: '', name: 'Người dùng', email: '', role: 'agent' };
    }
    if (conv.userAId === currentUserId) {
      return conv.userB || { id: conv.userBId, name: 'Người dùng', email: '', role: 'agent' };
    }
    return conv.userA || { id: conv.userAId, name: 'Người dùng', email: '', role: 'buyer' };
  },
};
