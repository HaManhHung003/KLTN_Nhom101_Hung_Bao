// Utility for Geolocation, Geocoding and Radius Distance calculation

export interface Coordinates {
  lat: number;
  lng: number;
}

export const KNOWN_VIETNAM_COORDINATES: Record<string, [number, number]> = {
  'quận 1': [10.7769, 106.7009],
  'quận 2': [10.7872, 106.7499],
  'quận 3': [10.7788, 106.6872],
  'quận 4': [10.7634, 106.7047],
  'quận 5': [10.754, 106.6634],
  'quận 6': [10.7481, 106.6352],
  'quận 7': [10.734, 106.721],
  'quận 8': [10.724, 106.6286],
  'quận 9': [10.8428, 106.8287],
  'quận 10': [10.7746, 106.6669],
  'quận 11': [10.7629, 106.6504],
  'quận 12': [10.8672, 106.6413],
  'bình thạnh': [10.8106, 106.7091],
  'thủ đức': [10.8494, 106.7537],
  'gò vấp': [10.8388, 106.6653],
  'phú nhuận': [10.7992, 106.6803],
  'tân bình': [10.8015, 106.6526],
  'tân phú': [10.79, 106.628],
  'bình tân': [10.7654, 106.6038],
  'bình chánh': [10.718, 106.662],
  'nhà bè': [10.6953, 106.7324],
  'củ chi': [11.0067, 106.5132],
  'hóc môn': [10.8841, 106.5925],
  'thủ thiêm': [10.775, 106.715],
  'thảo điền': [10.803, 106.738],
  'phú mỹ hưng': [10.728, 106.719],
  'bến thành': [10.7725, 106.698],
  'hà nội': [21.0285, 105.8542],
  'đà nẵng': [16.0544, 108.2022],
  'nam từ liêm': [20.998, 105.745],
  'gia lâm': [21.012, 105.932],
  'ngũ hành sơn': [15.992, 108.238],
  'sơn trà': [16.1, 108.25],
};

/**
 * Tính khoảng cách đường chim bay giữa 2 tọa độ GPS theo công thức Haversine (km)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // làm tròn 1 chữ số thập phân (vd: 1.5 km)
}

/**
 * Tra cứu tọa độ địa chỉ (Geocoding)
 * 1. Khớp theo từ khóa khu vực/quận huyện nhanh
 * 2. Gọi OpenStreetMap Nominatim API khi cần định vị chi tiết
 */
export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number; displayName: string } | null> {
  const query = address.trim().toLowerCase();
  if (!query) return null;

  // 1. Kiểm tra từ điển tọa độ khu vực có sẵn
  for (const [name, [lat, lng]] of Object.entries(KNOWN_VIETNAM_COORDINATES)) {
    if (query.includes(name) || name.includes(query)) {
      return {
        lat,
        lng,
        displayName: address.trim(),
      };
    }
  }

  // 2. Tra cứu trực tiếp OpenStreetMap Nominatim API
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address + ', Việt Nam'
    )}&limit=1`;
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'vi,en',
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          displayName: data[0].display_name.split(',')[0] || address,
        };
      }
    }
  } catch {
    // Bỏ qua lỗi mạng
  }

  // Mặc định trung tâm TP.HCM nếu không xác định được
  return {
    lat: 10.7769,
    lng: 106.7009,
    displayName: address,
  };
}

/**
 * Tra cứu địa chỉ từ tọa độ GPS (Reverse Geocoding)
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'vi,en',
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const parts = [
          addr.suburb || addr.quarter || addr.neighbourhood || addr.road,
          addr.district || addr.city_district || addr.county || addr.town,
          addr.city || addr.state,
        ].filter(Boolean);
        if (parts.length > 0) {
          return parts.join(', ');
        }
      }
      if (data && data.display_name) {
        return data.display_name.split(',').slice(0, 3).join(', ');
      }
    }
  } catch {
    // Bỏ qua lỗi kết nối
  }

  // Khớp gần nhất từ điển khu vực nếu có
  for (const [name, [klat, klng]] of Object.entries(KNOWN_VIETNAM_COORDINATES)) {
    const dist = calculateDistanceKm(lat, lng, klat, klng);
    if (dist <= 3) {
      return `${name.toUpperCase()} (Cách bạn ~${dist}km)`;
    }
  }

  return `Tọa độ GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}


