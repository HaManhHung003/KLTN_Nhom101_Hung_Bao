import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart, LogIn } from 'lucide-react';
import { PropertyCard } from '@/components/common/PropertyCard';
import { propertyService } from '@/services/property.service';
import { useAuth } from '@/context/AuthContext';
import type { Property } from '@/types';

export function BuyerFavorites({ embedded = false }: { embedded?: boolean }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(() => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    propertyService
      .getFavorites()
      .then((res) => {
        if (res && res.data) {
          setFavorites(res.data);
        } else {
          setFavorites([]);
        }
      })
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Lắng nghe sự kiện lưu/bỏ lưu từ bất kỳ đâu trên hệ thống
  useEffect(() => {
    const handleFavUpdated = (e: any) => {
      if (e.detail) {
        const { propertyId, favorited } = e.detail;
        if (!favorited) {
          setFavorites((prev) => prev.filter((p) => p.id !== propertyId));
        } else {
          fetchFavorites();
        }
      }
    };
    window.addEventListener('bdspro_favorites_updated', handleFavUpdated as EventListener);
    return () => window.removeEventListener('bdspro_favorites_updated', handleFavUpdated as EventListener);
  }, [fetchFavorites]);

  const handleRemove = async (propertyId: string) => {
    try {
      await propertyService.toggleFavoriteApi(propertyId);
      setFavorites((prev) => prev.filter((p) => p.id !== propertyId));
      window.dispatchEvent(
        new CustomEvent('bdspro_favorites_updated', {
          detail: { propertyId, favorited: false },
        })
      );
    } catch (err) {
      console.error('Lỗi bỏ lưu tin:', err);
    }
  };

  // Nếu chưa đăng nhập
  if (!user) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 mb-4">
          <Heart className="h-7 w-7 fill-rose-500 text-rose-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Đăng nhập để xem danh sách BĐS đã lưu</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          Hãy đăng nhập để lưu trữ các bất động sản bạn đang quan tâm và dễ dàng xem lại bất cứ lúc nào.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition"
        >
          <LogIn className="h-4 w-4" />
          <span>Đăng nhập ngay</span>
        </Link>
      </div>
    );
  }

  return (
    <div className={embedded ? 'space-y-4' : 'space-y-6'}>
      {!embedded && (
        <div>
          <h1 className="text-2xl font-bold text-slate-900">BĐS đã lưu & Yêu thích</h1>
          <p className="text-slate-500">{favorites.length} tin đăng đã lưu thực tế từ CSDL</p>
        </div>
      )}
      {loading ? (
        <div className="p-12 text-center text-sm text-slate-500">Đang nạp danh sách BĐS đã lưu...</div>
      ) : favorites.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
          <Heart className="mx-auto h-8 w-8 text-slate-300 mb-2" />
          Chưa có BĐS yêu thích nào. Hãy bấm biểu tượng trái tim <span className="text-red-500 font-bold">♥</span> trên các thẻ BĐS để lưu tin!
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              isFavorite
              onToggleFavorite={() => handleRemove(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
