import { PropertyCard } from '@/components/common/PropertyCard'
import { favoriteIds, properties } from '@/data/mockData'

export function BuyerFavorites({ embedded = false }: { embedded?: boolean }) {
  const favorites = properties.filter((p) => favoriteIds.includes(p.id))

  return (
    <div className={embedded ? 'space-y-4' : 'space-y-6'}>
      {!embedded && (
        <div>
          <h1 className="text-2xl font-bold text-slate-900">BĐS yêu thích</h1>
          <p className="text-slate-500">{favorites.length} tin đã lưu</p>
        </div>
      )}
      {favorites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
          Chưa có BĐS yêu thích. Hãy khám phá và lưu tin phù hợp!
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((p) => (
            <PropertyCard key={p.id} property={p} isFavorite />
          ))}
        </div>
      )}
    </div>
  )
}
