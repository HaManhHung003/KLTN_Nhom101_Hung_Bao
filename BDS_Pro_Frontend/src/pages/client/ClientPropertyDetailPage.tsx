import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Award,
  Bath,
  BedDouble,
  Calendar,
  ChevronRight,
  Grid3X3,
  Hospital,
  MapPin,
  MessageCircle,
  Ruler,
  School,
  Shield,
  ShoppingCart,
  Star,
} from 'lucide-react'
import { properties, propertyPOIs, defaultPOIs, currentUsers } from '@/data/mockData'
import { BookingModal } from '@/components/client/BookingModal'
import { Badge } from '@/components/common/Badge'
import { DepositModal } from '@/components/common/DepositModal'
import {
  formatPrice,
  isVerifiedLegal,
  legalLabels,
  propertyTypeLabels,
  transactionLabels,
} from '@/utils/format'
import { CLIENT_ROUTES } from '@/config/routes'
import type { PoiCategory, PointOfInterest } from '@/types'

const POI_ICONS: Record<PoiCategory, typeof School> = {
  school: School,
  hospital: Hospital,
  supermarket: ShoppingCart,
}

const POI_LABELS: Record<PoiCategory, string> = {
  school: 'Trường học',
  hospital: 'Bệnh viện',
  supermarket: 'Siêu thị',
}

