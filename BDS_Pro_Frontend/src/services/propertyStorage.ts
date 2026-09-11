import type { Property, ListingStatus, LegalStatus } from '@/types';

const STORAGE_KEY = 'bdspro_custom_properties';
const STORAGE_VERSION_KEY = 'bdspro_custom_properties_version';
const CURRENT_VERSION = '2'; // Tăng khi thay đổi seed để ép cập nhật dữ liệu mẫu

// Default initial mock properties if empty
const INITIAL_DEMO_PROPERTIES: Property[] = [
  {
    id: 'prop-demo-101',
    title: 'Căn hộ 2PN Vinhomes Central Park view Landmark 81',
    description: 'Nội thất sang trọng đầy đủ, ban công thoáng mát, tiện ích đẳng cấp 5 sao. Phù hợp gia đình trẻ và chuyên gia.',
    type: 'apartment',
    transactionType: 'sale',
    price: 4800000000,
    area: 75,
    city: 'TP. Hồ Chí Minh',
    district: 'Bình Thạnh',
    address: '208 Nguyễn Hữu Cảnh, Phường 22, Bình Thạnh, TP. Hồ Chí Minh',
    latitude: 10.7935,
    longitude: 106.7214,
    status: 'active',
    viewCount: 1240,
    favoriteCount: 89,
    amenities: ['Ban công', 'Hồ bơi', 'Gym', 'Bãi đỗ xe ô tô', 'Siêu thị'],
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
    legalStatus: 'so_hong',
    bedrooms: 2,
    bathrooms: 2,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    ownerId: 'agent-1',
    ownerName: 'Trần Văn Bảo',
  },
  {
    id: 'prop-demo-102',
    title: 'Nhà phố 4 tầng mặt tiền Nguyễn Thị Thập, Quận 7',
    description: 'Nhà phố kinh doanh, mặt tiền 5m, thiết kế hiện đại, phù hợp văn phòng hoặc ở kết hợp kinh doanh.',
    type: 'house',
    transactionType: 'sale',
    price: 12500000000,
    area: 120,
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 7',
    address: '45 Nguyễn Thị Thập, Quận 7, TP. Hồ Chí Minh',
    latitude: 10.734,
    longitude: 106.721,
    status: 'active',
    viewCount: 856,
    favoriteCount: 45,
    amenities: ['Mặt tiền kinh doanh', 'Gần Lotte Mart', 'Bệnh viện FV'],
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
    legalStatus: 'so_hong',
    bedrooms: 4,
    bathrooms: 3,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    ownerId: 'agent-1',
    ownerName: 'Trần Văn Bảo',
  },
  {
    id: 'prop-demo-103',
    title: 'Studio Masteri Thảo Điền – Full nội thất gần Metro',
    description: 'Studio hiện đại, phù hợp expat và chuyên gia trẻ, gần tuyến Metro số 1 và trung tâm thành phố.',
    type: 'apartment',
    transactionType: 'rent',
    price: 12000000,
    area: 45,
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 2',
    address: '159 Xa lộ Hà Nội, Thảo Điền, TP. Hồ Chí Minh',
    latitude: 10.803,
    longitude: 106.738,
    status: 'active',
    viewCount: 945,
    favoriteCount: 67,
    amenities: ['Tuyến Metro số 1', 'Hồ bơi', 'Gym'],
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
    legalStatus: 'so_do',
    bedrooms: 1,
    bathrooms: 1,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    ownerId: 'agent-1',
    ownerName: 'Trần Văn Bảo',
  },
  {
    id: 'prop-demo-104',
    title: 'Văn phòng cho thuê Landmark 81 – 150m² view panorama',
    description: 'Văn phòng hạng A, view toàn cảnh thành phố, nội thất sẵn sàng vào làm việc ngay.',
    type: 'office',
    transactionType: 'rent',
    price: 85000000,
    area: 150,
    city: 'TP. Hồ Chí Minh',
    district: 'Bình Thạnh',
    address: 'Landmark 81, Vinhomes Central Park, TP. Hồ Chí Minh',
    latitude: 10.7955,
    longitude: 106.722,
    status: 'active',
    viewCount: 678,
    favoriteCount: 34,
    amenities: ['Văn phòng hạng A', 'View panorama', 'Bãi đỗ xe'],
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'],
    legalStatus: 'hop_dong',
    bedrooms: 0,
    bathrooms: 2,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    ownerId: 'agent-1',
    ownerName: 'Trần Văn Bảo',
  },
  {
    id: 'prop-demo-105',
    title: 'Đất nền dự án Aqua City – Sổ hồng riêng',
    description: 'Lô đất view sông, hạ tầng hoàn thiện, thanh khoản tốt, phù hợp đầu tư dài hạn.',
    type: 'land',
    transactionType: 'sale',
    price: 3200000000,
    area: 100,
    city: 'Long An',
    district: 'Long An',
    address: 'Khu A, Aqua City, Long An',
    latitude: 10.654,
    longitude: 106.512,
    status: 'active',
    viewCount: 432,
    favoriteCount: 28,
    amenities: ['View sông', 'Hạ tầng hoàn thiện'],
    images: ['https://images.unsplash.com/photo-1500382017468-904fc875a87f?w=800', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800'],
    legalStatus: 'so_hong',
    bedrooms: 0,
    bathrooms: 0,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    ownerId: 'agent-2',
    ownerName: 'Phạm Đức Hùng',
  },
  {
    id: 'prop-demo-106',
    title: 'Căn hộ Vinhomes Grand Park – 3PN view công viên',
    description: 'Căn hộ 3 phòng ngủ rộng rãi, view công viên trung tâm Grand Park, tiện ích đẳng cấp resort.',
    type: 'apartment',
    transactionType: 'sale',
    price: 6500000000,
    area: 105,
    city: 'TP. Hồ Chí Minh',
    district: 'Thủ Đức',
    address: 'Nguyễn Xiển, Long Thạnh Mỹ, Thủ Đức, TP. Hồ Chí Minh',
    latitude: 10.8435,
    longitude: 106.8312,
    status: 'active',
    viewCount: 1580,
    favoriteCount: 102,
    amenities: ['View công viên', 'Hồ bơi resort', 'Gym', 'Trường học quốc tế'],
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
    legalStatus: 'so_hong',
    bedrooms: 3,
    bathrooms: 2,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    ownerId: 'agent-1',
    ownerName: 'Trần Văn Bảo',
  },
];

export const propertyStorage = {
  getCustomProperties(): Property[] {
    try {
      const version = localStorage.getItem(STORAGE_VERSION_KEY);
      const data = localStorage.getItem(STORAGE_KEY);
      // Reset cache khi version thay đổi (hoặc chưa có data)
      if (version !== CURRENT_VERSION || !data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_PROPERTIES));
        localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
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
