import { MarketSearch } from '@/pages/shared/MarketSearch'

export function ClientBuyPage() {
  return (
    <MarketSearch
      basePath="/client"
      title="Mua bất động sản"
      description="Duyệt tin rao bán — lọc theo giá, loại hình, pháp lý và khu vực."
      showFavorite
    />
  )
}
