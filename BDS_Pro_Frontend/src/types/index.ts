export type UserRole = 'buyer' | 'agent' | 'admin'

export type PropertyType = 'apartment' | 'house' | 'land' | 'office' | 'villa'
export type TransactionType = 'sale' | 'rent'
export type LegalStatus = 'so_hong' | 'so_do' | 'hop_dong' | 'cho_so'
export type ListingStatus = 'draft' | 'pending' | 'active' | 'sold' | 'expired' | 'rejected'
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  avatar: string
  verified?: boolean
}

export interface Property {
  id: string
  title: string
  type: PropertyType
  transactionType: TransactionType
  price: number
  area: number
  legalStatus: LegalStatus
  address: string
  district: string
  city: string
  latitude: number
  longitude: number
  amenities: string[]
  images: string[]
  status: ListingStatus
  ownerId: string
  ownerName: string
  viewCount: number
  favoriteCount: number
  description: string
  bedrooms?: number
  bathrooms?: number
  createdAt: string
  aiScore?: number
  /** Đánh dấu BĐS đã được người dùng hiện tại lưu yêu thích hay chưa. */
  isFavorited?: boolean
}

export interface Appointment {
  id: string
  propertyId: string
  propertyTitle: string
  propertyImage: string
  buyerId: string
  buyerName: string
  buyerPhone?: string
  buyerEmail?: string
  agentId: string
  agentName: string
  date: string
  time: string
  status: AppointmentStatus
  note?: string
  tourType?: 'in_person' | 'video'
}

export interface Conversation {
  id: string
  participantName: string
  participantAvatar: string
  propertyTitle?: string
  lastMessage: string
  lastMessageTime: string
  unread: number
  online: boolean
}

export interface Message {
  id: string
  senderId: string
  content: string
  time: string
  isOwn: boolean
}

export interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'info' | 'success' | 'warning'
}

export interface ChartPoint {
  name: string
  value: number
  views?: number
  leads?: number
}

export interface Report {
  id: string
  reporterName: string
  propertyTitle: string
  reason: string
  status: 'pending' | 'resolved' | 'dismissed'
  createdAt: string
}

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed'

export interface Transaction {
  id: string
  propertyId: string
  propertyTitle: string
  propertyImage: string
  buyerName: string
  agentName: string
  amount: number
  method: 'vnpay' | 'momo' | 'bank'
  status: TransactionStatus
  createdAt: string
  receiptId?: string
}

export type DealStatus = 'deposit_paid' | 'in_progress' | 'completed' | 'cancelled'

/** Giao dịch BĐS đã thuê / mua / bán */
export interface UserDeal {
  id: string
  propertyId: string
  propertyTitle: string
  propertyImage: string
  transactionType: TransactionType
  dealStatus: DealStatus
  price: number
  depositAmount: number
  buyerId: string
  buyerName: string
  agentId: string
  agentName: string
  address: string
  createdAt: string
  completedAt?: string
}

export type PoiCategory = 'school' | 'hospital' | 'supermarket' | 'transport' | 'park' | 'mall'

export interface PointOfInterest {
  id: string
  name: string
  category: PoiCategory
  distance: number
  rating?: number
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  displayOrder: number
}

export interface BlogPostSummary {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  authorName: string | null
  category: {
    id: string
    name: string
    slug: string
  } | null
  status: string
  viewCount: number
  isFeatured: boolean
  publishedAt: string | null
  createdAt: string
}

export interface BlogPost extends BlogPostSummary {
  content: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: 'new' | 'read' | 'replied' | 'closed'
  adminNote?: string | null
  createdAt: string
}

export interface SiteStats {
  totalProperties: number
  totalAgents: number
  totalUsers: number
  totalTransactions: number
  totalBlogPosts: number
  totalViews: number
}
