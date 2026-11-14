import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Appointment } from '@/types'
import {
  addDays,
  appointmentsForDay,
  calendarCardColor,
  formatBookingDate,
  getMonthGrid,
  isSameDay,
  startOfWeek,
  toDateString,
} from '@/components/broker/bookingUtils'

interface BookingCalendarViewProps {
  appointments: Appointment[]
  calendarMode: 'month' | 'week'
  focusDate: Date
  onFocusDateChange: (date: Date) => void
  onSelectBooking: (booking: Appointment) => void
}

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

export function BookingCalendarView({
  appointments,
  calendarMode,
  focusDate,
  onFocusDateChange,
  onSelectBooking,
}: BookingCalendarViewProps) {
  const today = new Date()

  function navigate(delta: number) {
    const next = new Date(focusDate)
    if (calendarMode === 'month') {
      next.setMonth(next.getMonth() + delta)
    } else {
      next.setDate(next.getDate() + delta * 7)
    }
    onFocusDateChange(next)
  }

  if (calendarMode === 'week') {
    const weekStart = startOfWeek(focusDate)
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

    return (
      <div className="rounded-2xl border border-slate-200 bg-white">
        <CalendarHeader
          label={`${formatBookingDate(toDateString(days[0]))} – ${formatBookingDate(toDateString(days[6]))}`}
          onPrev={() => navigate(-1)}
          onNext={() => navigate(1)}
        />
        <div className="grid grid-cols-7 border-t border-slate-100">
          {days.map((day) => {
            const dayAppts = appointmentsForDay(appointments, day)
            const isToday = isSameDay(day, today)
            return (
              <div key={day.toISOString()} className="min-h-[280px] border-r border-slate-100 last:border-r-0">
                <div className={`border-b border-slate-100 px-2 py-2 text-center ${isToday ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                  <p className="text-[10px] font-medium uppercase text-slate-400">
                    {day.toLocaleDateString('vi-VN', { weekday: 'short' })}
                  </p>
                  <p className={`text-sm font-bold ${isToday ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {day.getDate()}
                  </p>
                </div>
                <div className="space-y-1.5 p-1.5">
                  {dayAppts.map((apt) => (
                    <CalendarBookingCard key={apt.id} booking={apt} onClick={() => onSelectBooking(apt)} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const year = focusDate.getFullYear()
  const month = focusDate.getMonth()
  const grid = getMonthGrid(year, month)
  const monthLabel = focusDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <CalendarHeader label={monthLabel} onPrev={() => navigate(-1)} onNext={() => navigate(1)} />
      <div className="grid grid-cols-7 border-t border-slate-100 bg-slate-50">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-semibold uppercase text-slate-500">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {grid.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-slate-100 bg-slate-50/50" />
          }
          const dayAppts = appointmentsForDay(appointments, day)
          const isToday = isSameDay(day, today)
          const inMonth = day.getMonth() === month

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[100px] border-b border-r border-slate-100 p-1 ${inMonth ? 'bg-white' : 'bg-slate-50/50'}`}
            >
              <p className={`mb-1 text-right text-xs font-medium ${isToday ? 'text-emerald-600' : 'text-slate-500'}`}>
                {isToday ? (
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                    {day.getDate()}
                  </span>
                ) : (
                  day.getDate()
                )}
              </p>
              <div className="space-y-1">
                {dayAppts.slice(0, 2).map((apt) => (
                  <CalendarBookingCard key={apt.id} booking={apt} compact onClick={() => onSelectBooking(apt)} />
                ))}
                {dayAppts.length > 2 && (
                  <p className="text-[10px] text-slate-400">+{dayAppts.length - 2} lịch khác</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CalendarHeader({ label, onPrev, onNext }: { label: string; onPrev: () => void; onNext: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <button type="button" onClick={onPrev} className="rounded-lg p-2 hover:bg-slate-100">
        <ChevronLeft className="h-5 w-5 text-slate-600" />
      </button>
      <h3 className="font-bold text-slate-900">{label}</h3>
      <button type="button" onClick={onNext} className="rounded-lg p-2 hover:bg-slate-100">
        <ChevronRight className="h-5 w-5 text-slate-600" />
      </button>
    </div>
  )
}

function CalendarBookingCard({
  booking,
  compact,
  onClick,
}: {
  booking: Appointment
  compact?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg border-l-4 px-2 py-1.5 text-left transition hover:opacity-80 ${calendarCardColor(booking.status)}`}
    >
      <p className={`font-semibold text-slate-800 ${compact ? 'truncate text-[10px]' : 'text-xs'}`}>
        {booking.time} · {booking.buyerName.split(' ').pop()}
      </p>
      {!compact && (
        <p className="truncate text-[10px] text-slate-600">{booking.propertyTitle}</p>
      )}
    </button>
  )
}
