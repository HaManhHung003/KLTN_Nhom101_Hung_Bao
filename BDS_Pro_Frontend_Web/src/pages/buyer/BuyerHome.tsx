import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building,
  Building2,
  Compass,
  Home,
  LandPlot,
  MapPin,
  Navigation,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { PropertyCard } from '@/components/common/PropertyCard';
import { CLIENT_ROUTES, BROKER_ROUTES } from '@/config/routes';
import { properties as mockProperties } from '@/data/mockData';
import { propertyService } from '@/services/property.service';
import {
  getAddressSuggestions,
  type AddressSuggestionItem,
} from '@/utils/addressSuggestions';
import type { Property, PropertyType, TransactionType } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useUserLocation } from '@/context/LocationContext';

const PROPERTY_CATEGORIES: {
  type: PropertyType;
  label: string;
  icon: typeof Building2;
  desc: string;
}[] = [
  { type: 'apartment', label: 'Căn hộ chung cư', icon: Building2, desc: 'Không gian sống hiện đại, tiện ích cao cấp' },
  { type: 'house', label: 'Nhà phố & Liền kề', icon: Home, desc: 'Vị trí đắc địa, pháp lý sổ hồng riêng' },
  { type: 'villa', label: 'Biệt thự nghỉ dưỡng', icon: Building, desc: 'Sang trọng, sân vườn xanh mát' },
  { type: 'land', label: 'Đất nền thổ cư', icon: LandPlot, desc: 'Tiềm năng tăng giá cao, đón đầu quy hoạch' },
  { type: 'office', label: 'Mặt bằng & Văn phòng', icon: Compass, desc: 'Tối ưu kinh doanh và làm việc' },
];