function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`
  return `${meters} m`
}

export function ClientPropertyDetailPage() {
  const { id } = useParams()
  const property = properties.find((p) => p.id === id) ?? properties[0]
  const pois = propertyPOIs[property.id] ?? defaultPOIs
  const [showGallery, setShowGallery] = useState(false)
  const [showBooking, setShowBooking] = useState(false)
  const [showDeposit, setShowDeposit] = useState(false)
  const [activePoiCategory, setActivePoiCategory] = useState<PoiCategory | 'all'>('all')

  const images = property.images.length >= 5
    ? property.images
    : [
        ...property.images,
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      ].slice(0, 5)

  const mainImage = images[0]
  const thumbs = images.slice(1, 5)
  const verified = isVerifiedLegal(property.legalStatus)
  const broker = currentUsers.agent

  const filteredPois =
    activePoiCategory === 'all' ? pois : pois.filter((p) => p.category === activePoiCategory)

  const poiCategories: (PoiCategory | 'all')[] = ['all', 'school', 'hospital', 'supermarket']

  return (
    <>
      <div className="mx-auto max-w-6xl pb-24 lg:pb-0">
        {/* Hero gallery */}
        <div className="overflow-hidden rounded-2xl">
          <div className="grid gap-2 md:grid-cols-4 md:grid-rows-2">
            <div className="relative md:col-span-2 md:row-span-2">
              <img src={mainImage} alt={property.title} className="aspect-[4/3] h-full w-full object-cover md:aspect-auto md:min-h-[420px]" />
              {verified && (
                <Badge className="absolute left-4 top-4 flex items-center gap-1 bg-emerald-600 text-white">
                  Pháp lý xác thực · {legalLabels[property.legalStatus]}
                </Badge>
              )}
            </div>
            {thumbs.map((img, i) => (
              <div key={img} className={`relative hidden overflow-hidden md:block ${i === 3 ? 'group' : ''}`}>
                <img src={img} alt="" className="aspect-[4/3] h-full w-full object-cover" />
                {i === 3 && (
                  <button
                    type="button"
                    onClick={() => setShowGallery(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100"
                  >
                    <Grid3X3 className="mr-2 h-4 w-4" />
                    Xem tất cả {images.length} ảnh
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowGallery(true)}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 md:hidden"
          >
            <Grid3X3 className="h-4 w-4" />
            Xem tất cả {images.length} ảnh
          </button>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-8 lg:col-span-2">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-sky-100 text-sky-700">{transactionLabels[property.transactionType]}</Badge>
                <Badge className="bg-slate-100 text-slate-600">{propertyTypeLabels[property.type]}</Badge>
              </div>
              <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">{property.title}</h1>
              <div className="mt-2 flex items-start gap-2 text-slate-500">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{property.address}, {property.district}, {property.city}</span>
              </div>
              <p className="mt-4 text-3xl font-bold text-sky-700">
                {formatPrice(property.price, property.transactionType)}
              </p>
            </div>

            {/* Specs grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: Ruler, label: 'Diện tích', value: `${property.area} m²` },
                { icon: BedDouble, label: 'Phòng ngủ', value: property.bedrooms ?? '—' },
                { icon: Bath, label: 'Phòng tắm', value: property.bathrooms ?? '—' },
                { icon: Award, label: 'Pháp lý', value: legalLabels[property.legalStatus] },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                  <Icon className="mx-auto h-5 w-5 text-sky-600" />
                  <p className="mt-2 text-lg font-bold text-slate-900">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Giới thiệu bất động sản</h2>
              <p className="mt-3 leading-relaxed text-slate-600">{property.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {property.amenities.map((a) => (
                  <Badge key={a} className="bg-slate-100 text-slate-600">{a}</Badge>
                ))}
              </div>
            </div>

            {/* Surrounding amenities */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Tiện ích xung quanh</h2>
              <p className="mt-1 text-sm text-slate-500">Trong bán kính tìm kiếm — trường học, bệnh viện, siêu thị</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {poiCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActivePoiCategory(cat)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                      activePoiCategory === cat
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'all' ? 'Tất cả' : POI_LABELS[cat]}
                  </button>
                ))}
              </div>

              <ul className="mt-4 divide-y divide-slate-100">
                {filteredPois.map((poi: PointOfInterest) => {
                  const Icon = POI_ICONS[poi.category]
                  return (
                    <li key={poi.id} className="flex items-center gap-4 py-3 transition hover:bg-slate-50">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50">
                        <Icon className="h-5 w-5 text-sky-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900">{poi.name}</p>
                        <p className="text-xs capitalize text-slate-500">{POI_LABELS[poi.category]}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-sky-600">{formatDistance(poi.distance)}</p>
                        {poi.rating && (
                          <p className="flex items-center justify-end gap-0.5 text-xs text-slate-500">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {poi.rating}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* Sticky sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <img
                  src={broker.avatar}
                  alt={property.ownerName}
                  className="h-14 w-14 rounded-full ring-2 ring-sky-100"
                />
                <div>
                  <p className="font-bold text-slate-900">{property.ownerName}</p>
                  <Badge className="mt-1 flex w-fit items-center gap-1 bg-amber-100 text-amber-800">
                    <Award className="h-3 w-3" />
                    Môi giới hàng đầu
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-slate-500">
                Môi giới có giấy phép · {property.viewCount.toLocaleString('vi-VN')} lượt xem · Phản hồi trong 1 giờ
              </p>

              <button
                type="button"
                onClick={() => setShowBooking(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-3.5 font-semibold text-white transition hover:bg-sky-700"
              >
                Đặt lịch xem nhà
              </button>

              <button
                type="button"
                onClick={() => setShowDeposit(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-emerald-600 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                <Shield className="h-4 w-4" />
                Đặt cọc an toàn
              </button>

              <Link
                to={CLIENT_ROUTES.chat}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <MessageCircle className="h-4 w-4" />
                Chat trực tiếp
              </Link>

              <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-400">
                Đặt lịch miễn phí · Cọc qua escrow bảo vệ giao dịch
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full gallery modal */}
      {showGallery && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
          <div className="flex items-center justify-between px-4 py-4 text-white">
            <span className="font-medium">{images.length} ảnh</span>
            <button type="button" onClick={() => setShowGallery(false)} className="rounded-lg px-4 py-2 hover:bg-white/10">
              Đóng
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2">
              {images.map((img) => (
                <img key={img} src={img} alt="" className="w-full rounded-xl object-cover" />
              ))}
            </div>
          </div>
        </div>
      )}

      {showBooking && <BookingModal property={property} onClose={() => setShowBooking(false)} />}
      {showDeposit && <DepositModal property={property} onClose={() => setShowDeposit(false)} />}

      {/* Sticky CTA — mobile */}
      <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-3 gap-1.5">
          <Link
            to={CLIENT_ROUTES.chat}
            className="flex flex-col items-center justify-center gap-0.5 rounded-xl border border-slate-200 py-2.5 text-[11px] font-semibold text-slate-700"
          >
            <MessageCircle className="h-4 w-4" />
            Chat
          </Link>
          <button
            type="button"
            onClick={() => setShowDeposit(true)}
            className="flex flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-emerald-600 py-2.5 text-[11px] font-semibold text-emerald-700"
          >
            <Shield className="h-4 w-4" />
            Đặt cọc
          </button>
          <button
            type="button"
            onClick={() => setShowBooking(true)}
            className="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-sky-600 py-2.5 text-[11px] font-semibold text-white"
          >
            <Calendar className="h-4 w-4" />
            Xem nhà
          </button>
        </div>
      </div>
    </>
  )
}
