import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUpDown,
  Bath,
  BedDouble,
  Building2,
  Check,
  ChevronDown,
  DollarSign,
  Loader2,
  MapPin,
  Navigation,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import type { TransactionType } from '@/types';
import {
  getAddressSuggestions,
  type AddressSuggestionItem,
} from '@/utils/addressSuggestions';

export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'ai' | 'distance';

export interface SearchFilters {
  transactionType: TransactionType;
  location: string;
  priceMin: number;
  priceMax: number;
  beds: string;
  baths: string;
  radius: string;
  sortBy?: SortOption;
}

interface SearchFilterBarProps {
  filters: SearchFilters;
  onChange: (patch: Partial<SearchFilters>) => void;
  resultCount: number;
  onLocateMe?: () => void;
  isLocating?: boolean;
  userLocationLabel?: string | null;
  onClearLocation?: () => void;
  onSearchSubmit?: () => void;
  onSelectSuggestion?: (item: AddressSuggestionItem) => void;
}

const RADIUS_OPTIONS = [
  { value: '1', label: '1 km' },
  { value: '3', label: '3 km' },
  { value: '5', label: '5 km' },
  { value: '10', label: '10 km' },
  { value: 'all', label: 'Tất cả' },
] as const;

const BED_OPTIONS = ['Bất kỳ', '1+', '2+', '3+', '4+'];
const BATH_OPTIONS = ['Bất kỳ', '1+', '2+', '3+'];

const SALE_PRICE_PRESETS = [
  { label: 'Tất cả mức giá', min: 0, max: 20_000_000_000 },
  { label: 'Dưới 2 tỷ', min: 0, max: 2_000_000_000 },
  { label: '2 – 5 tỷ', min: 2_000_000_000, max: 5_000_000_000 },
  { label: '5 – 10 tỷ', min: 5_000_000_000, max: 10_000_000_000 },
  { label: 'Trên 10 tỷ', min: 10_000_000_000, max: 50_000_000_000 },
];

const RENT_PRICE_PRESETS = [
  { label: 'Tất cả mức giá', min: 0, max: 50_000_000 },
  { label: 'Dưới 5 tr/tháng', min: 0, max: 5_000_000 },
  { label: '5 – 15 tr/tháng', min: 5_000_000, max: 15_000_000 },
  { label: '15 – 30 tr/tháng', min: 15_000_000, max: 30_000_000 },
  { label: 'Trên 30 tr/tháng', min: 30_000_000, max: 100_000_000 },
];