export function BuyerHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userAddress } = useUserLocation();

  // Search State
  const [transactionType, setTransactionType] = useState<TransactionType>('sale');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');

  // Autocomplete Suggestions State
  const [suggestions, setSuggestions] = useState<AddressSuggestionItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchInputChange = (val: string) => {
    setSearchQuery(val);
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

  const handleSelectSuggestion = (item: AddressSuggestionItem) => {
    setSearchQuery(item.title);
    setShowDropdown(false);
    const params = new URLSearchParams();
    if (transactionType) {
      params.set('loai', transactionType === 'sale' ? 'mua' : 'thue');
    }
    params.set('q', item.title);
    if (selectedType) {
      params.set('type', selectedType);
    }
    if (selectedPriceRange) {
      const [min, max] = selectedPriceRange.split('-');
      if (min) params.set('minPrice', min);
      if (max) params.set('maxPrice', max);
    }
    navigate(`${CLIENT_ROUTES.search}?${params.toString()}`);
  };

  // Listings State
  const [realProperties, setRealProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'sale' | 'rent'>('all');

  useEffect(() => {
    propertyService
      .getProperties({ limit: 16 })
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setRealProperties(res.data);
        } else {
          setRealProperties(mockProperties);
        }
      })
      .catch(() => setRealProperties(mockProperties))
      .finally(() => setLoading(false));
  }, []);

  const displayProperties = realProperties.length > 0 ? realProperties : mockProperties;
  const active = displayProperties.filter((p) => p.status === 'active' || !p.status);

  // AI Recommended properties
  const aiRecommended = [...active].sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0)).slice(0, 4);

  // Filtered properties by tab
  const tabFiltered = active.filter((p) => {
    if (activeTab === 'all') return true;
    return p.transactionType === activeTab;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (transactionType) {
      params.set('loai', transactionType === 'sale' ? 'mua' : 'thue');
    }
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    if (selectedType) {
      params.set('type', selectedType);
    }
    if (selectedPriceRange) {
      const [min, max] = selectedPriceRange.split('-');
      if (min) params.set('minPrice', min);
      if (max) params.set('maxPrice', max);
    }

    navigate(`${CLIENT_ROUTES.search}?${params.toString()}`);
  };

  return (
    <div className="space-y-12">
      {/* ── 1. HERO SECTION ── */}
      <section className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 px-6 py-12 text-white shadow-2xl sm:px-12 sm:py-16">
        {/* Glow ambient effects */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 animate-spin" />
            Nền tảng BĐS Công nghệ Thông minh · KLTN 2026
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl sm:leading-tight">
            Tìm Ngôi Nhà Mơ Ước &amp; <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              Bất Động Sản Đầu Tư Lý Tưởng
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-slate-300">
            Tra cứu trực quan trên bản đồ tương tác, nhận gợi ý tối ưu từ trợ lý ảo AI và quản lý toàn bộ vòng đời đặt lịch xem nhà, đặt cọc an toàn.
          </p>

          {/* Search Box Glass Container */}
          <div className="mt-8 rounded-2xl border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur-xl sm:p-4 text-left">
            {/* Transaction Type Tabs */}
            <div className="flex gap-2 border-b border-white/10 pb-3">
              <button
                type="button"
                onClick={() => setTransactionType('sale')}
                className={`rounded-xl px-5 py-2 text-xs sm:text-sm font-semibold transition ${
                  transactionType === 'sale'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                🏡 Mua BĐS (Bán)
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('rent')}
                className={`rounded-xl px-5 py-2 text-xs sm:text-sm font-semibold transition ${
                  transactionType === 'rent'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                🏢 Thuê BĐS (Cho thuê)
              </button>
            </div>

            {/* Input Controls Form */}
            <form onSubmit={handleSearch} className="mt-3 grid gap-2 sm:grid-cols-12">
              {/* Location / Keyword Input with Autocomplete Suggestions */}
              <div ref={dropdownRef} className="relative sm:col-span-5">
                <MapPin className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 z-10" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.trim()) {
                      getAddressSuggestions(searchQuery).then((items) => {
                        setSuggestions(items);
                        setShowDropdown(items.length > 0);
                      });
                    }
                  }}
                  placeholder="Nhập quận, dự án, tên đường..."
                  className="w-full rounded-xl border border-white/20 bg-white/90 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-400 shadow-sm"
                />

                {/* Autocomplete Suggestions Dropdown */}
                {showDropdown && suggestions.length > 0 && (
                  <div className="absolute left-0 top-full z-[100] mt-1.5 w-full min-w-[320px] max-w-lg max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Gợi ý địa chỉ &amp; Bất động sản
                    </div>
                    <div className="divide-y divide-slate-100">
                      {suggestions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectSuggestion(item)}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-emerald-50 transition cursor-pointer group"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition">
                            {item.type === 'district' ? (
                              <Building2 className="h-4 w-4" />
                            ) : item.type === 'project' ? (
                              <Sparkles className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Navigation className="h-4 w-4 text-teal-600" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-700">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">{item.subtitle}</p>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400 group-hover:text-emerald-600">
                            Tìm ngay →
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Property Type Dropdown */}
              <div className="sm:col-span-3">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/90 py-3 px-3 text-sm text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-400 shadow-sm"
                >
                  <option value="">Tất cả loại hình</option>
                  <option value="apartment">Căn hộ chung cư</option>
                  <option value="house">Nhà phố liền kề</option>
                  <option value="villa">Biệt thự nghỉ dưỡng</option>
                  <option value="land">Đất nền thổ cư</option>
                  <option value="office">Mặt bằng kinh doanh</option>
                </select>
              </div>

              {/* Price Range Dropdown */}
              <div className="sm:col-span-2">
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/90 py-3 px-3 text-sm text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-400 shadow-sm"
                >
                  <option value="">Khoảng giá</option>
                  {transactionType === 'sale' ? (
                    <>
                      <option value="0-2000000000">Dưới 2 tỷ</option>
                      <option value="2000000000-5000000000">2 - 5 tỷ</option>
                      <option value="5000000000-10000000000">5 - 10 tỷ</option>
                      <option value="10000000000-99999999999">Trên 10 tỷ</option>
                    </>
                  ) : (
                    <>
                      <option value="0-5000000">Dưới 5 tr/tháng</option>
                      <option value="5000000-15000000">5 - 15 tr/tháng</option>
                      <option value="15000000-30000000">15 - 30 tr/tháng</option>
                      <option value="30000000-999999999">Trên 30 tr/tháng</option>
                    </>
                  )}
                </select>
              </div>

              {/* Submit Button */}
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-3 px-4 font-bold text-white shadow-lg transition hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-300"
                >
                  <Search className="h-4 w-4" />
                  <span>Tìm kiếm</span>
                </button>
              </div>
            </form>

            {/* Popular quick links */}
            <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-300 border-t border-white/10">
              {userAddress && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `${CLIENT_ROUTES.search}?loai=${
                        transactionType === 'sale' ? 'mua' : 'thue'
                      }&sortBy=distance`
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/25 px-3 py-1 font-semibold text-emerald-300 hover:bg-emerald-500/40 transition cursor-pointer border border-emerald-400/40 shadow-xs"
                  title="Tìm BĐS quanh vị trí hiện tại của bạn"
                >
                  <Navigation className="h-3.5 w-3.5 text-emerald-300 animate-pulse" />
                  <span>
                    Gần bạn:{' '}
                    <strong className="text-white max-w-[200px] truncate inline-block align-bottom">
                      {userAddress}
                    </strong>
                  </span>
                </button>
              )}
              <span className="font-semibold text-emerald-400">Khu vực hot:</span>
              {['Quận 1', 'Quận 7', 'Thủ Đức', 'Bình Thạnh', 'Vinhomes Central Park'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag);
                    navigate(`${CLIENT_ROUTES.search}?q=${encodeURIComponent(tag)}`);
                  }}
                  className="rounded-full bg-white/10 px-2.5 py-1 text-slate-200 transition hover:bg-white/20 hover:text-white"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. TRUST & VALUE MATRIX STRIP ── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-start gap-3.5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Pháp lý minh bạch</h4>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              100% tin đăng được kiểm duyệt hồ sơ sổ hồng, giấy tờ pháp lý trước khi lên sàn.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Bản đồ số Leaflet</h4>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Tìm theo bán kính, tra cứu tiện ích lân cận: trường học, metro, bệnh viện.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Trợ lý ảo AI 24/7</h4>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Phân tích nhu cầu ngân sách, vị trí để gợi ý căn hộ chuẩn xác từng nhu cầu.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Đặt lịch &amp; Cọc an toàn</h4>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Đặt lịch hẹn xem nhà thực tế với Môi giới, thanh toán giữ chỗ minh bạch.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. KHÁM PHÁ THEO LOẠI HÌNH BĐS ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Khám phá theo loại hình Bất động sản
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Danh mục BĐS đa dạng đáp ứng đầy đủ nhu cầu an cư, kinh doanh và đầu tư
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {PROPERTY_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const count = active.filter((p) => p.type === cat.type).length;

            return (
              <button
                key={cat.type}
                type="button"
                onClick={() => navigate(`${CLIENT_ROUTES.search}?type=${cat.type}`)}
                className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-xs transition hover:-translate-y-1 hover:border-emerald-500 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-700 transition group-hover:bg-emerald-50 group-hover:text-emerald-600">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-3 font-bold text-slate-900 text-sm">{cat.label}</h3>
                <p className="mt-1 text-[11px] text-slate-400 line-clamp-1">{cat.desc}</p>
                <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700">
                  {count > 0 ? `${count} tin đăng` : 'Khám phá'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 4. GỢI Ý AI TỐI ƯU CHO BẠN ── */}
      <section className="space-y-4 rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50/50 via-white to-slate-50 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Gợi ý AI thông minh</h2>
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                  Độ khớp 98%
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Thuật toán phân tích xu hướng giá thị trường và tiện ích xung quanh tối ưu nhất
              </p>
            </div>
          </div>
          <Link
            to={CLIENT_ROUTES.search}
            className="inline-flex items-center gap-1 text-sm font-semibold text-purple-700 hover:text-purple-800 transition"
          >
            <span>Xem tất cả gợi ý</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {aiRecommended.map((p) => (
              <PropertyCard key={p.id} property={p} carousel />
            ))}
          </div>
        )}
      </section>

      {/* ── 5. BẤT ĐỘNG SẢN MỚI NHẤT (VỚI BỘ LỌC TAB) ── */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Bất động sản mới lên sàn
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Được cập nhật liên tục từ các sàn giao dịch và Môi giới uy tín
            </p>
          </div>

          {/* Quick tab filter */}
          <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({active.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sale')}
              className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition ${
                activeTab === 'sale'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cần bán ({active.filter((p) => p.transactionType === 'sale').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rent')}
              className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition ${
                activeTab === 'rent'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cho thuê ({active.filter((p) => p.transactionType === 'rent').length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : tabFiltered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
            Chưa có bất động sản nào trong mục này.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tabFiltered.slice(0, 8).map((p) => (
              <PropertyCard key={p.id} property={p} carousel />
            ))}
          </div>
        )}

        {/* View all button */}
        <div className="pt-4 text-center">
          <Link
            to={CLIENT_ROUTES.search}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-emerald-600 bg-white px-8 py-3.5 text-sm font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-50 hover:shadow-md"
          >
            <span>Khám phá toàn bộ {active.length} BĐS trên bản đồ</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── 6. CALL TO ACTION DÀNH CHO MÔI GIỚI & CHỦ NHÀ ── */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 sm:p-12 text-white shadow-xl">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent" />
        <div className="relative max-w-2xl">
          <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
            Dành cho Môi giới &amp; Chủ sở hữu BĐS
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
            Tiếp cận hơn 50,000+ Khách hàng tiềm năng trên BDS Pro
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Đăng tin nhanh chóng, định vị tọa độ Leaflet chính xác, tích hợp quản lý lịch hẹn thông minh và bảo mật đặt cọc minh bạch.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={user?.role === 'agent' ? BROKER_ROUTES.properties : '/login'}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-600"
            >
              <span>{user?.role === 'agent' ? 'Đăng tin BĐS ngay' : 'Đăng nhập Môi giới'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={CLIENT_ROUTES.search}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Tra cứu bản đồ thị trường
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
