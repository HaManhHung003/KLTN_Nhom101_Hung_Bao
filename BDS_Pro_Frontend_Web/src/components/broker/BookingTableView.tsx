import { Calendar, Video } from 'lucide-react'

import type { Appointment } from '@/types'

import { BookingStatusBadge } from '@/components/broker/BookingStatusBadge'

import { formatBookingDate } from '@/components/broker/bookingUtils'



interface BookingTableViewProps {

  appointments: Appointment[]

  onSelectBooking: (booking: Appointment) => void

}



export function BookingTableView({ appointments, onSelectBooking }: BookingTableViewProps) {

  const sorted = [...appointments].sort(

    (a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime() || a.time.localeCompare(b.time),

  )



  function parseDate(dateStr: string) {

    return new Date(dateStr + 'T00:00:00')

  }



  return (

    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

      <div className="overflow-x-auto">

        <table className="w-full min-w-[640px] text-left text-sm">

          <thead className="border-b border-slate-100 bg-slate-50">

            <tr>

              <th className="px-4 py-3 font-semibold text-slate-700">Khách hàng</th>

              <th className="px-4 py-3 font-semibold text-slate-700">Bất động sản</th>

              <th className="px-4 py-3 font-semibold text-slate-700">Ngày & Giờ</th>

              <th className="px-4 py-3 font-semibold text-slate-700">Hình thức</th>

              <th className="px-4 py-3 font-semibold text-slate-700">Trạng thái</th>

            </tr>

          </thead>

          <tbody className="divide-y divide-slate-100">

            {sorted.map((apt) => (

              <tr

                key={apt.id}

                onClick={() => onSelectBooking(apt)}

                className="cursor-pointer transition hover:bg-slate-50"

              >

                <td className="px-4 py-3">

                  <p className="font-medium text-slate-900">{apt.buyerName}</p>

                  {apt.buyerPhone && <p className="text-xs text-slate-500">{apt.buyerPhone}</p>}

                </td>

                <td className="px-4 py-3">

                  <div className="flex items-center gap-3">

                    <img src={apt.propertyImage} alt="" className="h-10 w-14 rounded-lg object-cover" />

                    <p className="line-clamp-2 max-w-[200px] font-medium text-slate-800">{apt.propertyTitle}</p>

                  </div>

                </td>

                <td className="px-4 py-3">

                  <p className="flex items-center gap-1.5 font-medium text-slate-800">

                    <Calendar className="h-3.5 w-3.5 text-slate-400" />

                    {formatBookingDate(apt.date)}

                  </p>

                  <p className="text-xs text-slate-500">{apt.time}</p>

                </td>

                <td className="px-4 py-3">

                  <span className="flex items-center gap-1 text-xs text-slate-600">

                    {apt.tourType === 'video' ? <Video className="h-3.5 w-3.5" /> : null}

                    {apt.tourType === 'video' ? 'Gọi video' : 'Trực tiếp'}

                  </span>

                </td>

                <td className="px-4 py-3">

                  <BookingStatusBadge status={apt.status} />

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {sorted.length === 0 && (

        <p className="py-12 text-center text-sm text-slate-500">Không có lịch hẹn nào</p>

      )}

    </div>

  )

}

