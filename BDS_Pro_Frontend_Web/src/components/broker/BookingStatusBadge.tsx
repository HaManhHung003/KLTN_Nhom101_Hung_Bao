import type { AppointmentStatus } from '@/types'
import { Badge } from '@/components/common/Badge'
import { BOOKING_STATUS } from '@/components/broker/bookingUtils'

export function BookingStatusBadge({ status }: { status: AppointmentStatus }) {
  const cfg = BOOKING_STATUS[status]
  return <Badge className={cfg.className}>{cfg.label}</Badge>
}
