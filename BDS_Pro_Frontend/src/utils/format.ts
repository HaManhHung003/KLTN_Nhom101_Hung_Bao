import type { LegalStatus, ListingStatus, PropertyType, TransactionType } from '@/types'

export function formatPrice(price: number, type: TransactionType): string {
  if (type === 'rent') {
    if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(0)} tr/tháng`
    return `${price.toLocaleString('vi-VN')} đ/tháng`
  }
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)} tỷ`
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(0)} triệu`
  return `${price.toLocaleString('vi-VN')} đ`
}

/** Compact price label for map pins — e.g. $25M, $12.5B, $12k/mo */
export function formatPricePin(price: number, type: TransactionType): string {
  if (type === 'rent') {
    if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(0)}k/mo`
    return `$${Math.round(price / 1000)}k/mo`
  }
  if (price >= 1_000_000_000) {
    const b = price / 1_000_000_000
    return b >= 10 ? `$${b.toFixed(0)}B` : `$${b.toFixed(1)}B`
  }
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(0)}M`
  return `$${Math.round(price / 1000)}k`
}

export function isVerifiedLegal(status: LegalStatus): boolean {
  return status === 'so_hong' || status === 'so_do'
}

export const propertyTypeLabels: Record<PropertyType, string> = {
  apartment: 'Căn hộ',
  house: 'Nhà phố',
  land: 'Đất nền',
  office: 'Văn phòng',
  villa: 'Biệt thự',
}

export const transactionLabels: Record<TransactionType, string> = {
  sale: 'Mua bán',
  rent: 'Cho thuê',
}

export const legalLabels: Record<LegalStatus, string> = {
  so_hong: 'Sổ hồng',
  so_do: 'Sổ đỏ',
  hop_dong: 'Hợp đồng',
  cho_so: 'Chờ sổ',
}

export const statusLabels: Record<ListingStatus, string> = {
  draft: 'Nháp',
  pending: 'Chờ duyệt',
  active: 'Đang hiển thị',
  sold: 'Đã giao dịch',
  expired: 'Hết hạn',
  rejected: 'Từ chối',
}

export const statusColors: Record<ListingStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  pending: 'bg-amber-100 text-amber-700',
  active: 'bg-emerald-100 text-emerald-700',
  sold: 'bg-blue-100 text-blue-700',
  expired: 'bg-gray-100 text-gray-600',
  rejected: 'bg-red-100 text-red-700',
}
