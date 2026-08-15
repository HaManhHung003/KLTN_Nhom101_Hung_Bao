import {
  BarChart3,
  CalendarDays,
  HandCoins,
  LayoutDashboard,
  Package,
  Users,
  Building2,
} from 'lucide-react'
import { BROKER_ROUTES } from '@/config/routes'
import type { NavItem } from '@/config/routes'
import { conversations } from '@/data/mockData'

const unread = conversations.reduce((s, c) => s + c.unread, 0)

export const brokerNav: NavItem[] = [
  { label: 'Tổng quan', path: BROKER_ROUTES.dashboard, icon: LayoutDashboard },
  { label: 'Tin đăng', path: BROKER_ROUTES.properties, icon: Building2 },
  { label: 'Khách hàng & Lead', path: BROKER_ROUTES.customers, icon: Users, badge: unread || 3 },
  { label: 'Lịch hẹn xem nhà', path: BROKER_ROUTES.bookings, icon: CalendarDays },
  { label: 'Giao dịch', path: BROKER_ROUTES.deals, icon: HandCoins },
  { label: 'Phân tích', path: BROKER_ROUTES.analytics, icon: BarChart3 },
  { label: 'Hồ sơ & Gói tin', path: BROKER_ROUTES.profile, icon: Package },
]
