import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  Bath,
  BedDouble,
  Building2,
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Copy,
  Eye,
  Flag,
  GraduationCap,
  Heart,
  History,
  Hospital,
  Info,
  Maximize2,
  MessageCircle,
  Phone,
  Ruler,
  Share2,
  Shield,
  ShoppingCart,
  Sparkles,
  Star,
  TrendingUp,
  Wifi,
  Wind,
  X,
} from 'lucide-react';
import { authStorage, authService } from '@/services/auth.service';
import { propertyService, type NearbyPoi } from '@/services/property.service';
import { chatStorage } from '@/services/chatStorage';
import { recentViews } from '@/services/recentViewsStorage';
import { CLIENT_ROUTES } from '@/config/routes';
import { BookingModal } from '@/components/client/BookingModal';
import { DepositModal } from '@/components/common/DepositModal';
import { PropertyCard } from '@/components/common/PropertyCard';
import { RealMap } from '@/components/common/RealMap';
import { ImageLightbox } from '@/components/client/ImageLightbox';
import { ReportListingModal } from '@/components/client/ReportListingModal';
import {
  formatPrice,
  isVerifiedLegal,
  legalLabels,
  propertyTypeLabels,
  transactionLabels,
} from '@/utils/format';
import type { PoiCategory, Property } from '@/types';

type PoiWithFallback = NearbyPoi | {
  id: string;
  name: string;
  category: PoiCategory;
  rating?: number;
  distance: number;
};

const POI_ICONS: Partial<Record<PoiCategory, typeof GraduationCap>> = {
  school: GraduationCap,
  hospital: Hospital,
  supermarket: ShoppingCart,
};

const POI_LABELS: Partial<Record<PoiCategory, string>> = {
  school: 'Trường học',
  hospital: 'Bệnh viện',
  supermarket: 'Siêu thị / Mua sắm',
  transport: 'Giao thông',
  park: 'Công viên',
  mall: 'TTTM',
};

const AMENITY_ICONS: Record<string, typeof Wifi> = {
  'Hồ bơi': Bath,
  'Phòng gym': Building2,
  'Bãi đậu xe': Car,
  'Internet tốc độ cao': Wifi,
  'Điều hòa': Wind,
  'Ban công': Maximize2,
  'Thang máy': Building2,
  'An ninh 24/7': Shield,
  'Sân vườn': Building2,
  'Trường học': GraduationCap,
};

const FALLBACK_POI: PoiWithFallback[] = [
  { id: 'fb-1', name: 'Trường Tiểu học Quốc tế', category: 'school', distance: 350, rating: 4.8 },
  { id: 'fb-2', name: 'Bệnh viện Đa khoa Quốc tế', category: 'hospital', distance: 1200, rating: 4.9 },
  { id: 'fb-3', name: 'Siêu thị & TTTM lân cận', category: 'supermarket', distance: 500, rating: 4.6 },
];

function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

function timeAgo(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Hôm nay';
  if (days === 1) return 'Hôm qua';
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;
  return `${Math.floor(months / 12)} năm trước`;
}

