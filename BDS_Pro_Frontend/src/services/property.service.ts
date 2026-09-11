import { api } from './api';
import type { Property, ListingStatus, PropertyType, TransactionType, PoiCategory } from '../types';

export interface SearchFilterParams {
  page?: number;
  limit?: number;
  type?: PropertyType;
  transactionType?: TransactionType;
  status?: ListingStatus;
  city?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  q?: string;
  sort?: string;
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

/** Điểm tiện ích lân cận trả về từ backend. */
export interface NearbyPoi {
  id: string;
  name: string;
  category: PoiCategory;
  rating?: number;
  latitude: number;
  longitude: number;
  distance: number;
}

export interface CreatePropertyPayload {
  title: string;
  type: PropertyType;
  transactionType: TransactionType;
  price: number;
  area: number;
  legalStatus: string;
  address: string;
  district: string;
  city: string;
  latitude: number;
  longitude: number;
  amenities?: string[];
  images?: string[];
  description: string;
  bedrooms?: number;
  bathrooms?: number;
  asDraft?: boolean;
}

const EMPTY_PAGE: PaginatedProperties = {
  data: [],
  meta: { page: 1, limit: 12, total: 0, totalPages: 0 },
};

function normalizePaginated(res: any): PaginatedProperties {
  if (!res) return EMPTY_PAGE;
  if (Array.isArray(res)) {
    return { data: res, meta: { page: 1, limit: res.length, total: res.length, totalPages: 1 } };
  }
  if (Array.isArray(res.data)) {
    return {
      data: res.data,
      meta: res.meta || { page: 1, limit: res.data.length, total: res.data.length, totalPages: 1 },
    };
  }
  return EMPTY_PAGE;
}

export const propertyService = {
  /** Danh sách BĐS công khai (chỉ active) — trang chủ, tìm kiếm. */
  async getProperties(params?: SearchFilterParams): Promise<PaginatedProperties> {
    try {
      const res = await api.get('/properties', { params });
      return normalizePaginated(res);
    } catch {
      return EMPTY_PAGE;
    }
  },

  /** Tin nổi bật cho banner trang chủ. */
  async getFeatured(limit = 8): Promise<PaginatedProperties> {
    try {
      const res = await api.get('/properties/featured', { params: { limit } });
      return normalizePaginated(res);
    } catch {
      return EMPTY_PAGE;
    }
  },

  /** Tìm kiếm BĐS theo bản đồ / bán kính. */
  async getMapProperties(params?: { lat?: number; lng?: number; radius?: number }): Promise<Property[]> {
    try {
      const res = await api.get<any, any>('/properties/map', { params });
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      return [];
    } catch {
      return [];
    }
  },

  /** Chi tiết một tin đăng. */
  async getDetail(id: string): Promise<Property> {
    return api.get<any, Property>(`/properties/${id}`);
  },

  /** Danh sách điểm tiện ích lân cận (POI) của một BĐS. */
  async getPois(id: string): Promise<NearbyPoi[]> {
    try {
      const res = await api.get<any, any>(`/properties/${id}/pois`);
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      return [];
    } catch {
      return [];
    }
  },

  /** Bật/tắt yêu thích (cần đăng nhập). */
  async toggleFavoriteApi(propertyId: string): Promise<{ favorited: boolean }> {
    return api.post<any, { favorited: boolean }>(`/properties/${propertyId}/favorite`);
  },

  async toggleFavorite(propertyId: string): Promise<{ favorited: boolean }> {
    return this.toggleFavoriteApi(propertyId);
  },

  /** Gửi báo cáo vi phạm (cần đăng nhập). */
  async reportProperty(propertyId: string, reason: string): Promise<void> {
    await api.post('/admin/reports', { propertyId, reason });
  },

  /** Tin đăng của môi giới đang đăng nhập (mọi trạng thái: draft, pending, active...). */
  async getMyProperties(params?: SearchFilterParams): Promise<PaginatedProperties> {
    try {
      const res = await api.get('/properties/mine', { params });
      return normalizePaginated(res);
    } catch {
      return EMPTY_PAGE;
    }
  },

  /** Tin chờ duyệt — chỉ admin truy cập được. */
  async getPendingProperties(params?: SearchFilterParams): Promise<PaginatedProperties> {
    try {
      const res = await api.get('/properties/pending', { params });
      return normalizePaginated(res);
    } catch {
      return EMPTY_PAGE;
    }
  },

  /** Tạo tin đăng mới — gửi thẳng lên API backend. */
  async createProperty(payload: CreatePropertyPayload): Promise<Property> {
    const res = await api.post<any, Property>('/properties', payload);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bdspro_property_updated'));
    }
    return res;
  },

  /** Cập nhật tin đăng. */
  async updateProperty(id: string, payload: Partial<CreatePropertyPayload>): Promise<Property> {
    const res = await api.patch<any, Property>(`/properties/${id}`, payload);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bdspro_property_updated'));
    }
    return res;
  },

  /** Gửi tin nháp đi kiểm duyệt. */
  async submitProperty(id: string): Promise<Property> {
    const res = await api.post<any, Property>(`/properties/${id}/submit`);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bdspro_property_updated'));
    }
    return res;
  },

  /** Xóa tin đăng. */
  async deleteProperty(id: string): Promise<any> {
    const res = await api.delete(`/properties/${id}`);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bdspro_property_updated'));
    }
    return res;
  },

  /** Duyệt / từ chối tin (admin). */
  async moderateProperty(id: string, status: ListingStatus, reason?: string): Promise<Property> {
    const res = await api.post<any, Property>(`/properties/${id}/moderate`, { status, reason });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bdspro_property_updated'));
    }
    return res;
  },

  /** Lấy danh sách tin yêu thích của người dùng. */
  async getFavorites(): Promise<PaginatedProperties> {
    try {
      const res = await api.get('/properties/favorites');
      return normalizePaginated(res);
    } catch {
      return EMPTY_PAGE;
    }
  },
};
