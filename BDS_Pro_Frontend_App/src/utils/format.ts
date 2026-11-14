export function formatPrice(price: number, transactionType: 'sale' | 'rent' = 'sale'): string {
  if (!price || isNaN(price)) return 'Thương lượng';

  if (transactionType === 'rent') {
    if (price >= 1_000_000_000) {
      return `${(price / 1_000_000_000).toFixed(1).replace('.0', '')} tỷ/tháng`;
    }
    return `${(price / 1_000_000).toFixed(1).replace('.0', '')} tr/tháng`;
  }

  // Bán
  if (price >= 1_000_000_000) {
    const ty = (price / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '');
    return `${ty} tỷ`;
  }

  if (price >= 1_000_000) {
    return `${(price / 1_000_000).toFixed(0)} triệu`;
  }

  return `${price.toLocaleString('vi-VN')} đ`;
}

export function formatArea(area: number): string {
  return `${area} m²`;
}
