export interface AddressSuggestionItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'district' | 'project' | 'street';
  lat?: number;
  lng?: number;
}

export const POPULAR_ADDRESS_SUGGESTIONS: AddressSuggestionItem[] = [
  // Quận / Huyện & Khu đô thị lớn
  { id: 'dist-q1', title: 'Quận 1, TP. Hồ Chí Minh', subtitle: 'Khu vực trung tâm, Phường Bến Nghé, Bến Thành, Tân Định', type: 'district', lat: 10.7769, lng: 106.7009 },
  { id: 'dist-q2', title: 'Quận 2, TP. Thủ Đức, TP.HCM', subtitle: 'KĐT Mới Thủ Thiêm, Thảo Điền, An Phú, Bình Trưng Tây', type: 'district', lat: 10.7872, lng: 106.7499 },
  { id: 'dist-q7', title: 'Quận 7, TP. Hồ Chí Minh', subtitle: 'KĐT Phú Mỹ Hưng, Tân Phong, Tân Phú, Tân Thuận', type: 'district', lat: 10.7340, lng: 106.7210 },
  { id: 'dist-bt', title: 'Quận Bình Thạnh, TP. Hồ Chí Minh', subtitle: 'Phường 22, 19, 25, 26, khu vực Tân Cảng, Landmark 81', type: 'district', lat: 10.8106, lng: 106.7091 },
  { id: 'dist-td', title: 'TP. Thủ Đức, TP. Hồ Chí Minh', subtitle: 'Khu Công nghệ cao, Làng Đại học, KĐT Vạn Phúc, Linh Xuân', type: 'district', lat: 10.8494, lng: 106.7537 },
  { id: 'dist-q3', title: 'Quận 3, TP. Hồ Chí Minh', subtitle: 'Phường Võ Thị Sáu, Cư xá Đô Thành, Hồ Con Rùa', type: 'district', lat: 10.7788, lng: 106.6872 },
  { id: 'dist-pn', title: 'Quận Phú Nhuận, TP. Hồ Chí Minh', subtitle: 'Phường 13, 2, Phan Xích Long, công viên Gia Định', type: 'district', lat: 10.7992, lng: 106.6803 },
  { id: 'dist-bc', title: 'Huyện Bình Chánh, TP. Hồ Chí Minh', subtitle: 'Xã Bình Hưng, KĐT Mizuki Park, Đại lộ Nguyễn Văn Linh', type: 'district', lat: 10.7180, lng: 106.6620 },
  { id: 'dist-hn', title: 'Quận Nam Từ Liêm, Hà Nội', subtitle: 'Khu đô thị Vinhomes Smart City, Tây Mỗ, Đại Mỗ', type: 'district', lat: 20.9980, lng: 105.7450 },
  { id: 'dist-gl', title: 'Huyện Gia Lâm, Hà Nội', subtitle: 'Khu đô thị Vinhomes Ocean Park, Đa Tốn', type: 'district', lat: 21.0120, lng: 105.9320 },
  { id: 'dist-dn', title: 'Quận Ngũ Hành Sơn, Đà Nẵng', subtitle: 'KĐT Sinh thái Nam Hòa Xuân, sông Cổ Cò, bãi tắm Non Nước', type: 'district', lat: 15.9920, lng: 108.2380 },

  // Dự án BĐS nổi tiếng
  { id: 'proj-vhc', title: 'Vinhomes Central Park (Landmark 81)', subtitle: '208 Nguyễn Hữu Cảnh, Phường 22, Bình Thạnh', type: 'project', lat: 10.7951, lng: 106.7215 },
  { id: 'proj-theriver', title: 'The River Thủ Thiêm', subtitle: 'Đại lộ Vòng Cung, KĐT Thủ Thiêm, Quận 2', type: 'project', lat: 10.7832, lng: 106.7155 },
  { id: 'proj-masteri', title: 'Masteri Thảo Điền', subtitle: '159 Xa lộ Hà Nội, Phường Thảo Điền, Quận 2', type: 'project', lat: 10.8030, lng: 106.7380 },
  { id: 'proj-sala', title: 'Khu đô thị Sala Đại Quang Minh', subtitle: 'Đường Nguyễn Cơ Thạch, Thủ Thiêm, TP. Thủ Đức', type: 'project', lat: 10.7710, lng: 106.7190 },
  { id: 'proj-chateau', title: 'Biệt thự Lâu Đài Chateau Phú Mỹ Hưng', subtitle: 'Đường Nguyễn Lương Bằng, Tân Phú, Quận 7', type: 'project', lat: 10.7250, lng: 106.7180 },
  { id: 'proj-sunave', title: 'The Sun Avenue', subtitle: '28 Mai Chí Thọ, Phường An Phú, TP. Thủ Đức', type: 'project', lat: 10.7885, lng: 106.7580 },
  { id: 'proj-mizuki', title: 'Khu đô thị Mizuki Park', subtitle: 'Nguyễn Văn Linh, Xã Bình Hưng, Huyện Bình Chánh', type: 'project', lat: 10.7180, lng: 106.6620 },
  { id: 'proj-vanphuc', title: 'Khu đô thị Vạn Phúc City', subtitle: 'Quốc lộ 13, Hiệp Bình Phước, TP. Thủ Đức', type: 'project', lat: 10.8350, lng: 106.7120 },
  { id: 'proj-vhgp', title: 'Vinhomes Grand Park (Origami, Rainbow)', subtitle: 'Đường Nguyễn Xiển, Long Thạnh Mỹ, TP. Thủ Đức', type: 'project', lat: 10.8440, lng: 106.8370 },
  { id: 'proj-ecogreen', title: 'Eco Green Saigon', subtitle: '39 Nguyễn Văn Linh, Phường Tân Thuận Tây, Quận 7', type: 'project', lat: 10.7420, lng: 106.7195 },
  { id: 'proj-diamond', title: 'Đảo Kim Cương (Diamond Island)', subtitle: 'Số 1 Đường số 104, Phường Bình Trưng Tây, Quận 2', type: 'project', lat: 10.7675, lng: 106.7450 },
  { id: 'proj-smartcity', title: 'Vinhomes Smart City Tây Mỗ', subtitle: 'Đại lộ Thăng Long, Nam Từ Liêm, Hà Nội', type: 'project', lat: 20.9980, lng: 105.7450 },

  // Tuyến đường huyết mạch & Địa danh
  { id: 'str-haibatrung', title: 'Đường Hai Bà Trưng, Quận 1', subtitle: 'Tuyến phố thương mại sầm uất Tân Định, Bến Nghé', type: 'street', lat: 10.7915, lng: 106.6908 },
  { id: 'str-nguyenthithap', title: 'Đường Nguyễn Thị Thập, Quận 7', subtitle: 'Tuyến đường kinh doanh nhộn nhịp gần Lotte Mart', type: 'street', lat: 10.7340, lng: 106.7210 },
  { id: 'str-levansy', title: 'Đường Lê Văn Sỹ, Phú Nhuận / Quận 3', subtitle: 'Tuyến phố thời trang & ẩm thực nổi tiếng', type: 'street', lat: 10.7925, lng: 106.6740 },
  { id: 'str-maichitho', title: 'Đại lộ Mai Chí Thọ, TP. Thủ Đức', subtitle: 'Trục đại lộ giao thông hiện đại kết nối Hầm Thủ Thiêm', type: 'street', lat: 10.7885, lng: 106.7580 },
  { id: 'str-xalohanoi', title: 'Xa lộ Hà Nội (Đại lộ Võ Nguyên Giáp)', subtitle: 'Tuyến Metro số 1 Bến Thành - Suối Tiên', type: 'street', lat: 10.8030, lng: 106.7380 },
  { id: 'str-bahuyen', title: 'Đường Bà Huyện Thanh Quan, Quận 3', subtitle: 'Khu biệt thự Pháp cổ, trung tâm Quận 3', type: 'street', lat: 10.7788, lng: 106.6872 },
  { id: 'str-nguyenphuoclan', title: 'Đường Nguyễn Phước Lan, KĐT Nam Hòa Xuân', subtitle: 'Đà Nẵng, trục đường chính ven sông Cổ Cò', type: 'street', lat: 15.9920, lng: 108.2380 },
];

