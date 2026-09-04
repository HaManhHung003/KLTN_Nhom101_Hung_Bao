import type {
  Appointment,
  ChartPoint,
  Conversation,
  Message,
  Notification,
  PointOfInterest,
  Property,
  Report,
  User,
  UserDeal,
} from '@/types';
import type {
  AuditLogEntry,
  DailyListingPoint,
  ModerationQueueItem,
  TransactionVolumePoint,
} from '@/types/admin';
import type { ChatMessage, ChatThread } from '@/types/chat';

export const currentUsers: Record<string, User> = {
  buyer: {
    id: 'u1',
    name: 'Nguyễn Minh Anh',
    email: 'minhanh@gmail.com',
    phone: '0901234567',
    role: 'buyer',
    avatar: 'https://i.pravatar.cc/150?u=buyer1',
  },
  agent: {
    id: 'u2',
    name: 'Trần Văn Bảo',
    email: 'vanbao@bdspro.vn',
    phone: '0912345678',
    role: 'agent',
    avatar: 'https://i.pravatar.cc/150?u=agent1',
    verified: true,
  },
  admin: {
    id: 'u3',
    name: 'Lê Thị Hương',
    email: 'admin@bdspro.vn',
    phone: '0923456789',
    role: 'admin',
    avatar: 'https://i.pravatar.cc/150?u=admin1',
  },
};

// Dữ liệu trống rỗng 100% — Tất cả được nạp trực tiếp từ CSDL MySQL & API Backend
export const properties: Property[] = [];
export const userDeals: UserDeal[] = [];
export const appointments: Appointment[] = [];
export const favoriteIds: string[] = [];
export const moderationQueue: ModerationQueueItem[] = [];
export const transactions: any[] = [];
export const reports: Report[] = [];
export const buyerNotifications: Notification[] = [];
export const agentNotifications: Notification[] = [];
export const adminNotifications: Notification[] = [];
export const chatThreads: ChatThread[] = [];
export const threadMessages: Record<string, ChatMessage[]> = {};
export const conversations: Conversation[] = [];
export const monitoredChats: any[] = [];
export const pendingListings: any[] = [];
export const propertyPOIs: Record<string, PointOfInterest[]> = {};
export const defaultPOIs: PointOfInterest[] = [];
export const bookingTimeSlots: string[] = ['09:00', '10:30', '14:00', '15:30', '17:00'];
export const chatbotMessages: any[] = [];
export const chatMessages: Message[] = [];
export const aiChatSession: any[] = [];
export const adminAuditLogs: AuditLogEntry[] = [];
export const adminStats = {
  totalUsers: 0,
  totalProperties: 0,
  totalListings: 0,
  pendingProperties: 0,
  pendingModeration: 0,
  totalReports: 0,
  totalTransactions: 0,
};
export const agentStats = {
  myPropertiesCount: 0,
  pendingCount: 0,
  viewCountTotal: 0,
  dealsCompletedCount: 0,
  totalViews: 0,
  totalLeads: 0,
  conversionRate: '0%',
  activeListings: 0,
};
export const agentChartData: ChartPoint[] = [];
export const adminChartData: ChartPoint[] = [];
export const adminDailyListingsChart: DailyListingPoint[] = [];
export const adminTransactionVolumeChart: TransactionVolumePoint[] = [];
export const adminUsers: any[] = [];
