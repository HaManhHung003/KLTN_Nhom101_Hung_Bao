import { useState } from 'react'
import { Calendar, Check, MessageSquare, User, Video, X } from 'lucide-react'
import type { Property } from '@/types'
import { bookingTimeSlots } from '@/data/mockData'
import { formatPrice } from '@/utils/format'

type TourType = 'in_person' | 'video'

interface BookingModalProps {
  property: Property
  onClose: () => void
}

export function BookingModal({ property, onClose }: BookingModalProps) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [tourType, setTourType] = useState<TourType>('in_person')
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const minDate = new Date().toISOString().split('T')[0]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!date || !time) return
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-lg animate-fade-in rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-sky-600" />
            <h2 className="font-bold text-slate-900">Đặt lịch xem nhà</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <Check className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">Đã gửi yêu cầu xem nhà!</h3>
            <p className="mt-2 text-sm text-slate-500">
              {property.ownerName} sẽ xác nhận lịch {tourType === 'video' ? 'gọi video' : 'xem trực tiếp'} vào{' '}
              {date} lúc {time}.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
            >
              Hoàn tất
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 p-5">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="line-clamp-2 font-medium text-slate-900">{property.title}</p>
              <p className="mt-1 font-bold text-sky-700">{formatPrice(property.price, property.transactionType)}</p>
            </div>

            <div>
              <label htmlFor="tour-date" className="text-sm font-medium text-slate-700">
                Ngày mong muốn
              </label>
              <input
                id="tour-date"
                type="date"
                required
                min={minDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Khung giờ</label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {bookingTimeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    className={`rounded-lg border px-2 py-2 text-sm font-medium transition ${
                      time === slot
                        ? 'border-sky-600 bg-sky-50 text-sky-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Hình thức xem</label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {(
                  [
                    { value: 'in_person' as const, label: 'Xem trực tiếp', icon: User },
                    { value: 'video' as const, label: 'Gọi video', icon: Video },
                  ] as const
                ).map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTourType(value)}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition ${
                      tourType === value
                        ? 'border-sky-600 bg-sky-50 text-sky-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="tour-note" className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <MessageSquare className="h-4 w-4" />
                Ghi chú cho môi giới
              </label>
              <textarea
                id="tour-note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Tôi muốn xem phòng ngủ chính và khu vực đậu xe..."
                className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <button
              type="submit"
              disabled={!date || !time}
              className="w-full rounded-xl bg-sky-600 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Xác nhận đặt lịch
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
