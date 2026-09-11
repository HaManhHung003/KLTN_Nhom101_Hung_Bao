import { useEffect, useState } from 'react';
import { PropertyCard } from '@/components/common/PropertyCard';
import { propertyService } from '@/services/property.service';
import type { Property } from '@/types';

export function BuyerFavorites({ embedded = false }: { embedded?: boolean }) {
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    propertyService
      .getFavorites()
      .then((res) => {
        if (res && res.data) {
          setFavorites(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={embedded ? 'space-y-4' : 'space-y-6'}>
      {!embedded && (
        <div>
          <h1 className="text-2xl font-bold text-slate-900">BĐS đã lưu & Yêu thích</h1>
          <p className="text-slate-500">{favorites.length} tin đăng đã lưu thực tế từ CSDL</p>
        </div>
      )}
      {loading ? (
        <div className="p-8 text-center text-sm text-slate-500">Đang nạp danh sách BĐS đã lưu...</div>
      ) : favorites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
          Chưa có BĐS yêu thích nào. Hãy bấm biểu tượng trái tim <strong>♥</strong> trên các thẻ BĐS để lưu tin!
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((p) => (
            <PropertyCard key={p.id} property={p} isFavorite />
          ))}
        </div>
      )}
    </div>
  );
}
