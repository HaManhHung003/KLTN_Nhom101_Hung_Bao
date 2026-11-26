import { useParams, Link } from 'react-router-dom'
import {
  Calendar,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Shield,
} from 'lucide-react'
import { properties } from '@/data/mockData'
import { Badge } from '@/components/common/Badge'
import { MapPlaceholder } from '@/components/common/MapPlaceholder'
import {
  formatPrice,
  legalLabels,
  propertyTypeLabels,
  transactionLabels,
} from '@/utils/format'

export function PropertyDetail() {
  const { id } = useParams()
  const property = properties.find((p) => p.id === id) ?? properties[0]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl">
            <img src={property.images[0]} alt={property.title} className="aspect-video w-full object-cover" />
          </div>
          {property.images.length > 1 && (
            <div className="mt-2 flex gap-2">
              {property.images.map((img) => (
                <img key={img} src={img} alt="" className="h-20 w-28 rounded-lg object-cover" />
              ))}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-2xl font-bold text-brand-700">
            {formatPrice(property.price, property.transactionType)}
          </p>
          <h1 className="mt-2 text-xl font-bold text-slate-900">{property.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge className="bg-brand-100 text-brand-700">{transactionLabels[property.transactionType]}</Badge>
            <Badge className="bg-slate-100 text-slate-600">{propertyTypeLabels[property.type]}</Badge>
            <Badge className="bg-slate-100 text-slate-600">{legalLabels[property.legalStatus]}</Badge>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
            <MapPin className="h-4 w-4" />
            {property.address}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="font-bold text-slate-900">{property.area}m²</p>
              <p className="text-slate-500">Diện tích</p>
            </div>
            {property.bedrooms && (
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="font-bold text-slate-900">{property.bedrooms} PN</p>
                <p className="text-slate-500">Phòng ngủ</p>
              </div>
            )}
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="font-bold text-slate-900">{property.viewCount}</p>
              <p className="text-slate-500">Lượt xem</p>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <button type="button" className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700">
              <Calendar className="h-4 w-4" />
              Đặt lịch xem
            </button>
            <button type="button" className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-600 py-3 font-semibold text-brand-600 hover:bg-brand-50">
              <Shield className="h-4 w-4" />
              Đặt cọc online
            </button>
            <div className="flex gap-2">
              <Link to="/buyer/chat" className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-medium hover:bg-slate-50">
                <MessageCircle className="h-4 w-4" />
                Chat môi giới
              </Link>
              <button type="button" className="rounded-xl border border-slate-200 p-2.5 hover:bg-slate-50">
                <Heart className="h-4 w-4" />
              </button>
              <button type="button" className="rounded-xl border border-slate-200 p-2.5 hover:bg-slate-50">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
            <img src={`https://i.pravatar.cc/150?u=${property.ownerId}`} alt="" className="h-10 w-10 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">{property.ownerName}</p>
              <p className="text-sm text-slate-500">Môi giới · Đã xác minh</p>
            </div>
            <button type="button" className="ml-auto rounded-xl bg-slate-100 p-2">
              <Phone className="h-4 w-4 text-brand-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-bold text-slate-900">Mô tả</h2>
          <p className="mt-3 text-slate-600 leading-relaxed">{property.description}</p>
          <h3 className="mt-6 font-bold text-slate-900">Tiện ích xung quanh</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {property.amenities.map((a) => (
              <Badge key={a} className="bg-slate-100 text-slate-600">{a}</Badge>
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-3 font-bold text-slate-900">Vị trí trên bản đồ</h2>
          <MapPlaceholder properties={[property]} selectedId={property.id} height="280px" />
        </div>
      </div>
    </div>
  )
}
