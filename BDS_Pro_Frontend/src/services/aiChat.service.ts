import type { Property } from '@/types';
import { propertyService } from '@/services/property.service';
import { calculateDistanceKm } from '@/utils/location';
import { formatPrice } from '@/utils/format';

export interface PropertyWithDistance extends Property {
  distanceKm?: number;
}

export interface AiResponseResult {
  reply: string;
  matchedProperties: PropertyWithDistance[];
  detectedLocationIntent?: boolean;
  needsLocationPermission?: boolean;
}

function parsePriceConstraint(lower: string): { maxPrice?: number; label?: string } {
  // 2,5 tỷ / 2.5 tỷ / 2 tỷ 5
  const commaRegex = /(\d+)[,\.](\d+)\s*tỷ/;
  if (commaRegex.test(lower)) {
    const m = lower.match(commaRegex);
    if (m) {
      const val = parseFloat(`${m[1]}.${m[2]}`);
      return { maxPrice: val * 1_000_000_000, label: `dưới ${val} tỷ` };
    }
  }

  const tyRegex = /(\d+)\s*tỷ\s*(\d+)/;
  if (tyRegex.test(lower)) {
    const m = lower.match(tyRegex);
    if (m) {
      const val = parseFloat(`${m[1]}.${m[2]}`);
      return { maxPrice: val * 1_000_000_000, label: `dưới ${val} tỷ` };
    }
  }

  const singleTy = /(?:dưới|<|tam|tầm)?\s*(\d+)\s*tỷ/;
  if (singleTy.test(lower)) {
    const m = lower.match(singleTy);
    if (m) {
      const val = parseFloat(m[1]);
      return { maxPrice: val * 1_000_000_000, label: `dưới ${val} tỷ` };
    }
  }

  const trRegex = /(?:dưới|<|tam|tầm)?\s*(\d+)\s*(?:tr|triệu)/;
  if (trRegex.test(lower)) {
    const m = lower.match(trRegex);
    if (m) {
      const val = parseFloat(m[1]);
      return { maxPrice: val * 1_000_000, label: `dưới ${val} triệu/tháng` };
    }
  }

  return {};
}

export class AiChatEngine {
  private static cachedProperties: Property[] = [];
  private static lastFetch = 0;

  static async getRealProperties(): Promise<Property[]> {
    const now = Date.now();
    // Cache for 30s
    if (this.cachedProperties.length > 0 && now - this.lastFetch < 30_000) {
      return this.cachedProperties;
    }

    try {
      const res = await propertyService.getProperties({ limit: 100 });
      if (res && res.data && res.data.length > 0) {
        this.cachedProperties = res.data;
        this.lastFetch = now;
        return this.cachedProperties;
      }
    } catch {
      // Fallback
    }
    return this.cachedProperties;
  }

  static async generateReply(
    userPrompt: string,
    userCoords?: { lat: number; lng: number } | null
  ): Promise<AiResponseResult> {
    const raw = userPrompt.trim();
    const lower = raw.toLowerCase();
    const allProps = await this.getRealProperties();

    let matched: PropertyWithDistance[] = allProps
      .filter((p) => p.status === 'active' || !p.status)
      .map((p) => ({ ...p }));
    let reply = '';

    // 0. Nhận diện ý định tìm kiếm theo định vị "gần tôi", "quanh đây"
    const isNearMe =
      lower.includes('gần tôi') ||
      lower.includes('gần đây') ||
      lower.includes('quanh đây') ||
      lower.includes('quanh tôi') ||
      lower.includes('gần nhất') ||
      lower.includes('bán kính') ||
      lower.includes('xung quanh');

    if (isNearMe) {
      if (!userCoords) {
        // Chưa có quyền hoặc chưa bật GPS
        return {
          reply:
            '📍 **Tôi đã nhận diện bạn muốn tìm BĐS gần vị trí của mình!**\n\n' +
            'Để AI quét và tính toán khoảng cách km chính xác nhất quanh bạn, vui lòng bấm vào nút **🎯 "Bật định vị GPS"** bên cạnh khung nhập tin nhắn để chia sẻ tọa độ hiện tại nhé!',
          matchedProperties: matched.slice(0, 3),
          detectedLocationIntent: true,
          needsLocationPermission: true,
        };
      }

      // Đã có tọa độ người dùng -> Tính khoảng cách km tới tất cả BĐS
      matched.forEach((p) => {
        if (p.latitude && p.longitude) {
          p.distanceKm = calculateDistanceKm(userCoords.lat, userCoords.lng, p.latitude, p.longitude);
        } else {
          p.distanceKm = 999;
        }
      });

      // Lọc theo loại hình nếu có
      const isApartment = lower.includes('căn hộ') || lower.includes('chung cư');
      const isHouse = lower.includes('nhà') || lower.includes('nhà phố');
      const isRent = lower.includes('thuê') || lower.includes('cho thuê') || lower.includes('rent');

      if (isApartment) {
        const apts = matched.filter(
          (p) => p.type === 'apartment' || p.title.toLowerCase().includes('căn hộ')
        );
        if (apts.length > 0) matched = apts;
      } else if (isHouse) {
        const houses = matched.filter(
          (p) => p.type === 'house' || p.title.toLowerCase().includes('nhà')
        );
        if (houses.length > 0) matched = houses;
      }

      if (isRent) {
        const rents = matched.filter((p) => p.transactionType === 'rent');
        if (rents.length > 0) matched = rents;
      }

      // Lọc theo giá
      const priceFilter = parsePriceConstraint(lower);
      let matchedInPrice = matched;
      if (priceFilter.maxPrice) {
        matchedInPrice = matched.filter((p) => p.price <= priceFilter.maxPrice!);
      }

      // Sắp xếp theo khoảng cách tăng dần (gần nhất lên đầu)
      matchedInPrice.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));

