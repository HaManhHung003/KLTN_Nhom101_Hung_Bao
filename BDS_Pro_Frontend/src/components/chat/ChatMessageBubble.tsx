import { Calendar, Check, CheckCheck, Clock, MapPin, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ChatMessage } from '@/types/chat'
import { CLIENT_ROUTES } from '@/config/routes'

const STATUS_LABELS = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  no_show: 'Không đến',
} as const

function ReadReceipt({ read, isOwn }: { read?: boolean; isOwn: boolean }) {
  if (!isOwn) return null
  return read ? (
    <CheckCheck className="h-3.5 w-3.5 text-sky-200" aria-label="Đã đọc" />
  ) : (
    <Check className="h-3.5 w-3.5 text-sky-200/70" aria-label="Đã gửi" />
  )
}

function BookingInviteCard({ message }: { message: ChatMessage }) {
  const b = message.booking!
  return (
    <div className="mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <img src={b.propertyImage} alt="" className="h-24 w-full object-cover" />
      <div className="p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">Lời mời xem nhà</p>
        <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">{b.propertyTitle}</p>
        <div className="mt-2 space-y-1 text-xs text-slate-600">
          <p className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-sky-500" />
            {new Date(b.date + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'short', month: 'short', day: 'numeric' })}
            · {b.time}
          </p>
          <p className="flex items-center gap-1.5 capitalize">
            {b.tourType === 'video' ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
            {b.tourType === 'video' ? 'Xem qua video' : 'Xem trực tiếp'}
          </p>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              b.status === 'confirmed'
                ? 'bg-emerald-100 text-emerald-700'
                : b.status === 'pending'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-slate-100 text-slate-600'
            }`}
          >
            {STATUS_LABELS[b.status]}
          </span>
          <Link
            to={`${CLIENT_ROUTES.activity}?tab=lich-hen`}
            className="text-xs font-medium text-sky-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Xem lịch hẹn →
          </Link>
        </div>
      </div>
    </div>
  )
}

export function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isOwn = message.isOwn

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[78%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-2.5 shadow-sm ${
            isOwn
              ? 'rounded-br-md bg-sky-600 text-white'
              : 'rounded-bl-md bg-slate-100 text-slate-900'
          }`}
        >
          {message.type === 'text' && (
            <p className="text-sm leading-relaxed">{message.content}</p>
          )}

          {message.type === 'image' && message.imageUrl && (
            <div>
              {message.content && message.content !== 'Tour invitation' && message.content !== 'Lời mời xem nhà' && (
                <p className="mb-2 text-sm">{message.content}</p>
              )}
              <img
                src={message.imageUrl}
                alt="Ảnh đính kèm"
                className="max-h-48 rounded-lg object-cover"
              />
            </div>
          )}

          {message.type === 'booking' && message.booking && (
            <BookingInviteCard message={message} />
          )}
        </div>

        <div
          className={`mt-1 flex items-center gap-1.5 px-1 ${
            isOwn ? 'flex-row-reverse' : ''
          }`}
        >
          <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
            <Clock className="h-3 w-3" />
            {message.time}
          </span>
          <ReadReceipt read={message.read} isOwn={isOwn} />
        </div>
      </div>
    </div>
  )
}
