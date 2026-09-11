import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Calendar,
  Check,
  Edit,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Shield,
  X,
  Flag,
} from 'lucide-react'
import { properties, currentUsers } from '@/data/mockData'
import { Badge } from '@/components/common/Badge'
import { DepositModal } from '@/components/common/DepositModal'
import { MapPlaceholder } from '@/components/common/MapPlaceholder'
import {
  formatPrice,
  legalLabels,
  propertyTypeLabels,
  statusColors,
  statusLabels,
  transactionLabels,
} from '@/utils/format'
import type { UserRole } from '@/types'

interface PropertyDetailViewProps {
  role: UserRole
  basePath: string
}

export function PropertyDetailView({ role, basePath }: PropertyDetailViewProps) {
  const { id } = useParams()
  const property = properties.find((p) => p.id === id) ?? properties[0]
  const [showDeposit, setShowDeposit] = useState(false)
  const isOwner = property.ownerId === currentUsers.agent.id
  const chatPath =
    role === 'buyer' ? '/client/chat' : role === 'agent' ? '/broker/khach-hang?tab=hop-thu' : '/admin/van-hanh?tab=chat'
  const appointmentsPath =
    role === 'buyer' ? '/client/hoat-dong?tab=lich-hen' : role === 'agent' ? '/broker/bookings' : '/admin/van-hanh?tab=lich-hen'

  return (
    <>
      <div className="mx-auto max-w-6xl space-y-6">
        {role === 'admin' && (
          <div className="flex flex-wrap gap-2 rounded-2xl border border-violet-200 bg-violet-50 p-4">
            <span className="text-sm font-medium text-violet-800">Chế độ giám sát Admin</span>
            <button type="button" className="ml-auto inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white">
              <Check className="h-3.5 w-3.5" /> Duyệt tin
            </button>
            <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600">
              <X className="h-3.5 w-3.5" /> Từ chối
            </button>
            <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium">
              <Flag className="h-3.5 w-3.5" /> Đánh dấu vi phạm
            </button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl shadow-md">
              <img src={property.images[0]} alt={property.title} className="aspect-video w-full object-cover" />
            </div>
            {property.images.length > 1 && (
              <div className="mt-2 flex gap-2">
                {property.images.map((img) => (
                  <img key={img} src={img} alt="" className="h-20 w-28 rounded-lg object-cover ring-1 ring-slate-200" />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <Badge className={statusColors[property.status]}>{statusLabels[property.status]}</Badge>
              {property.aiScore && role !== 'admin' && (
                <Badge className="bg-violet-100 text-violet-700">AI {property.aiScore}%</Badge>
              )}
            </div>
            <p className="mt-3 text-2xl font-bold text-brand-700">
              {formatPrice(property.price, property.transactionType)}
            </p>
            <h1 className="mt-2 text-xl font-bold text-slate-900">{property.title}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge className="bg-brand-100 text-brand-700">{transactionLabels[property.transactionType]}</Badge>
              <Badge className="bg-slate-100 text-slate-600">{propertyTypeLabels[property.type]}</Badge>
              <Badge className="bg-slate-100 text-slate-600">{legalLabels[property.legalStatus]}</Badge>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="h-4 w-4 shrink-0" />
              {property.address}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="font-bold text-slate-900">{property.area}m²</p>
                <p className="text-slate-500">Diện tích</p>
              </div>
              {property.bedrooms ? (
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="font-bold text-slate-900">{property.bedrooms} PN</p>
                  <p className="text-slate-500">Phòng ngủ</p>
                </div>
              ) : (
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="font-bold text-slate-900">—</p>
                  <p className="text-slate-500">Phòng ngủ</p>
                </div>
              )}
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="font-bold text-slate-900">{property.viewCount}</p>
                <p className="text-slate-500">Lượt xem</p>
              </div>
            </div>

            {/* Buyer actions */}
            {role === 'buyer' && (
              <div className="mt-6 space-y-2">
                <Link to={appointmentsPath} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700">
                  <Calendar className="h-4 w-4" /> Đặt lịch xem
                </Link>
                <button type="button" onClick={() => setShowDeposit(true)} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-brand-600 py-3 font-semibold text-brand-600 hover:bg-brand-50">
                  <Shield className="h-4 w-4" /> Đặt cọc online
                </button>
                <div className="flex gap-2">
                  <Link to={chatPath} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-medium hover:bg-slate-50">
                    <MessageCircle className="h-4 w-4" /> Chat môi giới
                  </Link>
                  <button type="button" className="rounded-xl border border-slate-200 p-2.5 hover:bg-red-50 hover:text-red-500">
                    <Heart className="h-4 w-4" />
                  </button>
                  <button type="button" className="rounded-xl border border-slate-200 p-2.5 hover:bg-slate-50">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Agent actions */}
            {role === 'agent' && (
              <div className="mt-6 space-y-2">
                {isOwner ? (
                  <>
                    <Link to={`${basePath}/properties/${property.id}/edit`} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700">
                      <Edit className="h-4 w-4" /> Sửa tin đăng
                    </Link>
                    <Link to={`${basePath}/analytics`} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 font-medium hover:bg-slate-50">
                      <Eye className="h-4 w-4" /> Xem thống kê tin
                    </Link>
                  </>
                ) : (
                  <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                    Xem thị trường — tin của {property.ownerName}
                  </p>
                )}
                <Link to={chatPath} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-medium hover:bg-slate-50">
                  <MessageCircle className="h-4 w-4" /> Liên hệ / Chat
                </Link>
              </div>
            )}

            {/* Admin view */}
            {role === 'admin' && (
              <div className="mt-6 space-y-2 text-sm text-slate-600">
                <p><strong>Chủ tin:</strong> {property.ownerName}</p>
                <p><strong>Ngày đăng:</strong> {property.createdAt}</p>
                <p><strong>Yêu thích:</strong> {property.favoriteCount} · <strong>Lead ước tính:</strong> {Math.floor(property.viewCount / 30)}</p>
                <Link to="/admin/chat" className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-medium hover:bg-slate-50">
                  <Eye className="h-4 w-4" /> Giám sát chat liên quan
                </Link>
              </div>
            )}

            <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
              <img src={`https://i.pravatar.cc/150?u=${property.ownerId}`} alt="" className="h-10 w-10 rounded-full ring-2 ring-brand-100" />
              <div>
                <p className="font-semibold text-slate-900">{property.ownerName}</p>
                <p className="text-sm text-slate-500">Môi giới · Đã xác minh</p>
              </div>
              {role === 'buyer' && (
                <button type="button" className="ml-auto rounded-xl bg-brand-50 p-2.5 hover:bg-brand-100">
                  <Phone className="h-4 w-4 text-brand-600" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-900">Mô tả chi tiết</h2>
            <p className="mt-3 leading-relaxed text-slate-600">{property.description}</p>
            <h3 className="mt-6 font-bold text-slate-900">Tiện ích xung quanh (POI)</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {property.amenities.map((a) => (
                <Badge key={a} className="bg-slate-100 text-slate-600">{a}</Badge>
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-3 font-bold text-slate-900">Vị trí trên bản đồ</h2>
            <MapPlaceholder properties={[property]} selectedId={property.id} height="280px" />
            <p className="mt-2 text-xs text-slate-400">GPS: {property.latitude}, {property.longitude}</p>
          </div>
        </div>
      </div>

      {showDeposit && <DepositModal property={property} onClose={() => setShowDeposit(false)} />}
    </>
  )
}
