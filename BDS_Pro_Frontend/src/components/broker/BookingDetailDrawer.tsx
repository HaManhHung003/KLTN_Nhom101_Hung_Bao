import { useState } from 'react'
import {
  Calendar,
  Check,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  User,
  Video,
  X,
} from 'lucide-react'
import type { Appointment, AppointmentStatus } from '@/types'
import { BookingStatusBadge } from '@/components/broker/BookingStatusBadge'
import { formatBookingDate } from '@/components/broker/bookingUtils'
import { Link } from 'react-router-dom'
import { BROKER_ROUTES } from '@/config/routes'

interface BookingDetailDrawerProps {
  booking: Appointment | null
  onClose: () => void
  onUpdate: (id: string, patch: Partial<Appointment>) => void
}

type DrawerMode = 'view' | 'reschedule' | 'decline'

export function BookingDetailDrawer({ booking, onClose, onUpdate }: BookingDetailDrawerProps) {
  const [mode, setMode] = useState<DrawerMode>('view')
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [declineNote, setDeclineNote] = useState('')

  if (!booking) return null

  const apt = booking

  function resetMode() {
    setMode('view')
    setRescheduleDate(apt.date)
    setRescheduleTime(apt.time)
    setDeclineNote('')
  }

  function handleClose() {
    resetMode()
    onClose()
  }

  function approve() {
    onUpdate(apt.id, { status: 'confirmed' as AppointmentStatus })
    handleClose()
  }

  function confirmReschedule() {
    if (!rescheduleDate || !rescheduleTime) return
    onUpdate(apt.id, {
      date: rescheduleDate,
      time: rescheduleTime,
      status: 'pending',
      note: `Đề xuất đổi lịch: ${rescheduleDate} lúc ${rescheduleTime}. ${apt.note ?? ''}`.trim(),
    })
    handleClose()
  }

  function confirmDecline() {
    onUpdate(apt.id, {
      status: 'cancelled',
      note: declineNote ? `Từ chối: ${declineNote}` : 'Môi giới đã từ chối',
    })
    handleClose()
  }

  const canAct = apt.status === 'pending' || apt.status === 'confirmed'

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={handleClose} aria-hidden />

      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl sm:max-w-lg">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-bold text-slate-900">Chi tiết lịch hẹn</h2>
          <button type="button" onClick={handleClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex items-center justify-between">
            <BookingStatusBadge status={apt.status} />
            {apt.tourType && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                {apt.tourType === 'video' ? <Video className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                {apt.tourType === 'video' ? 'Gọi video' : 'Xem trực tiếp'}
              </span>
            )}
          </div>

          {/* Property card */}
          <Link
            to={`${BROKER_ROUTES.properties}`}
            className="mt-4 flex gap-3 rounded-xl border border-slate-200 p-3 transition hover:bg-slate-50"
          >
            <img src={apt.propertyImage} alt="" className="h-20 w-28 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 line-clamp-2">{apt.propertyTitle}</p>
              <p className="mt-1 text-xs text-emerald-600">Xem bất động sản →</p>
            </div>
          </Link>

          {/* Customer */}
          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <User className="h-4 w-4" />
              Khách hàng
            </h3>
            <p className="mt-2 font-medium text-slate-800">{apt.buyerName}</p>
            {apt.buyerPhone && (
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                <Phone className="h-3.5 w-3.5" /> {apt.buyerPhone}
              </p>
            )}
            {apt.buyerEmail && (
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                <Mail className="h-3.5 w-3.5" /> {apt.buyerEmail}
              </p>
            )}
          </div>

          {/* Schedule */}
          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Calendar className="h-4 w-4" />
              Lịch yêu cầu
            </h3>
            <p className="mt-2 text-lg font-semibold text-slate-900">{formatBookingDate(apt.date)}</p>
            <p className="flex items-center gap-2 text-slate-600">
              <Clock className="h-4 w-4" /> {apt.time}
            </p>
            {apt.note && (
              <p className="mt-3 flex gap-2 rounded-lg bg-white p-3 text-sm text-slate-600">
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                {apt.note}
              </p>
            )}
          </div>

          {/* Reschedule form */}
          {mode === 'reschedule' && (
            <div className="mt-4 space-y-3 rounded-xl border border-sky-200 bg-sky-50 p-4">
              <h4 className="text-sm font-bold text-sky-900">Đề xuất thời gian mới</h4>
              <input
                type="date"
                value={rescheduleDate || apt.date}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <select
                value={rescheduleTime || apt.time}
                onChange={(e) => setRescheduleTime(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {['09:00', '10:00', '11:00', '14:00', '14:30', '15:00', '16:00', '17:00'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button type="button" onClick={confirmReschedule} className="flex-1 rounded-lg bg-sky-600 py-2 text-sm font-semibold text-white">
                  Gửi đề xuất
                </button>
                <button type="button" onClick={resetMode} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">
                  Hủy
                </button>
              </div>
            </div>
          )}

          {/* Decline form */}
          {mode === 'decline' && (
            <div className="mt-4 space-y-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <h4 className="text-sm font-bold text-red-900">Từ chối kèm ghi chú</h4>
              <textarea
                rows={3}
                value={declineNote}
                onChange={(e) => setDeclineNote(e.target.value)}
                placeholder="Lý do từ chối (gửi cho khách hàng)..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button type="button" onClick={confirmDecline} className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white">
                  Xác nhận từ chối
                </button>
                <button type="button" onClick={resetMode} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick actions */}
        {canAct && mode === 'view' && (
          <div className="space-y-2 border-t border-slate-100 p-5">
            {apt.status === 'pending' && (
              <button
                type="button"
                onClick={approve}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <Check className="h-4 w-4" />
                Duyệt lịch hẹn
              </button>
            )}
            <button
              type="button"
              onClick={() => { setRescheduleDate(apt.date); setRescheduleTime(apt.time); setMode('reschedule') }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-medium hover:bg-slate-50"
            >
              <Clock className="h-4 w-4" />
              Đề xuất đổi lịch
            </button>
            <button
              type="button"
              onClick={() => setMode('decline')}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
              Từ chối kèm ghi chú
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
