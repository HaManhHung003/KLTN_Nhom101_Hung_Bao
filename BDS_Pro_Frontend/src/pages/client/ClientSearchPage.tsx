import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PropertyCard } from '@/components/common/PropertyCard';
import { InteractiveSearchMap } from '@/components/client/InteractiveSearchMap';
import { SearchFilterBar, type SearchFilters } from '@/components/client/SearchFilterBar';
import { propertyService } from '@/services/property.service';
import { CLIENT_ROUTES } from '@/config/routes';
import type { Property, TransactionType } from '@/types';

const DEFAULT_FILTERS: SearchFilters = {
  transactionType: 'sale',
  location: '',
  priceMin: 0,
  priceMax: 20_000_000_000,
  beds: 'Bất kỳ',
  baths: 'Bất kỳ',
  radius: '3',
};

function parseMin(value: string): number {
  if (value === 'Bất kỳ') return 0;
  return parseInt(value, 10);
}

function loaiToTransaction(loai: string | null): TransactionType {
  if (loai === 'thue') return 'rent';
  return 'sale';
}

function transactionToLoai(type: TransactionType): string {
  return type === 'rent' ? 'thue' : 'mua';
}

export function ClientSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = loaiToTransaction(searchParams.get('loai'));

  const [realProperties, setRealProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<SearchFilters>({
    ...DEFAULT_FILTERS,
    transactionType: initialType,
    priceMax: initialType === 'rent' ? 50_000_000 : 20_000_000_000,
  });
  const [selectedId, setSelectedId] = useState<string>();
  const [favorites, setFavorites] = useState<string[]>([]);

  // Fetch real properties from NestJS API
  useEffect(() => {
    setLoading(true);
    propertyService
      .getProperties({ limit: 100 })
      .then((res) => {
        if (res && res.data) {
          setRealProperties(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const loai = searchParams.get('loai');
    const type = loaiToTransaction(loai);
    setFilters((prev) => ({
      ...prev,
      transactionType: type,
      priceMax: type === 'rent' ? 50_000_000 : 20_000_000_000,
    }));
  }, [searchParams]);

  const filtered = useMemo(() => {
    const minBeds = parseMin(filters.beds);
    const minBaths = parseMin(filters.baths);
    const q = filters.location.toLowerCase().trim();

    return realProperties.filter((p) => {
      if (p.status !== 'active' && p.status !== 'pending' && p.status) return false;
      if (p.transactionType !== filters.transactionType) return false;
      if (p.price < filters.priceMin || p.price > filters.priceMax) return false;
      if (minBeds > 0 && (p.bedrooms ?? 0) < minBeds) return false;
      if (minBaths > 0 && (p.bathrooms ?? 0) < minBaths) return false;
      if (q) {
        const haystack = `${p.title} ${p.district || ''} ${p.city || ''} ${p.address || ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [realProperties, filters]);

  async function toggleFavorite(id: string) {
    try {
      await propertyService.toggleFavorite(id);
      setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    } catch {
      setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    }
  }

  function patchFilters(patch: Partial<SearchFilters>) {
    setFilters((prev) => {
      const next = { ...prev, ...patch };
      if (patch.transactionType) {
        next.priceMax = patch.transactionType === 'rent' ? 50_000_000 : 20_000_000_000;
        const params = new URLSearchParams(searchParams);
        params.set('loai', transactionToLoai(patch.transactionType));
        setSearchParams(params, { replace: true });
      }
      return next;
    });
  }

  return (
    <div className="-mx-4 -mt-4 flex min-h-[calc(100vh-8rem)] flex-col sm:-mx-6 md:-mt-8 md:min-h-[calc(100vh-4rem)]">
      <SearchFilterBar filters={filters} onChange={patchFilters} resultCount={filtered.length} />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="h-[40vh] lg:h-auto lg:w-[60%]">
          <InteractiveSearchMap
            properties={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
            radiusKm={filters.radius}
          />
        </div>

        <div className="flex min-h-0 flex-col border-l border-slate-200 bg-slate-50 lg:w-[40%]">
          <div className="border-b border-slate-200 bg-white px-4 py-3">
            <h2 className="font-semibold text-slate-900">
              {filters.transactionType === 'sale' ? 'BĐS bán' : 'BĐS cho thuê'} ({filtered.length})
            </h2>
            <p className="text-xs text-slate-500">Bản đồ thực tế Leaflet + OpenStreetMap · Chọn ghim để xem chi tiết</p>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {loading ? (
              <div className="p-8 text-center text-sm text-slate-500">Đang nạp dữ liệu BĐS từ hệ thống...</div>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                Không có BĐS phù hợp bộ lọc. Hãy thử thay đổi loại BĐS hoặc điều chỉnh khoảng giá.
              </div>
            ) : (
              filtered.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`cursor-pointer rounded-xl transition ${
                    selectedId === p.id ? 'ring-2 ring-emerald-500 ring-offset-2' : ''
                  }`}
                >
                  <PropertyCard
                    property={p}
                    detailPath={CLIENT_ROUTES.property(p.id)}
                    isFavorite={favorites.includes(p.id)}
                    onToggleFavorite={() => toggleFavorite(p.id)}
                    carousel
                    compact
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