export function ClientPropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [pois, setPois] = useState<PoiWithFallback[]>([]);
  const [similar, setSimilar] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [activePoiCategory, setActivePoiCategory] = useState<PoiCategory | 'all'>('all');
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const currentUser = authService.getCurrentUser();
  const isLoggedIn = authStorage.isAuthenticated();
  const ownerAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    property?.ownerName || 'Agent',
  )}&backgroundColor=10b981`;

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // Cuộn lên đầu khi đổi id
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Tải chi tiết + POI + BĐS tương tự
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setSimilar([]);
    Promise.all([propertyService.getDetail(id), propertyService.getPois(id)])
      .then(([detail, poiList]) => {
        setProperty(detail);
        setPois(poiList.length > 0 ? poiList : FALLBACK_POI);
        recentViews.record(detail);
        return propertyService
          .getProperties({
            limit: 6,
            type: detail.type,
            transactionType: detail.transactionType,
          })
          .then((res) => {
            const list = (res?.data ?? []).filter((p) => p.id !== detail.id).slice(0, 4);
            setSimilar(list);
          })
          .catch(() => undefined);
      })
      .catch((err) => setError(err?.message || 'Không thể tải chi tiết BĐS'))
      .finally(() => setLoading(false));
  }, [id]);

  const images = useMemo(() => {
    if (!property) return [];
    if (property.images && property.images.length > 0) return property.images;
    return ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600'];
  }, [property]);

  const filteredPois = useMemo(
    () =>
      activePoiCategory === 'all'
        ? pois
        : pois.filter((p) => p.category === activePoiCategory),
    [activePoiCategory, pois],
  );

  function handleContactHost() {
    if (!property) return;
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    const conv = chatStorage.createOrGetConversation({
      propertyId: property.id,
      propertyTitle: property.title,
      hostName: property.ownerName || 'Môi giới',
      hostAvatar: ownerAvatar,
      initialMessage: `Chào anh/chị, em quan tâm đến bất động sản "${property.title}". Anh/chị cho em xin thêm thông tin tư vấn nhé!`,
    });
    navigate(`${CLIENT_ROUTES.chat}?conv=${conv.id}`);
  }

  async function handleToggleFavorite() {
    if (!property || favoriteBusy) return;
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setFavoriteBusy(true);
    const previous = property.isFavorited;
    setProperty({ ...property, isFavorited: !previous });
    try {
      const res = await propertyService.toggleFavoriteApi(property.id);
      setProperty({ ...property, isFavorited: res.favorited });
      setToast(res.favorited ? 'Đã lưu tin vào danh sách yêu thích' : 'Đã bỏ lưu tin');
    } catch {
      setProperty({ ...property, isFavorited: previous });
      setToast('Không thể lưu tin, vui lòng thử lại');
    } finally {
      setFavoriteBusy(false);
    }
  }

  async function handleShare() {
    if (!property) return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: property.title, text: property.title, url });
        return;
      } catch {
        /* fallback copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setToast('Đã sao chép liên kết');
    } catch {
      setToast(url);
    }
  }

  // ============== Skeleton loading ==============
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="h-4 w-64 animate-pulse rounded bg-slate-200" />
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="h-6 w-20 animate-pulse rounded bg-slate-200" />
            <div className="h-6 w-16 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="h-8 w-3/4 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="grid h-72 gap-2 md:h-[460px] md:grid-cols-4">
          <div className="h-full animate-pulse rounded-2xl bg-slate-200 md:col-span-2 md:row-span-2" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="hidden animate-pulse rounded-2xl bg-slate-200 md:block" />
          ))}
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
          </div>
          <div className="space-y-6">
            <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <X className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Không thể hiển thị BĐS</h2>
        <p className="mt-2 text-sm text-slate-500">
          {error || 'Bất động sản này không tồn tại hoặc đã bị gỡ bỏ.'}
        </p>
        <Link
          to={CLIENT_ROUTES.search}
          className="mt-6 inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
        </Link>
      </div>
    );
  }

  const verified = isVerifiedLegal(property.legalStatus);
  const pricePerSqm = Math.round(property.price / Math.max(1, property.area));

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-24 md:pb-8">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Quay lại"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Quay lại</span>
        </button>
        <div className="text-[11px] text-slate-500 md:text-xs">
          <span className="font-mono text-slate-700">#{property.id.slice(0, 8).toUpperCase()}</span>
          <span className="mx-2">·</span>
          <span>Cập nhật {timeAgo(property.createdAt)}</span>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500" aria-label="Breadcrumb">
        <Link to={CLIENT_ROUTES.home} className="hover:text-slate-900">Trang chủ</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={CLIENT_ROUTES.search} className="hover:text-slate-900">Bất động sản</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate text-slate-900 font-semibold">{property.title}</span>
      </nav>

      {/* Hero block */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Gallery */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="relative h-72 md:h-[460px]">
              <img
                src={images[activeImage]}
                alt={property.title}
                className="h-full w-full cursor-zoom-in object-cover transition-opacity"
                onClick={() => setShowLightbox(true)}
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImage((i) => (i - 1 + images.length) % images.length)
                    }
                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:bg-white"
                    aria-label="Ảnh trước"
                  >
                    <ChevronLeft className="h-5 w-5 text-slate-700" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:bg-white"
                    aria-label="Ảnh sau"
                  >
                    <ChevronRight className="h-5 w-5 text-slate-700" />
                  </button>
                  <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                    {activeImage + 1} / {images.length}
                  </span>
                </>
              )}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() => setShowLightbox(true)}
                  className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-md transition hover:bg-white"
                >
                  <Maximize2 className="h-3.5 w-3.5" /> Phóng to
                </button>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto border-t border-slate-100 bg-slate-50/50 p-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                      i === activeImage
                        ? 'border-emerald-600 shadow-md'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`Ảnh ${i + 1}`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title + meta */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                tone="brand"
                icon={<TrendingUp className="h-3 w-3" />}
                text={transactionLabels[property.transactionType]}
              />
              <Badge tone="slate" text={propertyTypeLabels[property.type]} />
              {verified && (
                <Badge
                  tone="sky"
                  icon={<Shield className="h-3 w-3" />}
                  text={`Pháp lý: ${legalLabels[property.legalStatus]}`}
                />
              )}
              {typeof property.aiScore === 'number' && (
                <Badge
                  tone="violet"
                  icon={<Sparkles className="h-3 w-3" />}
                  text={`AI Score ${property.aiScore}/100`}
                />
              )}
            </div>
            <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
              {property.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Compass className="h-4 w-4 text-slate-400" />
                {property.address}
              </span>
              <span className="hidden sm:inline">·</span>
              <span className="text-slate-700 font-medium">
                {property.district}, {property.city}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
              <Stat icon={<Eye className="h-3.5 w-3.5" />}>
                {property.viewCount.toLocaleString('vi-VN')} lượt xem
              </Stat>
              <Stat icon={<Heart className="h-3.5 w-3.5" />}>
                {property.favoriteCount.toLocaleString('vi-VN')} lượt lưu
              </Stat>
              <Stat icon={<Clock className="h-3.5 w-3.5" />}>
                Đăng {timeAgo(property.createdAt)}
              </Stat>
            </div>
          </div>

          {/* Desktop action bar */}
          <div className="hidden flex-wrap items-center gap-2 lg:flex">
            <button
              type="button"
              onClick={handleToggleFavorite}
              disabled={favoriteBusy}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
                property.isFavorited
                  ? 'border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
              aria-pressed={property.isFavorited}
            >
              <Heart
                className={`h-4 w-4 ${property.isFavorited ? 'fill-rose-500 text-rose-500' : ''}`}
              />
              {property.isFavorited ? 'Đã lưu tin' : 'Lưu tin'}
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Share2 className="h-4 w-4" /> Chia sẻ
            </button>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href).then(() =>
                  setToast('Đã sao chép liên kết'),
                );
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Copy className="h-4 w-4" /> Sao chép liên kết
            </button>
            <button
              type="button"
              onClick={() => setShowReport(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              aria-label="Báo cáo vi phạm"
            >
              <Flag className="h-4 w-4" /> Báo cáo
            </button>
          </div>
        </div>

        {/* Sidebar desktop */}
        <aside className="hidden lg:block">
          <SidebarContactCard
            property={property}
            ownerAvatar={ownerAvatar}
            isLoggedIn={isLoggedIn}
            currentUser={currentUser}
            onBook={() => {
              if (!isLoggedIn) return navigate('/login');
              setShowBooking(true);
            }}
            onDeposit={() => {
              if (!isLoggedIn) return navigate('/login');
              setShowDeposit(true);
            }}
            onChat={handleContactHost}
          />
        </aside>
      </div>

      {/* Main content sections */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* Highlight stats */}
          <section className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-4">
            <HighlightCard
              label={`Giá ${transactionLabels[property.transactionType].toLowerCase()}`}
              value={formatPrice(property.price, property.transactionType)}
              tone="brand"
            />
            <HighlightCard
              label="Diện tích"
              value={`${property.area} m²`}
              icon={<Ruler className="h-4 w-4 text-slate-400" />}
            />
            <HighlightCard
              label="Phòng ngủ"
              value={`${property.bedrooms ?? '—'} PN`}
              icon={<BedDouble className="h-4 w-4 text-slate-400" />}
            />
            <HighlightCard
              label="Phòng tắm"
              value={`${property.bathrooms ?? '—'} WC`}
              icon={<Bath className="h-4 w-4 text-slate-400" />}
            />
          </section>

          {/* Description */}
          <Section title="Mô tả chi tiết" subtitle="Thông tin từ chủ đầu tư / môi giới">
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {property.description}
            </p>
          </Section>

          {/* Specs */}
          <Section title="Thông số chi tiết" subtitle="Thông số kỹ thuật và pháp lý">
            <div className="grid gap-3 sm:grid-cols-2">
              <SpecRow label="Mã tin" value={`#${property.id.slice(0, 8).toUpperCase()}`} />
              <SpecRow label="Loại hình" value={propertyTypeLabels[property.type]} />
              <SpecRow
                label="Hình thức"
                value={`${property.transactionType === 'sale' ? 'Mua bán' : 'Cho thuê'}${
                  property.transactionType === 'rent' ? ' (theo tháng)' : ''
                }`}
              />
              <SpecRow
                label="Pháp lý"
                value={legalLabels[property.legalStatus]}
                verified={verified}
              />
              <SpecRow label="Diện tích" value={`${property.area} m²`} />
              <SpecRow
                label="Đơn giá / m²"
                value={`${pricePerSqm.toLocaleString('vi-VN')} đ`}
              />
              <SpecRow label="Phòng ngủ" value={`${property.bedrooms ?? '—'} phòng`} />
              <SpecRow label="Phòng tắm" value={`${property.bathrooms ?? '—'} phòng`} />
              <SpecRow label="Quận / Huyện" value={property.district} />
              <SpecRow label="Tỉnh / Thành" value={property.city} />
            </div>
          </Section>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <Section title="Tiện ích nội khu" subtitle={`${property.amenities.length} tiện ích`}>
              <div className="grid gap-2 sm:grid-cols-2">
                {property.amenities.map((a) => {
                  const Icon = AMENITY_ICONS[a] ?? Sparkles;
                  return (
                    <div
                      key={a}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-3"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{a}</span>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Map */}
          <Section
            title="Vị trí trên bản đồ"
            subtitle={`${property.latitude?.toFixed(4)}, ${property.longitude?.toFixed(4)}`}
            icon={<Compass className="h-5 w-5 text-emerald-600" />}
          >
            <RealMap
              mode="display"
              center={[property.latitude || 10.7769, property.longitude || 106.7009]}
              zoom={15}
              height="360px"
              properties={[property]}
            />
          </Section>

          {/* POIs */}
          <Section
            title="Tiện ích xung quanh"
            subtitle="Trường học · Bệnh viện · Siêu thị trong bán kính 3km"
            icon={<Building2 className="h-5 w-5 text-emerald-600" />}
          >
            <div className="flex flex-wrap gap-2">
              {(['all', 'school', 'hospital', 'supermarket'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActivePoiCategory(cat)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    activePoiCategory === cat
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'Tất cả' : POI_LABELS[cat]}
                </button>
              ))}
            </div>
            {filteredPois.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                Chưa có dữ liệu tiện ích cho khu vực này.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredPois.map((poi) => {
                  const Icon = POI_ICONS[poi.category] ?? GraduationCap;
                  return (
                    <div
                      key={poi.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 transition hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{poi.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {POI_LABELS[poi.category]}
                            {poi.rating ? (
                              <span className="ml-2 inline-flex items-center gap-0.5">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                {poi.rating}
                              </span>
                            ) : null}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                        {formatDistance(poi.distance)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          {/* Price insight */}
          <Section title="Phân tích giá" icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}>
            <div className="grid gap-3 sm:grid-cols-3">
              <InsightCard
                label="Đơn giá / m²"
                value={`${pricePerSqm.toLocaleString('vi-VN')} đ`}
                tone="brand"
              />
              <InsightCard
                label="Trung bình khu vực"
                value="≈ 72 tr/m²"
                hint="Theo dữ liệu POI lân cận"
              />
              <InsightCard
                label="Đánh giá AI"
                value={`${property.aiScore ?? '—'}/100`}
                tone="violet"
                hint="Mức độ đầy đủ & tin cậy"
              />
            </div>
          </Section>

          {/* Tips / FAQ */}
          <Section
            title="Lưu ý khi xem & đặt cọc"
            icon={<Info className="h-5 w-5 text-emerald-600" />}
          >
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                Đặt lịch xem nhà trước 24 giờ để môi giới chuẩn bị chìa khóa và thông tin pháp lý.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                Kiểm tra kỹ giấy chứng nhận quyền sử dụng đất ảo (sổ hồng, sổ đỏ) trước khi đặt cọc.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                Mọi khoản đặt cọc đều qua hệ thống escrow của BDS Pro — không chuyển khoản trực tiếp.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                Nếu cảm thấy thông tin không khớp thực tế, bấm <strong>Báo cáo</strong> để admin kiểm tra.
              </li>
            </ul>
          </Section>
        </div>

        {/* Sidebar — quick summary (always visible) */}
        <aside className="hidden lg:block lg:sticky lg:top-20 lg:self-start">
          <SidebarQuickSummary
            property={property}
            pricePerSqm={pricePerSqm}
            ownerAvatar={ownerAvatar}
            isLoggedIn={isLoggedIn}
            currentUser={currentUser}
            onBook={() => {
              if (!isLoggedIn) return navigate('/login');
              setShowBooking(true);
            }}
            onDeposit={() => {
              if (!isLoggedIn) return navigate('/login');
              setShowDeposit(true);
            }}
            onChat={handleContactHost}
          />
        </aside>
      </div>

      {/* BĐS tương tự */}
      {similar.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">BĐS tương tự</h3>
              <p className="mt-1 text-sm text-slate-500">
                Cùng {propertyTypeLabels[property.type]} · {transactionLabels[property.transactionType]}
              </p>
            </div>
            <Link
              to={CLIENT_ROUTES.search}
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Xem thêm →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                detailPath={CLIENT_ROUTES.property(p.id)}
                isFavorite={p.isFavorited}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recently viewed */}
      <RecentlyViewed currentId={property.id} />

      {/* Mobile floating action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-md items-center gap-2">
          <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={favoriteBusy}
            className={`flex h-11 w-11 items-center justify-center rounded-xl border transition disabled:opacity-50 ${
              property.isFavorited
                ? 'border-rose-300 bg-rose-50 text-rose-600'
                : 'border-slate-200 text-slate-700'
            }`}
            aria-label={property.isFavorited ? 'Bỏ lưu' : 'Lưu tin'}
          >
            <Heart className={`h-5 w-5 ${property.isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleContactHost}
            className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <MessageCircle className="h-4 w-4 text-emerald-600" /> Chat
          </button>
          <button
            type="button"
            onClick={() => {
              if (!isLoggedIn) return navigate('/login');
              setShowBooking(true);
            }}
            className="flex h-11 flex-[1.4] items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700"
          >
            <Calendar className="h-4 w-4" /> Đặt lịch xem
          </button>
        </div>
      </div>

      {/* Modals */}
      {showBooking && <BookingModal property={property} onClose={() => setShowBooking(false)} />}
      {showDeposit && <DepositModal property={property} onClose={() => setShowDeposit(false)} />}
      {showReport && (
        <ReportListingModal
          property={property}
          onClose={() => setShowReport(false)}
          onSuccess={() => setToast('Đã gửi báo cáo cho admin xử lý')}
          onError={(msg) => setToast(msg)}
        />
      )}
      {showLightbox && (
        <ImageLightbox
          images={images}
          initialIndex={activeImage}
          onClose={() => setShowLightbox(false)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="pointer-events-none fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900/95 px-5 py-2.5 text-sm font-medium text-white shadow-lg md:bottom-6">
          {toast}
        </div>
      )}
    </div>
  );
}

// ===================== Sub-components =====================

interface BadgeProps {
  text: string;
  tone: 'brand' | 'slate' | 'sky' | 'violet';
  icon?: React.ReactNode;
}
function Badge({ text, tone, icon }: BadgeProps) {
  const map: Record<BadgeProps['tone'], string> = {
    brand: 'bg-emerald-100 text-emerald-800',
    slate: 'bg-slate-100 text-slate-700',
    sky: 'bg-sky-100 text-sky-800',
    violet: 'bg-violet-100 text-violet-800',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold ${map[tone]}`}
    >
      {icon}
      {text}
    </span>
  );
}

function Stat({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1">
      {icon}
      {children}
    </span>
  );
}

function HighlightCard({
  label,
  value,
  icon,
  tone = 'default',
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  tone?: 'default' | 'brand';
}) {
  const valueClass =
    tone === 'brand'
      ? 'text-emerald-700'
      : 'text-slate-900';
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 flex items-center gap-1.5 text-base font-bold sm:text-lg ${valueClass}`}>
        {icon}
        {value}
      </p>
    </div>
  );
}

function InsightCard({
  label,
  value,
  tone = 'default',
  hint,
}: {
  label: string;
  value: string;
  tone?: 'default' | 'brand' | 'violet';
  hint?: string;
}) {
  const map: Record<typeof tone, string> = {
    default: 'text-slate-900',
    brand: 'text-emerald-700',
    violet: 'text-violet-700',
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-lg font-bold ${map[tone]}`}>{value}</p>
      {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

function SpecRow({ label, value, verified }: { label: string; value: string; verified?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900">
        {value}
        {verified && <Shield className="h-3.5 w-3.5 text-sky-600" />}
      </span>
    </div>
  );
}

function Section({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          {icon}
          {title}
        </h3>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

interface SidebarCardProps {
  property: Property;
  ownerAvatar: string;
  isLoggedIn: boolean;
  currentUser: { name?: string; email?: string } | null;
  onBook: () => void;
  onDeposit: () => void;
  onChat: () => void;
}

function SidebarContactCard({
  property,
  ownerAvatar,
  currentUser,
  onBook,
  onDeposit,
  onChat,
}: SidebarCardProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-gradient-to-b from-emerald-50 to-white p-6 shadow-md">
        <div className="flex items-center gap-3">
          <img
            src={ownerAvatar}
            alt=""
            className="h-12 w-12 rounded-full ring-2 ring-emerald-200"
          />
          <div className="min-w-0">
            <p className="truncate font-bold text-slate-900">
              {property.ownerName || 'Môi giới'}
            </p>
            <p className="text-xs font-semibold text-emerald-700">
              Môi giới · Đã xác minh
            </p>
          </div>
          <button
            type="button"
            className="ml-auto rounded-xl bg-white p-2.5 shadow-sm transition hover:bg-emerald-50"
            aria-label="Gọi điện"
          >
            <Phone className="h-4 w-4 text-emerald-700" />
          </button>
        </div>

        {currentUser && (
          <p className="rounded-xl bg-white/70 p-2 text-[11px] text-slate-600">
            <strong className="text-slate-800">{currentUser.name}</strong> ·{' '}
            <span>Bạn đang đăng nhập với tư cách người tìm BĐS</span>
          </p>
        )}

        <div className="space-y-2">
          <button
            type="button"
            onClick={onBook}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700"
          >
            <Calendar className="h-4 w-4" />
            Đặt lịch xem nhà
          </button>
          <button
            type="button"
            onClick={onDeposit}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-emerald-600 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            <Award className="h-4 w-4" />
            Đặt cọc giữ chỗ
          </button>
          <button
            type="button"
            onClick={onChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <MessageCircle className="h-4 w-4 text-emerald-600" />
            Nhắn tin tư vấn
          </button>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs text-amber-800">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <strong>Lưu ý:</strong> Mọi giao dịch đặt cọc đều qua hệ thống escrow BDS Pro.
              Không chuyển khoản trực tiếp cho môi giới khi chưa xác nhận.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarQuickSummary({
  property,
  pricePerSqm,
}: SidebarCardProps & { pricePerSqm: number }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900">Tóm tắt nhanh</h4>
          <Link
            to={CLIENT_ROUTES.property(property.id)}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Làm mới
          </Link>
        </div>
        <dl className="mt-4 space-y-3 text-sm">
          <SummaryRow label="Mức giá" value={formatPrice(property.price, property.transactionType)} accent />
          <SummaryRow label="Đơn giá / m²" value={`${pricePerSqm.toLocaleString('vi-VN')} đ`} />
          <SummaryRow label="Diện tích" value={`${property.area} m²`} />
          <SummaryRow label="Khu vực" value={property.district} />
          <SummaryRow label="Mã tin" value={`#${property.id.slice(0, 8).toUpperCase()}`} mono />
        </dl>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-700" />
          <h4 className="text-sm font-bold text-emerald-800">Trợ lý AI sẵn sàng</h4>
        </div>
        <p className="mt-2 text-xs text-emerald-900">
          Hỏi về pháp lý, so sánh khu vực hoặc yêu cầu gợi ý BĐS tương tự
          ngay góc phải màn hình.
        </p>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  accent,
  mono,
}: {
  label: string;
  value: string;
  accent?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd
        className={`${accent ? 'font-bold text-emerald-700' : 'font-semibold text-slate-900'} ${
          mono ? 'font-mono text-xs' : ''
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function RecentlyViewed({ currentId }: { currentId: string }) {
  const [items, setItems] = useState(recentViews.get());

  useEffect(() => {
    function refresh() {
      setItems(recentViews.get());
    }
    refresh();
    window.addEventListener('bdspro_history_updated', refresh);
    return () => window.removeEventListener('bdspro_history_updated', refresh);
  }, []);

  const others = items.filter((v) => v.id !== currentId).slice(0, 4);
  if (others.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <History className="h-5 w-5 text-emerald-700" />
        <h3 className="text-xl font-bold text-slate-900">Đã xem gần đây</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {others.map((v) => (
          <Link
            key={v.id}
            to={CLIENT_ROUTES.property(v.id)}
            className="group flex gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition hover:shadow-md"
          >
            <div className="aspect-square w-20 shrink-0 overflow-hidden rounded-xl">
              <img
                src={v.image}
                alt=""
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="min-w-0 flex-1 py-1">
              <p className="line-clamp-2 text-xs font-semibold text-slate-900 group-hover:text-emerald-700">
                {v.title}
              </p>
              <p className="mt-1 text-xs font-bold text-emerald-700">
                {formatPrice(v.price, v.transactionType)}
              </p>
              <p className="text-[10px] text-slate-500">
                {v.area} m² · {v.district}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
