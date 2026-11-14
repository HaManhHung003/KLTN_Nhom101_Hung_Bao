import type { AppointmentStatus, UserRole } from '@/types'

export type ChatMessageType = 'text' | 'image' | 'booking'

export interface BookingInvitePayload {
  propertyId: string
  propertyTitle: string
  propertyImage: string
  date: string
  time: string
  status: AppointmentStatus
  tourType?: 'in_person' | 'video'
}

export interface ChatMessage {
  id: string
  senderId: string
  content: string
  time: string
  isOwn: boolean
  type: ChatMessageType
  imageUrl?: string
  booking?: BookingInvitePayload
  read?: boolean
}

export interface ChatThread {
  id: string
  participantName: string
  participantAvatar: string
  participantRole: UserRole
  propertyId?: string
  propertyTitle?: string
  propertyThumbnail?: string
  lastMessage: string
  lastMessageTime: string
  unread: number
  online: boolean
}

export interface AiChatMessage {
  id: string
  role: 'bot' | 'user'
  content?: string
  /** Property IDs suggested inline in bot response */
  propertyIds?: string[]
}

export const AI_QUICK_PROMPTS = [
  'Tìm căn hộ gần tôi dưới 2,5 tỷ',
  'Hiển thị BĐS có sổ hồng',
  'Căn 2 phòng ngủ cho thuê dưới 20 triệu/tháng',
  'Nhà có hồ bơi ở Quận 7',
] as const
