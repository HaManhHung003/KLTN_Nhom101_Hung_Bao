import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { chatStorage } from '@/services/chatStorage';
import {
  Award,
  Bath,
  BedDouble,
  Calendar,
  ChevronRight,
  Hospital,
  MapPin,
  MessageCircle,
  Ruler,
  School,
  ShoppingCart,
  Shield,
} from 'lucide-react';
import { propertyService } from '@/services/property.service';
import { BookingModal } from '@/components/client/BookingModal';
import { DepositModal } from '@/components/common/DepositModal';
import { RealMap } from '@/components/common/RealMap';
import {
  formatPrice,
  isVerifiedLegal,
  propertyTypeLabels,
  transactionLabels,
} from '@/utils/format';
import { CLIENT_ROUTES } from '@/config/routes';
import type { PoiCategory, PointOfInterest, Property } from '@/types';

const defaultPOIs: PointOfInterest[] = [
  { id: '1', name: 'Trường Tiểu học Quốc tế', category: 'school', distance: 350, rating: 4.8 },
  { id: '2', name: 'Bệnh viện Đa khoa Quốc tế Vinmec', category: 'hospital', distance: 1200, rating: 4.9 },
  { id: '3', name: 'Siêu thị Co.opmart & Trung tâm thương mại', category: 'supermarket', distance: 500, rating: 4.6 },
];

const POI_ICONS: Record<PoiCategory, typeof School> = {
  school: School,
  hospital: Hospital,
  supermarket: ShoppingCart,
};

const POI_LABELS: Record<PoiCategory, string> = {
  school: 'Trường học',
  hospital: 'Bệnh viện',
  supermarket: 'Siêu thị',
};

function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${meters} m`;
}

export function ClientPropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [activePoiCategory, setActivePoiCategory] = useState<PoiCategory | 'all'>('all');

  function handleContactHost() {
    if (!property) return;
    const conv = chatStorage.createOrGetConversation({
      propertyId: property.id,
      propertyTitle: property.title,
      hostName: property.ownerName || 'Trần Văn Bảo',
      hostAvatar: 'https://i.pravatar.cc/150?u=agent',
      initialMessage: `Chào anh/chị, em quan tâm đến bất động sản "${property.title}". Anh/chị cho em xin thêm thông tin tư vấn nhé!`,
    });
    navigate(`${CLIENT_ROUTES.chat}?conv=${conv.id}`);
  }

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    propertyService
      .getDetail(id)
      .then((data) => setProperty(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl py-20 text-center text-slate-500">
        Đang nạp chi tiết bất động sản...
      </div>
    );
  }

  if (!property) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900">Không tìm thấy BĐS</h2>
        <p className="mt-2 text-sm text-slate-500">Bất động sản này không tồn tại hoặc đã bị gỡ bỏ.</p>
        <Link
          to={CLIENT_ROUTES.search}
          className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'];

  const filteredPois = activePoiCategory === 'all'
    ? defaultPOIs
    : defaultPOIs.filter((p) => p.category === activePoiCategory);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link to={CLIENT_ROUTES.home} className="hover:text-slate-900">Trang chủ</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={CLIENT_ROUTES.search} className="hover:text-slate-900">Bất động sản</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate text-slate-900 font-semibold">{property.title}</span>
      </div>

      {/* Title & Badges */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
            {transactionLabels[property.transactionType] || property.transactionType}
          </span>
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            {propertyTypeLabels[property.type] || property.type}
          </span>
          {isVerifiedLegal(property.legalStatus) && (
            <span className="inline-flex items-center gap-1 rounded-md bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-800">
              <Shield className="h-3 w-3" /> Sổ hồng chuẩn
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{property.title}</h1>
        <p className="flex items-center gap-1 text-sm text-slate-500">
          <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
          {property.address || `${property.district}, ${property.city}`}
        </p>
      </div>

      {/* Cloudinary Image Gallery */}
      <div className="grid gap-2 overflow-hidden rounded-2xl md:grid-cols-3 md:h-96">
        <div className="md:col-span-2 h-64 md:h-full">
          <img src={images[0]} alt="" className="h-full w-full object-cover transition hover:opacity-95" />
        </div>
        <div className="hidden grid-cols-2 gap-2 md:grid">
          {images.slice(1, 5).map((img, idx) => (
            <img key={idx} src={img} alt="" className="h-full w-full object-cover transition hover:opacity-95" />
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* Highlights */}
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-4">
            <div>
              <p className="text-xs text-slate-500">Giá bán / thuê</p>
              <p className="mt-1 text-xl font-bold text-emerald-700">
                {formatPrice(property.price, property.transactionType)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Diện tích</p>
              <p className="mt-1 flex items-center gap-1 text-base font-semibold text-slate-900">
                <Ruler className="h-4 w-4 text-slate-400" /> {property.area} m²
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Phòng ngủ</p>
              <p className="mt-1 flex items-center gap-1 text-base font-semibold text-slate-900">
                <BedDouble className="h-4 w-4 text-slate-400" /> {property.bedrooms ?? 1} PN
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Phòng tắm</p>
              <p className="mt-1 flex items-center gap-1 text-base font-semibold text-slate-900">
                <Bath className="h-4 w-4 text-slate-400" /> {property.bathrooms ?? 1} WC
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Mô tả chi tiết</h3>
            <div className="whitespace-pre-line text-sm text-slate-600 leading-relaxed">
              {property.description}
            </div>
          </div>

          {/* Real Leaflet Map Location */}
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-600" />
              Vị trí trên Bản đồ thực tế (OpenStreetMap)
            </h3>
            <RealMap
              mode="display"
              center={[property.latitude || 10.7769, property.longitude || 106.7009]}
              zoom={15}
              height="300px"
              properties={[property]}
            />
          </div>

          {/* Points of Interest */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Tiện ích xung quanh (POI)</h3>
            <div className="flex gap-2">
              {(['all', 'school', 'hospital', 'supermarket'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActivePoiCategory(cat)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    activePoiCategory === cat
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'Tất cả' : POI_LABELS[cat]}
                </button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredPois.map((poi) => {
                const Icon = POI_ICONS[poi.category];
                return (
                  <div key={poi.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{poi.name}</p>
                        <p className="text-[10px] text-slate-500">{POI_LABELS[poi.category]}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700">{formatDistance(poi.distance)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <h3 className="font-bold text-slate-900">Thông tin Môi giới / Chủ nhà</h3>
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <img
                src="https://i.pravatar.cc/150?u=agent"
                alt=""
                className="h-12 w-12 rounded-full ring-2 ring-emerald-100"
              />
              <div>
                <p className="font-bold text-slate-900">{property.ownerName || 'Trần Văn Bảo'}</p>
                <p className="text-xs text-emerald-600 font-semibold">Môi giới uy tín · BDS Pro</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowBooking(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-semibold text-white shadow-md transition hover:bg-emerald-700"
              >
                <Calendar className="h-4 w-4" />
                Đặt lịch xem nhà ngay
              </button>

              <button
                onClick={() => setShowDeposit(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-emerald-600 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                <Award className="h-4 w-4" />
                Đặt cọc giữ chỗ an toàn
              </button>

              <button
                type="button"
                onClick={handleContactHost}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                Nhắn tin tư vấn
              </button>
            </div>
          </div>
        </div>
      </div>

      {showBooking && (
        <BookingModal
          property={property}
          onClose={() => setShowBooking(false)}
        />
      )}

      {showDeposit && (
        <DepositModal
          property={property}
          onClose={() => setShowDeposit(false)}
        />
      )}
    </div>
  );
}