      const typeLabel = isApartment ? 'căn hộ' : isHouse ? 'nhà phố' : 'bất động sản';
      const priceLabel = priceFilter.label ? ` có mức giá ${priceFilter.label}` : '';

      if (matchedInPrice.length > 0) {
        const topResults = matchedInPrice.slice(0, 4);
        reply =
          `🎯 **Kết quả định vị GPS gần bạn:**\n` +
          `Dựa trên vị trí hiện tại của bạn tại tọa độ **[${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}]**, tôi đã quét các **${typeLabel}**${priceLabel} và sắp xếp theo khoảng cách gần bạn nhất:\n\n` +
          topResults
            .map(
              (p, idx) =>
                `${idx + 1}. **${p.title}**\n` +
                `   📍 Khoảng cách: **${p.distanceKm} km** từ vị trí của bạn\n` +
                `   💰 Mức giá: **${formatPrice(p.price, p.transactionType)}** (${p.district || p.city})`
            )
            .join('\n\n') +
          `\n\n👉 Bạn có thể nhấp trực tiếp vào các thẻ BĐS bên dưới để xem hình ảnh và vị trí bản đồ chi tiết!`;

        return {
          reply,
          matchedProperties: topResults,
          detectedLocationIntent: true,
        };
      } else {
        // Nếu không có căn nào thỏa mãn đúng mức giá trong tầm gần, tìm các căn gần nhất
        matched.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
        const nearest = matched.slice(0, 3);
        reply =
          `🎯 **Phân tích định vị GPS:**\n` +
          `Dựa trên tọa độ của bạn **[${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}]**, trong bán kính gần hiện chưa có ${typeLabel} nào${priceLabel}.\n\n` +
          `Tuy nhiên, tôi đã tìm thấy các ${typeLabel} có vị trí gần bạn nhất sau đây rất đáng cân nhắc:\n\n` +
          nearest
            .map(
              (p, idx) =>
                `${idx + 1}. **${p.title}**\n` +
                `   📍 Khoảng cách: **${p.distanceKm} km** từ bạn\n` +
                `   💰 Mức giá: **${formatPrice(p.price, p.transactionType)}**`
            )
            .join('\n\n') +
          `\n\nBạn có muốn mở rộng bán kính tìm kiếm thêm không?`;

        return {
          reply,
          matchedProperties: nearest,
          detectedLocationIntent: true,
        };
      }
    }

    // 1. Chào hỏi / Hỏi thăm
    if (
      lower === 'hi' ||
      lower === 'hello' ||
      lower === 'alo' ||
      lower.includes('xin chào') ||
      lower.includes('chào bạn') ||
      lower.includes('bạn là ai')
    ) {
      reply =
        'Xin chào quý khách! Tôi là Trợ lý AI BĐS Pro 🤖.\nTôi có thể hỗ trợ bạn:\n• Tìm kiếm BĐS **gần bạn nhất** theo định vị GPS thực tế\n• Lọc BĐS theo mức giá (ví dụ: "căn hộ gần tôi dưới 2,5 tỷ")\n• Thẩm định và tư vấn pháp lý sổ hồng, sổ đỏ\n• Ước tính hạn mức & lãi suất vay ngân hàng\n\nBạn đang có nhu cầu tìm BĐS ở khu vực nào hoặc mức giá bao nhiêu?';
      return { reply, matchedProperties: matched.slice(0, 3) };
    }

    // 2. Pháp lý, Sổ đỏ, Sổ hồng
    if (
      lower.includes('sổ hồng') ||
      lower.includes('sổ đỏ') ||
      lower.includes('pháp lý') ||
      lower.includes('so hong') ||
      lower.includes('so do') ||
      lower.includes('sang tên') ||
      lower.includes('công chứng')
    ) {
      reply =
        '📋 **Tư vấn pháp lý BĐS Pro:**\n' +
        '• Toàn bộ BĐS được gắn nhãn "Đã thẩm định" trên hệ thống đều có Sổ hồng riêng hoặc Sổ đỏ sở hữu lâu dài.\n' +
        '• **Quy trình chuyển nhượng an toàn 4 bước:** Đặt cọc giữ chỗ → Thẩm định hồ sơ tại VP Công chứng → Ký HĐMB & thanh toán → Nộp hồ sơ đăng bộ trước bạ tại Văn phòng Đăng ký đất đai.\n' +
        '• Dưới đây là các bất động sản có pháp lý sổ hồng hoàn chỉnh, sẵn sàng giao dịch ngay:';

      const legalMatched = matched
        .filter((p) => p.legalStatus?.toLowerCase().includes('sổ'))
        .slice(0, 3);
      return {
        reply,
        matchedProperties: legalMatched.length > 0 ? legalMatched : matched.slice(0, 3),
      };
    }

    // 3. Vay vốn & Ngân hàng
    if (
      lower.includes('vay') ||
      lower.includes('ngân hàng') ||
      lower.includes('lãi suất') ||
      lower.includes('trả góp') ||
      lower.includes('tai chinh')
    ) {
      reply =
        '🏦 **Tư vấn gói vay mua nhà ưu đãi 2026:**\n' +
        '• **Hạn mức tài trợ:** Tối đa 70% – 80% giá trị thẩm định tài sản.\n' +
        '• **Lãi suất ưu đãi:** Dao động từ 6.5% – 8.2%/năm trong 12–24 tháng đầu.\n' +
        '• **Thời hạn vay:** Lên tới 25 – 35 năm, giúp giảm áp lực dòng tiền hàng tháng.\n' +
        '• Dưới đây là các BĐS đang có chính sách hỗ trợ vay và liên kết ngân hàng tốt nhất:';

      const loanMatched = matched.filter((p) => p.transactionType === 'sale').slice(0, 3);
      return {
        reply,
        matchedProperties: loanMatched.length > 0 ? loanMatched : matched.slice(0, 3),
      };
    }

    // 4. Cho thuê / Mua bán
    const isRent =
      lower.includes('thuê') ||
      lower.includes('cho thuê') ||
      lower.includes('thue') ||
      lower.includes('rent');

    if (isRent) {
      matched = matched.filter((p) => p.transactionType === 'rent');
    } else if (lower.includes('mua') || lower.includes('bán') || lower.includes('sale')) {
      matched = matched.filter((p) => p.transactionType === 'sale');
    }

    // 5. Giá tiền
    const priceFilter = parsePriceConstraint(lower);
    if (priceFilter.maxPrice) {
      const byPrice = matched.filter((p) => p.price <= priceFilter.maxPrice!);
      if (byPrice.length > 0) matched = byPrice;
    }

    // 6. Khu vực / Địa danh
    const districts = [
      'quận 1', 'quận 2', 'quận 3', 'quận 7', 'quận 9', 'quận 10',
      'bình thạnh', 'thủ đức', 'tân bình', 'gò vấp', 'phú nhuận', 'hà nội', 'đà nẵng'
    ];
    let foundDistrict = '';
    for (const d of districts) {
      if (lower.includes(d)) {
        foundDistrict = d;
        break;
      }
    }

    if (foundDistrict) {
      const byDist = matched.filter((p) => {
        const text = `${p.district || ''} ${p.address || ''} ${p.city || ''} ${p.title || ''}`.toLowerCase();
        return text.includes(foundDistrict);
      });
      if (byDist.length > 0) matched = byDist;
    }

    // 7. Loại BĐS
    if (lower.includes('căn hộ') || lower.includes('chung cư')) {
      const byCat = matched.filter(
        (p) =>
          p.type?.toLowerCase().includes('căn') ||
          p.title?.toLowerCase().includes('căn hộ') ||
          p.title?.toLowerCase().includes('chung cư')
      );
      if (byCat.length > 0) matched = byCat;
    } else if (lower.includes('nhà phố') || lower.includes('nhà riêng')) {
      const byCat = matched.filter(
        (p) =>
          p.type?.toLowerCase().includes('nhà') ||
          p.title?.toLowerCase().includes('nhà phố')
      );
      if (byCat.length > 0) matched = byCat;
    }

    matched = matched.slice(0, 3);
    if (matched.length === 0) matched = allProps.slice(0, 3);

    if (isRent) {
      reply = `Tôi đã tìm kiếm các bất động sản **cho thuê** phù hợp với yêu cầu "${raw}". Dưới đây là các căn hộ / nhà phố đang sẵn sàng bàn giao với mức giá tốt nhất:`;
    } else if (foundDistrict) {
      reply = `Hệ thống AI đã quét dữ liệu khu vực **${foundDistrict.toUpperCase()}** theo tiêu chí của bạn. Dưới đây là các bất động sản nổi bật có vị trí đắc địa và pháp lý minh bạch:`;
    } else {
      reply = `Dựa trên yêu cầu "${raw}", AI BDS Pro đã phân tích cơ sở dữ liệu và tuyển chọn các bất động sản phù hợp nhất sau đây:`;
    }

    return {
      reply,
      matchedProperties: matched,
    };
  }
}
