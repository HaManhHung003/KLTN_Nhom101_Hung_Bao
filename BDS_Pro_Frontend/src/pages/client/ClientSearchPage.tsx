import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpDown, List, Map, Sparkles } from 'lucide-react';
import { PropertyCard } from '@/components/common/PropertyCard';
import { InteractiveSearchMap } from '@/components/client/InteractiveSearchMap';
import { SearchFilterBar, type SearchFilters, type SortOption } from '@/components/client/SearchFilterBar';
import { propertyService } from '@/services/property.service';
import { CLIENT_ROUTES } from '@/config/routes';
import { calculateDistanceKm, geocodeAddress } from '@/utils/location';
import { useUserLocation } from '@/context/LocationContext';
import type { AddressSuggestionItem } from '@/utils/addressSuggestions';
import type { Property, TransactionType } from '@/types';

export interface PropertyWithDistance extends Property {
  distanceKm?: number;
}

const DEFAULT_FILTERS: SearchFilters = {
  transactionType: 'sale',
  location: '',
  priceMin: 0,
  priceMax: 20_000_000_000,
  beds: 'Bất kỳ',
  baths: 'Bất kỳ',
  radius: '5',
  sortBy: 'newest',
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
  const initialQuery = searchParams.get('q') || searchParams.get('location') || '';

  const [realProperties, setRealProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // User Geolocation & Address Geocoding state from Global Location Context
  const {
    userLocation,
    userAddress,
    isLocating,
    refreshLocation,
    setCustomLocation,
  } = useUserLocation();
  const userLocationLabel = userAddress || (userLocation ? 'Vị trí hiện tại của bạn' : null);

  const [filters, setFilters] = useState<SearchFilters>({
    ...DEFAULT_FILTERS,
    location: initialQuery,
    transactionType: initialType,
    priceMax: initialType === 'rent' ? 50_000_000 : 20_000_000_000,
  });
  const [selectedId, setSelectedId] = useState<string>();
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map');

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

  // Sync initial query with geocoding
  useEffect(() => {
    const loai = searchParams.get('loai');
    const type = loaiToTransaction(loai);
    const q = searchParams.get('q') || searchParams.get('location');
    setFilters((prev) => ({
      ...prev,
      transactionType: type,
      location: q !== null && q !== undefined ? q : prev.location,
      priceMax: type === 'rent' ? 50_000_000 : 20_000_000_000,
    }));

    if (q) {
      geocodeAddress(q).then((geo) => {
        if (geo) {
          setCustomLocation({ lat: geo.lat, lng: geo.lng }, geo.displayName);
        }
      });
    }
  }, [searchParams]);

  // Khi có định vị tự động và người dùng chưa gõ từ khóa, ưu tiên sắp xếp theo khoảng cách
  useEffect(() => {
    if (userLocation && !searchParams.get('q') && !searchParams.get('location') && !filters.location) {
      if (filters.sortBy === 'newest') {
        patchFilters({ sortBy: 'distance' });
      }
    }
  }, [userLocation]);

  // Handle GPS Locate Me (Lấy lại định vị GPS của người dùng)
  const handleLocateMe = async () => {
    const coords = await refreshLocation();
    if (coords) {
      if (filters.radius === 'all') {
        patchFilters({ radius: '5', sortBy: 'distance' });
      } else {
        patchFilters({ sortBy: 'distance' });
      }
    }
  };

  // Handle Address Search Submit (Tra cứu địa chỉ trên Map)
  const handleSearchSubmit = async () => {
    const q = filters.location.trim();
    if (!q) {
      setCustomLocation(null, null);
      return;
    }

    const geo = await geocodeAddress(q);
    if (geo) {
      setCustomLocation({ lat: geo.lat, lng: geo.lng }, geo.displayName);
    }
  };

  // Handle select suggestion from autocomplete dropdown
  const handleSelectSuggestion = (item: AddressSuggestionItem) => {
    if (item.lat && item.lng) {
      setCustomLocation({ lat: item.lat, lng: item.lng }, item.title);
      if (filters.radius === 'all') {
        patchFilters({ location: item.title, radius: '5', sortBy: 'distance' });
      } else {
        patchFilters({ location: item.title, sortBy: 'distance' });
      }
    } else {
      patchFilters({ location: item.title });
      handleSearchSubmit();
    }
  };

  // Handle Clear Location
  const handleClearLocation = () => {
    setCustomLocation(null, null);
    patchFilters({ location: '', radius: 'all' });
  };

  const filtered = useMemo(() => {
    const minBeds = parseMin(filters.beds);
    const minBaths = parseMin(filters.baths);
    const q = filters.location.toLowerCase().trim();
    const radiusNum = filters.radius !== 'all' ? parseFloat(filters.radius) : null;

    const list: PropertyWithDistance[] = [];

    for (const p of realProperties) {
      if (p.status !== 'active' && p.status !== 'pending' && p.status) continue;
      if (p.transactionType !== filters.transactionType) continue;
      if (p.price < filters.priceMin || p.price > filters.priceMax) continue;
      if (minBeds > 0 && (p.bedrooms ?? 0) < minBeds) continue;
      if (minBaths > 0 && (p.bathrooms ?? 0) < minBaths) continue;

      // Tính khoảng cách từ vị trí định vị / tra cứu nếu có
      let dist: number | undefined;
      if (userLocation && p.latitude && p.longitude) {
        dist = calculateDistanceKm(userLocation.lat, userLocation.lng, p.latitude, p.longitude);
      }

      // Ràng buộc bán kính: Nếu có định vị và chọn bán kính cụ thể (1km, 3km, 5km, 10km)
      if (userLocation && radiusNum !== null && dist !== undefined) {
        if (dist > radiusNum) {
          continue; // Loại bỏ nếu nằm ngoài bán kính
        }
      } else if (!userLocation && q) {
        // Nếu không có định vị GPS, lọc theo từ khóa tiêu đề, địa chỉ, quận huyện
        const haystack = `${p.title} ${p.district || ''} ${p.city || ''} ${p.address || ''}`.toLowerCase();
        if (!haystack.includes(q)) continue;
      }

      list.push({
        ...p,
        distanceKm: dist,
      });
    }

    // Sắp xếp kết quả
    return list.sort((a, b) => {
      if (filters.sortBy === 'distance') {
        return (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999);
      }
      if (filters.sortBy === 'price-asc') return a.price - b.price;
      if (filters.sortBy === 'price-desc') return b.price - a.price;
      if (filters.sortBy === 'ai') return (b.aiScore ?? 0) - (a.aiScore ?? 0);
      // 'newest' default
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }, [realProperties, filters, userLocation]);

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
      <SearchFilterBar
        filters={filters}
        onChange={patchFilters}
        resultCount={filtered.length}
        onLocateMe={handleLocateMe}
        isLocating={isLocating}
        userLocationLabel={userLocationLabel}
        onClearLocation={handleClearLocation}
        onSearchSubmit={handleSearchSubmit}
        onSelectSuggestion={handleSelectSuggestion}
      />

      <div className="relative z-0 isolate flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Bản đồ tương tác Leaflet */}
        <div
          className={`relative z-0 isolate h-[50vh] lg:h-auto lg:w-[58%] ${
            mobileTab === 'list' ? 'hidden lg:block' : 'block'
          }`}
        >
          <InteractiveSearchMap
            properties={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
            radiusKm={filters.radius}
            userLocation={userLocation}
            userLocationLabel={userLocationLabel || undefined}
          />
        </div>

        {/* Danh sách BĐS kết quả */}
        <div
          className={`flex min-h-0 flex-1 flex-col border-l border-slate-200/80 bg-slate-50/70 lg:w-[42%] ${
            mobileTab === 'map' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Header Panel */}
          <div className="border-b border-slate-200/80 bg-white/95 px-5 py-3.5 backdrop-blur-md shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                  {filters.transactionType === 'sale' ? '🏡 Bất động sản mua bán' : '🏢 Bất động sản cho thuê'}
                </h2>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                  {filtered.length}
                </span>
              </div>

              {/* Quick Sort Dropdown */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={filters.sortBy || 'newest'}
                  onChange={(e) => patchFilters({ sortBy: e.target.value as SortOption })}
                  className="rounded-xl border border-slate-200/90 bg-slate-50 py-1.5 pl-2 pr-6 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="distance">Gần tôi nhất</option>
                  <option value="price-asc">Giá: Thấp → Cao</option>
                  <option value="price-desc">Giá: Cao → Thấp</option>
                  <option value="ai">AI đề xuất</option>
                </select>
              </div>
            </div>

            <p className="mt-1 text-xs text-slate-500 truncate">
              {userLocation
                ? `Đang sắp xếp theo khoảng cách gần "${userLocationLabel}" nhất`
                : 'Bản đồ số tương tác · Bấm vào thẻ để phóng to vị trí trên bản đồ'}
            </p>
          </div>

          {/* Listings Scroll Area */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-sm text-slate-500">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                <p className="mt-3 font-semibold text-slate-700">Đang tải danh sách BĐS...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-xs">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Chưa tìm thấy BĐS trong phạm vi {filters.radius === 'all' ? 'bộ lọc' : `${filters.radius}km`}
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Hãy thử nới rộng bán kính quét (5km hoặc 10km), hoặc bỏ bớt các tiêu chí lọc để xem thêm BĐS khác.
                </p>
                <div className="mt-5 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => patchFilters({ radius: '10' })}
                    className="rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition shadow-2xs cursor-pointer"
                  >
                    Mở rộng 10km
                  </button>
                  <button
                    type="button"
                    onClick={() => patchFilters({ radius: 'all', location: '' })}
                    className="rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition shadow-2xs cursor-pointer"
                  >
                    Xem tất cả BĐS
                  </button>
                </div>
              </div>
            ) : (
              filtered.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`group relative cursor-pointer rounded-2xl transition-all duration-200 ${
                    selectedId === p.id
                      ? 'ring-2 ring-emerald-500 ring-offset-2 shadow-md'
                      : 'hover:shadow-md'
                  }`}
                >
                  {/* Distance badge if available */}
                  {p.distanceKm !== undefined && (
                    <div className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-teal-600/90 to-emerald-600/90 px-3 py-1 text-[11px] font-extrabold text-white shadow-md backdrop-blur-md">
                      <span>📍 Cách {p.distanceKm} km</span>
                    </div>
                  )}
                  <PropertyCard
                    property={p}
                    detailPath={CLIENT_ROUTES.property(p.id)}
                    isFavorite={!!p.isFavorited}
                    carousel
                    compact
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mobile Floating Map / List Toggle Button */}
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileTab(mobileTab === 'map' ? 'list' : 'map')}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900/95 text-white px-5 py-2.5 text-xs font-bold shadow-2xl backdrop-blur-lg hover:scale-105 active:scale-95 transition cursor-pointer ring-2 ring-white/20"
          >
            {mobileTab === 'map' ? (
              <>
                <List className="h-4 w-4 text-emerald-400" />
                <span>Xem danh sách ({filtered.length})</span>
              </>
            ) : (
              <>
                <Map className="h-4 w-4 text-emerald-400" />
                <span>Xem bản đồ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
