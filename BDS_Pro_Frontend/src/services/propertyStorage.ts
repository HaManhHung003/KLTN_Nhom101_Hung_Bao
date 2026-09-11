import type { Property, ListingStatus, LegalStatus } from '@/types';

const STORAGE_KEY = 'bdspro_custom_properties';

// Default initial mock properties if empty
const INITIAL_DEMO_PROPERTIES: Property[] = [
  {
    id: 'prop-demo-101',
    title: 'Căn hộ 2PN Vinhomes Central Park view Landmark 81',
    description: 'Nội thất sang trọng đầy đủ, ban công thoáng mát, tiện ích đẳng cấp 5 sao.',
    type: 'apartment',
    transactionType: 'sale',
    price: 4800000000,
    area: 75,
    city: 'TP. Hồ Chí Minh',
    district: 'Bình Thạnh',
    address: '208 Nguyễn Hữu Cảnh, Phường 22, Bình Thạnh, TP. Hồ Chí Minh',
    latitude: 10.7935,
    longitude: 106.7214,
    status: 'pending', // Chờ kiểm duyệt
    viewCount: 12,
    favoriteCount: 3,
    amenities: ['Ban công', 'Hồ bơi', 'Gym'],
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
    legalStatus: 'so_hong',
    bedrooms: 2,
    bathrooms: 2,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    ownerId: 'agent-1',
    ownerName: 'Môi giới Nguyễn Văn Nam',
  },
];

export const propertyStorage = {
  getCustomProperties(): Property[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_PROPERTIES));
        return INITIAL_DEMO_PROPERTIES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_DEMO_PROPERTIES;
    }
  },

  addCustomProperty(prop: Partial<Property>): Property {
    const properties = this.getCustomProperties();
    const newProp: Property = {
      id: prop.id || `prop-custom-${Date.now()}`,
      title: prop.title || 'Bất động sản mới',
      description: prop.description || 'Mô tả bất động sản',
      type: prop.type || 'apartment',
      transactionType: prop.transactionType || 'sale',
      price: prop.price || 1000000000,
      area: prop.area || 50,
      city: prop.city || 'TP. Hồ Chí Minh',
      district: prop.district || 'Quận 1',
      address: prop.address || 'Quận 1, TP. Hồ Chí Minh',
      latitude: prop.latitude || 10.7769,
      longitude: prop.longitude || 106.7009,
      status: (prop.status as ListingStatus) || 'pending',
      viewCount: 0,
      favoriteCount: 0,
      amenities: prop.amenities || [],
      images: prop.images && prop.images.length > 0 ? prop.images : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
      legalStatus: (prop.legalStatus as LegalStatus) || 'so_hong',
      bedrooms: prop.bedrooms || 1,
      bathrooms: prop.bathrooms || 1,
      createdAt: prop.createdAt || new Date().toISOString(),
      ownerId: prop.ownerId || 'agent-current',
      ownerName: prop.ownerName || 'Môi giới của tôi',
    };

    properties.unshift(newProp);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
    window.dispatchEvent(new Event('bdspro_property_updated'));
    return newProp;
  },

  updateStatus(id: string, status: ListingStatus): boolean {
    const properties = this.getCustomProperties();
    const target = properties.find((p) => p.id === id);
    if (target) {
      target.status = status;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
      window.dispatchEvent(new Event('bdspro_property_updated'));
      return true;
    }
    return false;
  },

  deleteProperty(id: string): void {
    const properties = this.getCustomProperties();
    const filtered = properties.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('bdspro_property_updated'));
  },
};
