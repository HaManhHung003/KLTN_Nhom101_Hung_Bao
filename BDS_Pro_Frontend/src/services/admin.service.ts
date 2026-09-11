import { api } from './api';
import { propertyStorage } from './propertyStorage';

export interface DashboardMetrics {
  totalUsers: number;
  totalProperties: number;
  pendingProperties: number;
  totalReports: number;
}

export const adminService = {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      return await api.get<any, DashboardMetrics>('/admin/dashboard/metrics');
    } catch {
      const customs = propertyStorage.getCustomProperties();
      return {
        totalUsers: 15,
        totalProperties: 45 + customs.length,
        pendingProperties: customs.filter((p) => p.status === 'pending').length,
        totalReports: 2,
      };
    }
  },

  async approveProperty(id: string): Promise<any> {
    propertyStorage.updateStatus(id, 'active');
    try {
      return await api.patch(`/properties/${id}/approve`);
    } catch {
      return { success: true };
    }
  },

  async rejectProperty(id: string, reason?: string): Promise<any> {
    propertyStorage.updateStatus(id, 'rejected');
    try {
      return await api.patch(`/properties/${id}/reject`, { reason });
    } catch {
      return { success: true };
    }
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
