import { useMemo, useState } from 'react'
import { CalendarDays, LayoutGrid, List, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BookingCalendarView } from '@/components/broker/BookingCalendarView'
import { BookingDetailDrawer } from '@/components/broker/BookingDetailDrawer'
import { BookingTableView } from '@/components/broker/BookingTableView'
import { BOOKING_STATUS } from '@/components/broker/bookingUtils'
import { appointments as seedAppointments, currentUsers } from '@/data/mockData'
import { BROKER_ROUTES } from '@/config/routes'
import type { Appointment } from '@/types'

type ViewMode = 'calendar' | 'table'
type CalendarMode = 'month' | 'week'

const CALENDAR_MODE_LABELS: Record<CalendarMode, string> = {
  month: 'Tháng',
  week: 'Tuần',
}

export function BrokerBookingsPage() {
  const [bookings, setBookings] = useState<Appointment[]>(
    () => seedAppointments.filter((a) => a.agentId === currentUsers.agent.id),
  )
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('month')
  const [focusDate, setFocusDate] = useState(new Date('2026-08-15'))
  const [selected, setSelected] = useState<Appointment | null>(null)

  const stats = useMemo(() => ({
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  }), [bookings])

  function updateBooking(id: string, patch: Partial<Appointment>) {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)))
    setSelected((prev) => (prev?.id === id ? { ...prev, ...patch } : prev))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý lịch hẹn</h1>
          <p className="text-slate-500">Xem lịch và bảng — duyệt, đổi lịch hoặc từ chối yêu cầu xem nhà</p>
        </div>
        <Link
          to={BROKER_ROUTES.newProperty}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Đăng tin mới
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(['pending', 'confirmed', 'completed', 'cancelled'] as const).map((key) => (
          <div key={key} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-2xl font-bold text-slate-900">{stats[key]}</p>
            <p className={`mt-1 text-xs font-medium ${BOOKING_STATUS[key].className} inline-block rounded-full px-2 py-0.5`}>
              {BOOKING_STATUS[key].label}
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
              viewMode === 'calendar' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Lịch
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
              viewMode === 'table' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            <List className="h-4 w-4" />
            Bảng
          </button>
        </div>

        {viewMode === 'calendar' && (
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
              {(['month', 'week'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setCalendarMode(mode)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                    calendarMode === mode ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {CALENDAR_MODE_LABELS[mode]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Views */}
      {viewMode === 'calendar' ? (
        <BookingCalendarView
          appointments={bookings}
          calendarMode={calendarMode}
          focusDate={focusDate}
          onFocusDateChange={setFocusDate}
          onSelectBooking={setSelected}
        />
      ) : (
        <BookingTableView appointments={bookings} onSelectBooking={setSelected} />
      )}

      <BookingDetailDrawer
        booking={selected}
        onClose={() => setSelected(null)}
        onUpdate={updateBooking}
      />
    </div>
  )
}
