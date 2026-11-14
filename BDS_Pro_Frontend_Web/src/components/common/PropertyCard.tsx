import { useEffect, useState } from 'react';
import { Bath, BedDouble, Heart, MapPin, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Property } from '@/types';
import { formatPrice, isVerifiedLegal, propertyTypeLabels, transactionLabels } from '@/utils/format';
import { useAuth } from '@/context/AuthContext';
import { propertyService } from '@/services/property.service';
import { LoginRequiredModal } from './LoginRequiredModal';

interface PropertyCardProps {
  property: Property;
  isFavorite?: boolean;
  detailPath?: string;
  onToggleFavorite?: () => void;
  /** Enable image carousel cycling on hover */
  carousel?: boolean;
  /** Show compact layout for search list panel */
  compact?: boolean;
}

export function PropertyCard({
  property,
  isFavorite = false,
  detailPath = `/client/property/${property.id}`,
  onToggleFavorite,
  carousel = false,
  compact = false,
}: PropertyCardProps) {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [favState, setFavState] = useState(isFavorite || !!property.isFavorited);
  const [busy, setBusy] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    setFavState(isFavorite || !!property.isFavorited);
  }, [isFavorite, property.isFavorited]);

  // Đồng bộ trạng thái yêu thích khi có sự kiện từ các thẻ khác hoặc trang chi tiết
  useEffect(() => {
    const handleFavUpdated = (e: any) => {
      if (e.detail?.propertyId === property.id) {
        setFavState(e.detail.favorited);
      }
    };
    window.addEventListener('bdspro_favorites_updated', handleFavUpdated as EventListener);
    return () => window.removeEventListener('bdspro_favorites_updated', handleFavUpdated as EventListener);
  }, [property.id]);

  const images =
    property.images && property.images.length > 0
      ? property.images
      : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'];
  const verified = isVerifiedLegal(property.legalStatus);

  useEffect(() => {
    if (!carousel || !hovering || images.length <= 1) return;
    const timer = setInterval(() => {
      setImageIndex((i) => (i + 1) % images.length);
    }, 1200);
    return () => clearInterval(timer);
  }, [carousel, hovering, images.length]);

  useEffect(() => {
    if (!hovering) setImageIndex(0);
  }, [hovering]);

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Nếu chưa đăng nhập -> Hiển thị Modal yêu cầu đăng nhập
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    // 2. Nếu component cha có xử lý riêng thì gọi
    if (onToggleFavorite) {
      onToggleFavorite();
      return;
    }

    // 3. Tự động lưu/bỏ lưu tin vào CSDL
    if (busy) return;
    setBusy(true);
    const nextState = !favState;
    setFavState(nextState);

    try {
      const res = await propertyService.toggleFavoriteApi(property.id);
      setFavState(res.favorited);
      window.dispatchEvent(
        new CustomEvent('bdspro_favorites_updated', {
          detail: { propertyId: property.id, favorited: res.favorited },
        })
      );
    } catch {
      setFavState(!nextState); // khôi phục nếu lỗi
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <article
        className={`group flex flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-300 ${
          compact ? 'flex-row p-2 gap-3' : ''
        }`}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div className={`relative overflow-hidden rounded-2xl ${compact ? 'aspect-[4/3] w-36 sm:w-44 shrink-0' : 'aspect-[16/10] w-full'}`}>
          <img
            src={images[imageIndex]}
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          />

          {carousel && images.length > 1 && (
            <>
              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1 z-10">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === imageIndex ? 'w-4 bg-white shadow-sm' : 'w-1.5 bg-white/60'
                    }`}
                  />
                ))}
              </div>
              {hovering && (
                <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/40 to-transparent py-1.5 text-center text-[10px] font-bold text-white z-10">
                  {imageIndex + 1} / {images.length}
                </div>
              )}
            </>
          )}

          <div className="absolute left-2 top-2 flex flex-wrap gap-1 z-10">
            <span className={`rounded-lg px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs backdrop-blur-md ${
              property.transactionType === 'rent' ? 'bg-teal-600/95' : 'bg-emerald-600/95'
            }`}>
              {transactionLabels[property.transactionType] || property.transactionType}
            </span>
            {!compact && (
              <span className="rounded-lg bg-white/90 px-2 py-0.5 text-[10px] font-bold text-slate-800 shadow-xs backdrop-blur-md">
                {propertyTypeLabels[property.type] || property.type}
              </span>
            )}
            {verified && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600/95 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-xs backdrop-blur-md">
                <ShieldCheck className="h-3 w-3" />
                Sổ hồng riêng
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleHeartClick}
            className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-1.5 text-slate-700 shadow-md backdrop-blur-md transition hover:bg-white hover:scale-110 active:scale-90"
            aria-label={favState ? 'Bỏ lưu tin' : 'Lưu tin'}
            title={favState ? 'Bỏ lưu tin' : 'Lưu tin'}
          >
            <Heart className={`h-4 w-4 transition-colors ${favState ? 'fill-red-500 text-red-500' : 'hover:text-red-500'}`} />
          </button>
        </div>

        <Link to={detailPath} className={`flex flex-col justify-between ${compact ? 'min-w-0 flex-1 py-1 pr-1' : 'p-4'}`}>
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <p className={`font-extrabold tracking-tight text-emerald-700 ${compact ? 'text-base' : 'text-xl'}`}>
                {formatPrice(property.price, property.transactionType)}
              </p>
              <span className="text-xs font-semibold text-slate-400">
                {property.area} m²
              </span>
            </div>

            <h3 className={`mt-1 font-bold text-slate-900 group-hover:text-emerald-700 transition-colors ${
              compact ? 'line-clamp-1 text-xs sm:text-sm' : 'line-clamp-2 text-base'
            }`}>
              {property.title}
            </h3>

            <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="truncate">{property.district}, {property.city}</span>
            </div>
          </div>

          <div className="mt-2.5 flex items-center gap-3 border-t border-slate-100 pt-2 text-xs font-medium text-slate-600">
            {property.bedrooms != null && (
              <span className="inline-flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5 text-slate-400" />
                <strong>{property.bedrooms}</strong> PN
              </span>
            )}
            {property.bathrooms != null && (
              <span className="inline-flex items-center gap-1">
                <Bath className="h-3.5 w-3.5 text-slate-400" />
                <strong>{property.bathrooms}</strong> WC
              </span>
            )}
            <span className="ml-auto text-[11px] font-bold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
              Xem ngay →
            </span>
          </div>
        </Link>
      </article>

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        action="save"
        redirectTo={detailPath}
      />
    </>
  );
}