/**
 * Tìm kiếm gợi ý địa chỉ tức thì (Fast Client-side Prefix & Substring Match + Debounced Online Geocoding)
 */
export async function getAddressSuggestions(query: string): Promise<AddressSuggestionItem[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  // 1. Khớp từ danh sách địa chỉ chuẩn hóa có sẵn
  const localMatches = POPULAR_ADDRESS_SUGGESTIONS.filter((item) => {
    const text = `${item.title} ${item.subtitle}`.toLowerCase();
    return text.includes(q);
  });

  if (localMatches.length >= 4) {
    return localMatches.slice(0, 6);
  }

  // 2. Nếu ít hơn 4 kết quả và độ dài từ khóa >= 3 ký tự: Gọi thêm OpenStreetMap Nominatim
  if (q.length >= 3) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query + ', Việt Nam'
      )}&countrycodes=vn&limit=4`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'vi,en' } });
      if (res.ok) {
        const data = await res.json();
        const onlineItems: AddressSuggestionItem[] = data.map((item: any, idx: number) => ({
          id: `osm-${idx}-${item.place_id || Date.now()}`,
          title: item.display_name.split(',')[0],
          subtitle: item.display_name.split(',').slice(1, 4).join(',').trim(),
          type: 'street',
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        }));

        // Ghép và loại bỏ trùng lặp
        const combined = [...localMatches];
        for (const o of onlineItems) {
          if (!combined.some((c) => c.title.toLowerCase() === o.title.toLowerCase())) {
            combined.push(o);
          }
        }
        return combined.slice(0, 7);
      }
    } catch {
      // Fallback
    }
  }

  return localMatches.slice(0, 6);
}

