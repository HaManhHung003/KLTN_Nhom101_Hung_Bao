import type { Appointment, AppointmentStatus } from '@/types'

export const BOOKING_STATUS: Record<  AppointmentStatus,
  { label: string; className: string }
> = {
  pending: { label: 'Chờ xác nhận', className: 'bg-amber-100 text-amber-800' },
  confirmed: { label: 'Đã xác nhận', className: 'bg-emerald-100 text-emerald-800' },
  completed: { label: 'Hoàn thành', className: 'bg-blue-100 text-blue-800' },
  cancelled: { label: 'Đã hủy', className: 'bg-red-100 text-red-800' },
  no_show: { label: 'Không đến', className: 'bg-slate-100 text-slate-600' },
}

export function formatBookingDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('vi-VN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00')
}

export function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function getMonthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startPad = first.getDay() === 0 ? 6 : first.getDay() - 1
  const cells: (Date | null)[] = Array.from({ length: startPad }, () => null)
  for (let d = 1; d <= last.getDate(); d++) {
    cells.push(new Date(year, month, d))
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export function appointmentsForDay(appointments: Appointment[], day: Date): Appointment[] {
  return appointments.filter((a) => isSameDay(parseDate(a.date), day))
}

export function calendarCardColor(status: AppointmentStatus): string {
  switch (status) {
    case 'pending': return 'border-l-amber-500 bg-amber-50'
    case 'confirmed': return 'border-l-emerald-500 bg-emerald-50'
    case 'completed': return 'border-l-blue-500 bg-blue-50'
    case 'cancelled': return 'border-l-red-400 bg-red-50'
    default: return 'border-l-slate-400 bg-slate-50'
  }
}
