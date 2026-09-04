import { MapView } from '@/pages/shared/MapView'

export function ClientMapPage() {
  return (
    <MapView
      basePath="/client"
      title="Tìm trên bản đồ"
      description="Bản đồ tương tác với tìm kiếm theo bán kính — từ 1km đến 10km."
      showFavorite
    />
  )
}
