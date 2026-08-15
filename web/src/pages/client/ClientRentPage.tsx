import { MarketSearch } from '@/pages/shared/MarketSearch'

export function ClientRentPage() {
  return (
    <MarketSearch
      basePath="/client"
      title="Thuê bất động sản"
      description="Tìm căn hộ, nhà phố và văn phòng cho thuê."
      showFavorite
    />
  )
}