export function SearchFilterBar({
  filters,
  onChange,
  resultCount,
  onLocateMe,
  isLocating = false,
  userLocationLabel,
  onClearLocation,
  onSearchSubmit,
  onSelectSuggestion,
}: SearchFilterBarProps) {
  const [searchInput, setSearchInput] = useState(filters.location);
  const [suggestions, setSuggestions] = useState<AddressSuggestionItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPricePopover, setShowPricePopover] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const pricePopoverRef = useRef<HTMLDivElement>(null);
  const moreFiltersRef = useRef<HTMLDivElement>(null);

  // Sync prop changes into local input
  useEffect(() => {
    setSearchInput(filters.location);
  }, [filters.location]);

  // Click outside to close popovers and dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setShowDropdown(false);
      }
      if (pricePopoverRef.current && !pricePopoverRef.current.contains(target)) {
        setShowPricePopover(false);
      }
      if (moreFiltersRef.current && !moreFiltersRef.current.contains(target)) {
        setShowMoreFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions as user types
  const handleInputChange = (val: string) => {
    setSearchInput(val);
    if (!val.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    getAddressSuggestions(val).then((items) => {
      setSuggestions(items);
      setShowDropdown(items.length > 0);
    });
  };

  const handleSelect = (item: AddressSuggestionItem) => {
    setSearchInput(item.title);
    setShowDropdown(false);
    onChange({ location: item.title });

    if (onSelectSuggestion) {
      onSelectSuggestion(item);
    } else if (onSearchSubmit) {
      onSearchSubmit();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowDropdown(false);
    setShowPricePopover(false);
    setShowMoreFilters(false);
    onChange({ location: searchInput });
    if (onSearchSubmit) onSearchSubmit();
  };

  const isRent = filters.transactionType === 'rent';
  const presets = isRent ? RENT_PRICE_PRESETS : SALE_PRICE_PRESETS;

  // Format short price tag
  const formatShortPrice = () => {
    if (filters.priceMin === 0 && filters.priceMax >= (isRent ? 50_000_000 : 20_000_000_000)) {
      return 'Mọi mức giá';
    }
    if (isRent) {
      return `${(filters.priceMin / 1_000_000).toFixed(0)} – ${(filters.priceMax / 1_000_000).toFixed(0)} tr`;
    }
    return `${(filters.priceMin / 1_000_000_000).toFixed(1)} – ${(filters.priceMax / 1_000_000_000).toFixed(1)} tỷ`;
  };

  const hasAdvancedFilters = filters.beds !== 'Bất kỳ' || filters.baths !== 'Bất kỳ' || (filters.sortBy && filters.sortBy !== 'newest');

  return (
    <div className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-xs backdrop-blur-xl transition-all">
      {/* ── ROW 1: PRIMARY SEARCH & FILTERS BAR ── */}
      <div className="flex flex-wrap items-center gap-2.5 px-4 py-2.5 sm:px-6">
        {/* 1. Mua / Thuê Segmented Pill Switcher */}
        <div className="flex shrink-0 items-center rounded-2xl bg-slate-100/90 p-1 ring-1 ring-slate-900/5 shadow-inner">
          <button
            type="button"
            onClick={() => onChange({ transactionType: 'sale' })}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              filters.transactionType === 'sale'
                ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-slate-900/5'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🏡 Mua BĐS</span>
          </button>
          <button
            type="button"
            onClick={() => onChange({ transactionType: 'rent' })}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              filters.transactionType === 'rent'
                ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-slate-900/5'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🏢 Cho thuê</span>
          </button>
        </div>

        {/* 2. Hero Location Search Input with Autocomplete */}
        <div ref={containerRef} className="relative z-50 min-w-[260px] flex-1">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
            <input
              type="text"
              value={searchInput}
              onFocus={() => {
                if (searchInput.trim()) {
                  getAddressSuggestions(searchInput).then((items) => {
                    setSuggestions(items);
                    setShowDropdown(items.length > 0);
                  });
                }
              }}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Nhập quận, tên đường, dự án (Vinhomes, Sala, Masteri...)"
              className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/70 py-2.5 pl-10 pr-28 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 shadow-xs"
            />

            {/* Quick Clear Button */}
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSuggestions([]);
                  setShowDropdown(false);
                  onChange({ location: '' });
                }}
                className="absolute right-24 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                title="Xóa tìm kiếm"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Quick GPS Geolocation Button with Pulsing Status */}
            <button
              type="button"
              onClick={() => {
                if (onLocateMe) onLocateMe();
              }}
              disabled={isLocating}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200/70 transition shadow-xs cursor-pointer disabled:opacity-50"
              title="Định vị GPS vị trí của bạn"
            >
              {isLocating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
              ) : (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
              <span>{isLocating ? 'Đang dò...' : 'Vị trí tôi'}</span>
            </button>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute left-0 top-full z-[100] mt-1.5 w-full min-w-[320px] max-w-lg max-h-80 overflow-y-auto rounded-3xl border border-slate-200/80 bg-white/98 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Gợi ý địa chỉ &amp; BĐS nổi bật</span>
                <span className="text-[10px] font-normal text-slate-400">Nhấp để xem trên bản đồ</span>
              </div>
              <div className="divide-y divide-slate-100">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-emerald-50/70 cursor-pointer group"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition">
                      {item.type === 'district' ? (
                        <Building2 className="h-4 w-4" />
                      ) : item.type === 'project' ? (
                        <Sparkles className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Navigation className="h-4 w-4 text-teal-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-800">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Chọn →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Price Filter Pill Popover */}
        <div ref={pricePopoverRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowPricePopover(!showPricePopover)}
            className={`inline-flex items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
              showPricePopover || filters.priceMin > 0 || filters.priceMax < (isRent ? 50_000_000 : 20_000_000_000)
                ? 'border-emerald-500 bg-emerald-50/80 text-emerald-800 ring-2 ring-emerald-500/20'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <span>{formatShortPrice()}</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showPricePopover ? 'rotate-180' : ''}`} />
          </button>

          {/* Price Popover Menu */}
          {showPricePopover && (
            <div className="absolute left-0 top-full z-[100] mt-1.5 w-72 rounded-3xl border border-slate-200/90 bg-white p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-1">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Khoảng giá phù hợp</span>
                <span className="text-[11px] font-bold text-emerald-600">{formatShortPrice()}</span>
              </div>

              {/* Presets Grid */}
              <div className="space-y-1.5">
                {presets.map((p) => {
                  const active = filters.priceMin === p.min && filters.priceMax === p.max;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        onChange({ priceMin: p.min, priceMax: p.max });
                        setShowPricePopover(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                        active
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{p.label}</span>
                      {active && <Check className="h-3.5 w-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 4. Radius Filter Chips (Bán kính quét) */}
        <div className="hidden lg:flex shrink-0 items-center rounded-2xl bg-slate-100/80 p-1 ring-1 ring-slate-900/5">
          <span className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Bán kính:
          </span>
          {RADIUS_OPTIONS.map((r) => {
            const active = filters.radius === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => onChange({ radius: r.value })}
                className={`rounded-xl px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {/* 5. More Filters Button (Phòng ngủ, Phòng tắm, Sắp xếp) */}
        <div ref={moreFiltersRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className={`inline-flex items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
              showMoreFilters || hasAdvancedFilters
                ? 'border-emerald-500 bg-emerald-50/80 text-emerald-800 ring-2 ring-emerald-500/20'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
            <span>Bộ lọc</span>
            {hasAdvancedFilters && (
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            )}
          </button>

          {/* More Filters Popover */}
          {showMoreFilters && (
            <div className="absolute right-0 top-full z-[100] mt-1.5 w-80 rounded-3xl border border-slate-200/90 bg-white p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-1 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Tùy chỉnh nâng cao
                </span>
                {hasAdvancedFilters && (
                  <button
                    type="button"
                    onClick={() => onChange({ beds: 'Bất kỳ', baths: 'Bất kỳ', sortBy: 'newest' })}
                    className="text-[11px] font-bold text-red-500 hover:underline"
                  >
                    Đặt lại
                  </button>
                )}
              </div>

              {/* Bedrooms */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <BedDouble className="h-3.5 w-3.5 text-emerald-600" /> Số phòng ngủ
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {BED_OPTIONS.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => onChange({ beds: o })}
                      className={`rounded-xl py-1.5 text-xs font-bold transition cursor-pointer ${
                        filters.beds === o
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bathrooms */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Bath className="h-3.5 w-3.5 text-teal-600" /> Số phòng tắm
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {BATH_OPTIONS.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => onChange({ baths: o })}
                      className={`rounded-xl py-1.5 text-xs font-bold transition cursor-pointer ${
                        filters.baths === o
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Radius (if hidden on desktop) */}
              <div className="lg:hidden">
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Bán kính quét xung quanh
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {RADIUS_OPTIONS.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => onChange({ radius: r.value })}
                      className={`rounded-xl py-1.5 text-xs font-bold transition cursor-pointer ${
                        filters.radius === r.value
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sorting */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" /> Sắp xếp danh sách
                </label>
                <select
                  value={filters.sortBy || 'newest'}
                  onChange={(e) => onChange({ sortBy: e.target.value as SortOption })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white"
                >
                  <option value="newest">🕒 Mới đăng gần đây</option>
                  <option value="distance">📍 Gần vị trí tôi nhất</option>
                  <option value="price-asc">💵 Giá: Thấp đến cao</option>
                  <option value="price-desc">💎 Giá: Cao đến thấp</option>
                  <option value="ai">✨ AI đề xuất phù hợp nhất</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 6. Primary Action Button */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition cursor-pointer"
        >
          <Search className="h-4 w-4" />
          <span>Tìm kiếm</span>
        </button>
      </div>

      {/* ── ROW 2: ACTIVE STATUS & SMART CHIPS RIBBON ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100/90 bg-slate-50/50 px-4 py-1.5 text-xs sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          {/* Active Location Badge */}
          {userLocationLabel && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-200/80 shadow-2xs">
              <Navigation className="h-3 w-3 text-emerald-600 animate-pulse" />
              <span>
                Quanh: <strong className="text-emerald-950">{userLocationLabel}</strong> (
                {filters.radius === 'all' ? 'Toàn bộ' : `${filters.radius}km`})
              </span>
              {onClearLocation && (
                <button
                  type="button"
                  onClick={onClearLocation}
                  className="ml-1 rounded-full p-0.5 hover:bg-emerald-200/60 text-emerald-700"
                  title="Hủy lọc vị trí"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

          {/* Active Price Badge */}
          {(filters.priceMin > 0 || filters.priceMax < (isRent ? 50_000_000 : 20_000_000_000)) && (
            <div className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-800 border border-sky-200/80">
              <span>{formatShortPrice()}</span>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    priceMin: 0,
                    priceMax: isRent ? 50_000_000 : 20_000_000_000,
                  })
                }
                className="hover:text-sky-950"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Beds / Baths Badge */}
          {filters.beds !== 'Bất kỳ' && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 border border-slate-200">
              🛏️ {filters.beds} phòng ngủ
            </span>
          )}
        </div>

        {/* Live Result Count */}
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          <span>
            Tìm thấy <strong className="text-slate-900">{resultCount}</strong> bất động sản
          </span>
        </div>
      </div>
    </div>
  );
}
