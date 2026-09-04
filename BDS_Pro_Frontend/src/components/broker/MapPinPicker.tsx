import { useState, useEffect, useRef } from 'react';
import { RealMap } from '@/components/common/RealMap';
import { Search, MapPin, Loader2, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';

interface MapPinPickerProps {
  latitude: number;
  longitude: number;
  streetAddress?: string;
  onChange: (lat: number, lng: number) => void;
  onStreetAddressChange?: (address: string) => void;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export function MapPinPicker({
  latitude,
  longitude,
  streetAddress = '',
  onChange,
  onStreetAddressChange,
}: MapPinPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasPinned, setHasPinned] = useState<boolean>(() => !!latitude && !!longitude && (latitude !== 10.7769 || longitude !== 106.7009));

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Reverse geocode when coordinates change -> Auto update street address!
  useEffect(() => {
    if (!latitude || !longitude) return;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        { signal: controller.signal }
      )
        .then((res) => res.json())
        .then((data) => {
          if (data && data.display_name && onStreetAddressChange) {
            onStreetAddressChange(data.display_name);
          }
        })
        .catch(() => {});
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [latitude, longitude]);

  // Live debounced search as user types (only populates suggestions)
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      fetchSuggestionsOnly(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper for live dropdown suggestion list
  async function fetchSuggestionsOnly(query: string) {
    if (!query.trim()) return;
    try {
      const q = query.trim();
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q.includes('Việt Nam') ? q : `${q}, Việt Nam`
        )}&limit=5`
      );
      const data: SearchResult[] = await res.json();
      setSearchResults(data);
      setShowDropdown(data.length > 0);
    } catch {
      setSearchResults([]);
    }
  }

  // DIRECT SEARCH & PINNING ACTION (Triggered by Search button or Enter key)
  async function executeDirectSearch(customQuery?: string) {
    const q = (customQuery || searchQuery).trim();
    if (!q) return;

    setSearching(true);
    setShowDropdown(false);

    try {
      // Step 1: Query exact string
      let res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q.includes('Việt Nam') ? q : `${q}, Việt Nam`
        )}&limit=5`
      );
      let data: SearchResult[] = await res.json();

      // Step 2: Fallback query if house number / exact query returned 0 results
      if ((!data || data.length === 0) && /\d+/.test(q)) {
        const cleanedQuery = q.replace(/^\d+\s*/, '').trim(); // Remove leading numbers
        res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            cleanedQuery.includes('Việt Nam') ? cleanedQuery : `${cleanedQuery}, Việt Nam`
          )}&limit=5`
        );
        data = await res.json();
      }

      setSearchResults(data);

      if (data && data.length > 0) {
        // Automatically select & pin top result!
        const topResult = data[0];
        const lat = parseFloat(topResult.lat);
        const lng = parseFloat(topResult.lon);

        onChange(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
        if (onStreetAddressChange) {
          onStreetAddressChange(topResult.display_name);
        }
        setHasPinned(true);
        setShowDropdown(data.length > 1);
      } else {
        alert(`Không tìm thấy vị trí trực tiếp cho "${q}". Bạn vui lòng gõ tên đường/phường hoặc nhấp chọn trực tiếp trên bản đồ.`);
      }
    } catch {
      // Catch network failure gracefully
    } finally {
      setSearching(false);
    }
  }

  function handleSelectResult(result: SearchResult) {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    onChange(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
    if (onStreetAddressChange) {
      onStreetAddressChange(result.display_name);
    }
    setSearchQuery(result.display_name.split(',')[0] || result.display_name);
    setSearchResults([]);
    setShowDropdown(false);
    setHasPinned(true);
  }

  function handleLocationSelect(lat: number, lng: number) {
    onChange(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
    setHasPinned(true);
  }

  return (
    <div className="space-y-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
      {/* Pinning Status Notification Bar */}
      {hasPinned ? (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-xs text-emerald-800 shadow-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">Đã ghim vị trí thành công!</span>
            <span className="ml-1.5 text-slate-600">
              Tọa độ: <strong className="font-mono text-slate-900">{latitude.toFixed(6)}, {longitude.toFixed(6)}</strong>
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5 text-xs text-amber-900 shadow-sm">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">Bản đồ chưa được ghim vị trí.</span>
            <span className="ml-1 text-amber-700">Vui lòng nhập/chọn địa chỉ hoặc bấm Tìm kiếm / nhấp ghim trên bản đồ.</span>
          </div>
        </div>
      )}

      {/* Address Search Bar with Live Suggestions Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <label className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Tìm kiếm địa chỉ trên bản đồ</span>
          {searching && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-normal">
              <Loader2 className="h-3 w-3 animate-spin" /> Đang định vị địa chỉ...
            </span>
          )}
        </label>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowDropdown(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  executeDirectSearch();
                }
              }}
              placeholder="Nhập tên đường, số nhà hoặc tên tòa nhà (VD: 185 Vườn Lài An Phú Đông)..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-9 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowDropdown(false);
                }}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => executeDirectSearch()}
            disabled={searching || !searchQuery.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm shrink-0"
          >
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Tìm kiếm
          </button>
        </div>

        {/* Live Search Results Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute z-30 mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl max-h-64 overflow-y-auto">
            <p className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" /> Các vị trí gợi ý tương ứng (Nhấp để chọn)
            </p>
            {searchResults.map((r) => (
              <button
                key={r.place_id}
                type="button"
                onClick={() => handleSelectResult(r)}
                className="flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs hover:bg-emerald-50 transition border-b border-slate-50 last:border-0"
              >
                <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 line-clamp-1">
                    {r.display_name.split(',')[0]}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {r.display_name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Real Interactive Map */}
      <div className="relative">
        <RealMap
          mode="picker"
          center={[latitude || 10.7769, longitude || 106.7009]}
          zoom={15}
          height="280px"
          hasPinned={hasPinned}
          onLocationSelect={({ lat, lng }) => {
            handleLocationSelect(lat, lng);
          }}
        />
        <div className="absolute bottom-3 left-3 z-10 rounded-lg bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 text-[11px] font-semibold text-white shadow-md">
          📍 Mẹo: Bạn có thể <span className="text-emerald-400 font-bold">kéo giữ ghim đỏ</span> hoặc <span className="text-emerald-400 font-bold">nhấp trực tiếp vào vị trí trên bản đồ</span> để ghim
        </div>
      </div>

      {/* Street Address Input BELOW the Map */}
      <div className="space-y-1.5 pt-2 border-t border-slate-200">
        <label className="text-xs font-bold text-slate-800">
          Địa chỉ đường *
        </label>
        <input
          type="text"
          value={streetAddress}
          onChange={(e) => onStreetAddressChange && onStreetAddressChange(e.target.value)}
          placeholder="208 Nguyễn Hữu Cảnh..."
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
        />
      </div>
    </div>
  );
}
