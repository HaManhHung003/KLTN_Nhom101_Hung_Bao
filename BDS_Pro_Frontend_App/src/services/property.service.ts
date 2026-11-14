import api from './api';
import { Property } from '../types';

export const FALLBACK_PROPERTIES: Property[] = [
  {
    id: 'p1',
    title: 'Căn hộ Landmark 81 Vinhomes Central Park view sông Sài Gòn',
    type: 'apartment',
    transactionType: 'sale',
    price: 6800000000,
    area: 82,
    bedrooms: 2,
    bathrooms: 2,
    address: '720A Điện Biên Phủ, Phường 22',
    district: 'Bình Thạnh',
    city: 'Hồ Chí Minh',
    latitude: 10.7951,
    longitude: 106.7219,
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Căn hộ tầng cao Landmark 81 view trọn sông Sài Gòn và công viên 14ha. Đầy đủ nội thất cao cấp nhập khẩu châu Âu.',
    legalStatus: 'so_hong',
    ownerName: 'Cao Văn Bảo',
  },
  {
    id: 'p2',
    title: 'Penthouse The River Thủ Thiêm trực diện sông & Landmark',
    type: 'apartment',
    transactionType: 'sale',
    price: 28500000000,
    area: 215,
    bedrooms: 4,
    bathrooms: 4,
    address: 'Khu chức năng số 1, Đô thị mới Thủ Thiêm',
    district: 'TP. Thủ Đức',
    city: 'Hồ Chí Minh',
    latitude: 10.7872,
    longitude: 106.7165,
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Tuyệt phẩm Penthouse The River Thủ Thiêm với thang máy riêng, hồ bơi tràn bờ trên không.',
    legalStatus: 'so_hong',
    ownerName: 'Mạnh Hưng',
  },
  {
    id: 'p3',
    title: 'Biệt thự Đơn lập KĐT Vạn Phúc City ven sông Sài Gòn',
    type: 'villa',
    transactionType: 'sale',
    price: 42000000000,
    area: 320,
    bedrooms: 5,
    bathrooms: 6,
    address: 'Quốc Lộ 13, Phường Hiệp Bình Phước',
    district: 'TP. Thủ Đức',
    city: 'Hồ Chí Minh',
    latitude: 10.8443,
    longitude: 106.7092,
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Biệt thự đơn lập kiến trúc Tân cổ điển, bến du thuyền riêng, công viên ven sông 3.4km.',
    legalStatus: 'so_do',
    ownerName: 'Văn Bảo',
  },
  {
    id: 'p4',
    title: 'Căn hộ Masteri Thảo Điền 2PN full nội thất cao cấp',
    type: 'apartment',
    transactionType: 'rent',
    price: 18000000,
    area: 69,
    bedrooms: 2,
    bathrooms: 2,
    address: '159 Xa Lộ Hà Nội, Thảo Điền',
    district: 'TP. Thủ Đức',
    city: 'Hồ Chí Minh',
    latitude: 10.8016,
    longitude: 106.7412,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Cho thuê căn hộ Masteri Thảo Điền kết nối trực tiếp ga Metro số 7. Tiện ích hồ bơi, gym, Vincom Mega Mall.',
    legalStatus: 'so_hong',
    ownerName: 'Trần Thị Mai',
  },
  {
    id: 'p5',
    title: 'Căn hộ The Origami Vinhomes Grand Park view vườn Nhật',
    type: 'apartment',
    transactionType: 'sale',
    price: 2450000000,
    area: 59,
    bedrooms: 2,
    bathrooms: 1,
    address: 'Đường Nguyễn Xiển, Phường Long Thạnh Mỹ',
    district: 'TP. Thủ Đức',
    city: 'Hồ Chí Minh',
    latitude: 10.8436,
    longitude: 106.8409,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Căn hộ phong cách Nhật Bản Origami view trọn hồ cá Koi và cầu gỗ đỏ. Tiện ích đại đô thị 271ha.',
    legalStatus: 'so_hong',
    ownerName: 'Cao Văn Bảo',
  },
  {
    id: 'p6',
    title: 'Nhà phố thương mại Shophouse Mizuki Park Nam Long',
    type: 'house',
    transactionType: 'sale',
    price: 9800000000,
    area: 120,
    bedrooms: 4,
    bathrooms: 4,
    address: 'Nguyễn Văn Linh, Bình Hưng',
    district: 'Bình Chánh',
    city: 'Hồ Chí Minh',
    latitude: 10.7208,
    longitude: 106.6669,
    images: [
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Shophouse trục đường chính khu đô thị kênh đào Mizuki Park. Vừa ở vừa kinh doanh sinh lời cao.',
    legalStatus: 'so_hong',
    ownerName: 'Lê Hoàng Nam',
  },
];

export const propertyService = {
  async getProperties(): Promise<Property[]> {
    try {
      const res = await api.get('/properties?limit=50');
      const items = res.data?.data || res.data?.items || res.data;
      if (Array.isArray(items) && items.length > 0) {
        return items.map((item: any) => ({
          id: item.id,
          title: item.title,
          type: item.type || 'apartment',
          transactionType: item.transactionType || 'sale',
          price: Number(item.price),
          area: Number(item.area),
          address: item.address,
          district: item.district || '',
          city: item.city || '',
          latitude: Number(item.latitude) || 10.7769,
          longitude: Number(item.longitude) || 106.7009,
          images: Array.isArray(item.images) && item.images.length > 0
            ? item.images
            : (item.media?.map((m: any) => m.url) || [
                'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
              ]),
          bedrooms: item.bedrooms,
          bathrooms: item.bathrooms,
          description: item.description || '',
          legalStatus: item.legalStatus,
          ownerName: item.ownerName || item.owner?.name || 'Chủ sở hữu',
        }));
      }
    } catch (e) {
      console.log('Mobile app connecting fallback properties', e);
    }
    return FALLBACK_PROPERTIES;
  },

  // Tính khoảng cách Haversine giữa 2 tọa độ GPS (km)
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Bán kính trái đất km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  },

  // Đồng bộ Yêu thích (Favorite) trực tiếp với Backend Database
  async toggleFavorite(propertyId: string): Promise<boolean> {
    try {
      const res = await api.post(`/properties/${propertyId}/favorite`);
      return res.data?.favorited ?? true;
    } catch (e) {
      return true;
    }
  },

  async getFavorites(): Promise<string[]> {
    try {
      const res = await api.get('/properties/favorites');
      const items = res.data?.data || res.data?.items || res.data;
      if (Array.isArray(items)) {
        return items.map((i: any) => i.id || i.propertyId);
      }
    } catch (e) {
      // ignore
    }
    return ['p1', 'p2'];
  },
};
