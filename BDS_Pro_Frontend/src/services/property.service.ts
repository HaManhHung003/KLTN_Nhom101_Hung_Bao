import { api } from './api';
import { propertyStorage } from './propertyStorage';
import type { Property, ListingStatus, PropertyType, TransactionType, LegalStatus } from '../types';

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

export const propertyService = {
  async getProperties(params?: SearchFilterParams): Promise<PaginatedProperties> {
    try {
      const res = await api.get<any, PaginatedProperties>('/properties', { params });
      const customActive = propertyStorage.getCustomProperties().filter((p) => p.status === 'active');
      const apiData = (res && res.data) ? res.data : [];
      
      const apiIds = new Set(apiData.map((p: Property) => p.id));
      const merged = [...customActive.filter((p) => !apiIds.has(p.id)), ...apiData];
      
      return {
        data: merged,
        meta: res?.meta || { page: 1, limit: 10, total: merged.length, totalPages: 1 },
      };
    } catch {
      const customActive = propertyStorage.getCustomProperties().filter((p) => p.status === 'active');
      return {
        data: customActive,
        meta: { page: 1, limit: 10, total: customActive.length, totalPages: 1 },
      };
    }
  },

  async getFeatured(limit = 8): Promise<PaginatedProperties> {
    try {
      const res = await api.get<any, PaginatedProperties>('/properties/featured', { params: { limit } });
      const customActive = propertyStorage.getCustomProperties().filter((p) => p.status === 'active');
      const apiData = (res && res.data) ? res.data : [];
      const apiIds = new Set(apiData.map((p: Property) => p.id));
      const merged = [...customActive.filter((p) => !apiIds.has(p.id)), ...apiData].slice(0, limit);
      return {
        data: merged,
        meta: { page: 1, limit, total: merged.length, totalPages: 1 },
      };
    } catch {
      const customActive = propertyStorage.getCustomProperties().filter((p) => p.status === 'active').slice(0, limit);
      return {
        data: customActive,
        meta: { page: 1, limit, total: customActive.length, totalPages: 1 },
      };
    }
  },

  async getMapProperties(params?: { lat?: number; lng?: number; radius?: number }): Promise<Property[]> {
    try {
      const res = await api.get<any, Property[]>('/properties/map', { params });
      const apiData = Array.isArray(res) ? res : (res as any)?.data || [];
      const customActive = propertyStorage.getCustomProperties().filter((p) => p.status === 'active');
      const apiIds = new Set(apiData.map((p: Property) => p.id));
      return [...customActive.filter((p) => !apiIds.has(p.id)), ...apiData];
    } catch {
      return propertyStorage.getCustomProperties().filter((p) => p.status === 'active');
    }
  },

  async getDetail(id: string): Promise<Property> {
    const customMatch = propertyStorage.getCustomProperties().find((p) => p.id === id);
    if (customMatch) return customMatch;
    return api.get<any, Property>(`/properties/${id}`);
  },

  async getMyProperties(params?: SearchFilterParams): Promise<PaginatedProperties> {
    const customs = propertyStorage.getCustomProperties();
    try {
      const res = await api.get<any, PaginatedProperties>('/properties/mine', { params });
      const apiData = (res && res.data) ? res.data : [];
      const apiIds = new Set(apiData.map((p: Property) => p.id));
      const merged = [...customs.filter((p) => !apiIds.has(p.id)), ...apiData];
      return {
        data: merged,
        meta: res?.meta || { page: 1, limit: 10, total: merged.length, totalPages: 1 },
      };
    } catch {
      return {
        data: customs,
        meta: { page: 1, limit: 10, total: customs.length, totalPages: 1 },
      };
    }
  },

  async getPendingProperties(params?: SearchFilterParams): Promise<PaginatedProperties> {
    const pendingCustoms = propertyStorage.getCustomProperties().filter((p) => p.status === 'pending');
    try {
      const res = await api.get<any, PaginatedProperties>('/properties/pending', { params });
      const apiData = (res && res.data) ? res.data : [];
      const apiIds = new Set(apiData.map((p: Property) => p.id));
      const merged = [...pendingCustoms.filter((p) => !apiIds.has(p.id)), ...apiData];
      return {
        data: merged,
        meta: res?.meta || { page: 1, limit: 10, total: merged.length, totalPages: 1 },
      };
    } catch {
      return {
        data: pendingCustoms,
        meta: { page: 1, limit: 10, total: pendingCustoms.length, totalPages: 1 },
      };
    }
  },

  async createProperty(payload: CreatePropertyPayload): Promise<Property> {
    // Always persist to local storage as pending item
    const created = propertyStorage.addCustomProperty({
      title: payload.title,
      description: payload.description,
      type: payload.type,
      transactionType: payload.transactionType,
      price: payload.price,
      area: payload.area,
      legalStatus: payload.legalStatus as LegalStatus,
      address: payload.address,
      district: payload.district,
      city: payload.city,
      latitude: payload.latitude,
      longitude: payload.longitude,
      images: payload.images,
      bedrooms: payload.bedrooms,
      bathrooms: payload.bathrooms,
      status: 'pending',
    });

    try {
      await api.post<any, Property>('/properties', payload);
    } catch {
      // Backend error fallback already handled by local persistence
    }

    return created;
  },

  async updateProperty(id: string, payload: Partial<CreatePropertyPayload>): Promise<Property> {
    return api.patch<any, Property>(`/properties/${id}`, payload);
  },

  async deleteProperty(id: string): Promise<any> {
    propertyStorage.deleteProperty(id);
    try {
      return await api.delete(`/properties/${id}`);
    } catch {
      return { success: true };
    }
  },

  async moderateProperty(id: string, status: ListingStatus, reason?: string): Promise<Property> {
    propertyStorage.updateStatus(id, status);
    try {
      return await api.post<any, Property>(`/properties/${id}/moderate`, { status, reason });
    } catch {
      return { id, status } as any;
    }
  },

  async toggleFavorite(propertyId: string): Promise<{ favorited: boolean }> {
    return api.post<any, { favorited: boolean }>(`/properties/${propertyId}/favorite`);
  },

  async getFavorites(): Promise<PaginatedProperties> {
    return api.get<any, PaginatedProperties>('/properties/favorites');
  },
};
