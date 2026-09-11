import { api } from './api';
import type { Property, User } from '../types';

export interface DashboardMetrics {
  totalUsers: number;
  totalProperties: number;
  pendingProperties: number;
  totalReports: number;
}

export interface PaginatedUsers {
  data: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedProperties {
  data: Property[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function normalizePaginatedUsers(res: any): PaginatedUsers {
  if (!res) return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  if (Array.isArray(res)) {
    return { data: res, meta: { page: 1, limit: res.length, total: res.length, totalPages: 1 } };
  }
  if (Array.isArray(res.data)) {
    return {
      data: res.data,
      meta: res.meta || { page: 1, limit: res.data.length, total: res.data.length, totalPages: 1 },
    };
  }
  return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } };
}

function normalizePaginatedProperties(res: any): PaginatedProperties {
  if (!res) return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  if (Array.isArray(res)) {
    return { data: res, meta: { page: 1, limit: res.length, total: res.length, totalPages: 1 } };
  }
  if (Array.isArray(res.data)) {
    return {
      data: res.data,
      meta: res.meta || { page: 1, limit: res.data.length, total: res.data.length, totalPages: 1 },
    };
  }
  return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } };
}

export const adminService = {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    return api.get<any, DashboardMetrics>('/admin/dashboard/metrics');
  },

  /** Danh sách người dùng hệ thống (có lọc theo role: agent, buyer, admin, tìm kiếm q). */
  async getUsers(params?: { role?: string; q?: string; page?: number; limit?: number }): Promise<PaginatedUsers> {
    try {
      const res = await api.get('/users', { params });
      return normalizePaginatedUsers(res);
    } catch {
      return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    }
  },

  /** Cập nhật thông tin / trạng thái user (khóa/mở khóa active, xác minh verified, đổi role). */
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return api.patch(`/users/${id}`, data);
  },

  /** Xóa tài khoản người dùng. */
  async deleteUser(id: string): Promise<any> {
    return api.delete(`/users/${id}`);
  },

  /** Toàn bộ danh sách bài đăng BĐS hệ thống (mọi trạng thái, có lọc theo ownerId môi giới). */
  async getAllProperties(params?: any): Promise<PaginatedProperties> {
    try {
      const res = await api.get('/properties/all', { params });
      return normalizePaginatedProperties(res);
    } catch {
      return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    }
  },

  /** Lấy toàn bộ bài đăng của một môi giới cụ thể. */
  async getPropertiesByBroker(brokerId: string): Promise<Property[]> {
    try {
      const res = await api.get('/properties/all', { params: { ownerId: brokerId, limit: 100 } });
      const paginated = normalizePaginatedProperties(res);
      return paginated.data;
    } catch {
      return [];
    }
  },

  /** Duyệt tin đăng */
  async approveProperty(id: string): Promise<any> {
    const res = await api.post(`/properties/${id}/moderate`, { status: 'active' });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bdspro_property_updated'));
    }
    return res;
  },

  /** Từ chối duyệt tin */
  async rejectProperty(id: string, reason?: string): Promise<any> {
    const res = await api.post(`/properties/${id}/moderate`, { status: 'rejected', reason });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bdspro_property_updated'));
    }
    return res;
  },

  /** Thay đổi trạng thái bất kỳ của tin đăng (active, pending, rejected, sold, expired). */
  async setPropertyStatus(id: string, status: string, reason?: string): Promise<any> {
    const res = await api.post(`/properties/${id}/moderate`, { status, reason });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bdspro_property_updated'));
    }
    return res;
  },

  /** Xóa vĩnh viễn một tin đăng */
  async deleteProperty(id: string): Promise<any> {
    const res = await api.delete(`/properties/${id}`);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bdspro_property_updated'));
    }
    return res;
  },

  async getReports(params?: { page?: number; limit?: number }): Promise<any> {
    return api.get('/admin/reports', { params });
  },

  async moderateReport(id: string, status: 'resolved' | 'dismissed'): Promise<any> {
    return api.patch(`/admin/reports/${id}`, { status });
  },

  async getAuditLogs(params?: { page?: number; limit?: number; action?: string }): Promise<any> {
    return api.get('/admin/logs', { params });
  },
};
