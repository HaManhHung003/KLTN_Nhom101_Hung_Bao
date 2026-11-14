import { api } from './api';
import type { DealStatus, PaymentMethod, PaymentStatus, TransactionType } from '@/types';

export interface DepositPayload {
  propertyId: string;
  agentId?: string;
  amount: number;
  method?: 'vnpay' | 'momo' | 'bank' | 'bank_transfer';
  buyerName?: string;
  buyerPhone?: string;
  note?: string;
}

export interface DepositResponse {
  success: boolean;
  message: string;
  receiptId: string;
  transaction: any;
  deal: any;
  property: {
    id: string;
    title: string;
    price: number;
    address: string;
    image: string | null;
  };
}

export interface LiveDeal {
  id: string;
  propertyId: string;
  buyerId: string;
  agentId: string;
  transactionType: TransactionType;
  dealStatus: DealStatus;
  price: number;
  depositAmount: number;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    title: string;
    price: number;
    area: number;
    address: string;
    district: string;
    city: string;
    media?: Array<{ url: string }>;
  };
  buyer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  agent?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export interface LiveTransaction {
  id: string;
  propertyId: string;
  buyerId: string;
  agentId?: string | null;
  buyerName?: string | null;
  buyerPhone?: string | null;
  amount: number;
  method: PaymentMethod | string;
  status: PaymentStatus;
  receiptId?: string | null;
  note?: string | null;
  createdAt: string;
  property?: {
    id: string;
    title: string;
    address: string;
    district?: string;
    city?: string;
    media?: Array<{ url: string }>;
  };
  buyer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  agent?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export const transactionService = {
  /** Đặt cọc giữ chỗ qua tài khoản ký quỹ sàn BDS Pro (Escrow) */
  async createDeposit(payload: DepositPayload): Promise<DepositResponse> {
    const res = await api.post('/transactions/deposit', payload);
    return res.data;
  },

  /** Khởi tạo thông tin & mã QR đặt cọc qua Ví MoMo */
  async createMomoPayment(payload: DepositPayload) {
    const res = await api.post('/transactions/momo/create', payload);
    return res.data;
  },

  /** Lấy danh sách thương vụ của người dùng hiện tại */
  async getMyDeals(params?: { status?: string; page?: number; limit?: number }) {
    const res = await api.get('/transactions/deals', { params });
    return res.data;
  },

  /** Cập nhật trạng thái thương vụ (đặt cọc -> đang xử lý -> hoàn tất) */
  async updateDealStatus(id: string, dealStatus: DealStatus) {
    const res = await api.patch(`/transactions/deals/${id}/status`, { dealStatus });
    return res.data;
  },

  /** Lấy lịch sử giao dịch thanh toán / đặt cọc của tôi */
  async getMyPayments(): Promise<LiveTransaction[]> {
    const res = await api.get('/transactions/payments');
    return res.data;
  },

  /** Admin: Lấy toàn bộ giao dịch đặt cọc & thanh toán trên sàn */
  async getAdminPayments(): Promise<LiveTransaction[]> {
    const res = await api.get('/transactions/admin/all');
    return res.data;
  },

  /** Admin: Xử lý ký quỹ Escrow (giải ngân cho môi giới hoặc hoàn cọc cho khách) */
  async handleEscrowAction(id: string, action: 'payout' | 'refund', reason?: string) {
    const res = await api.patch(`/transactions/admin/${id}/escrow-action`, { action, reason });
    return res.data;
  },
};

