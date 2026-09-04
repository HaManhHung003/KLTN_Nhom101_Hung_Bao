import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  badge?: number
}

/** Client portal — marketplace IA (tiếng Việt) */
export const CLIENT_ROUTES = {
  home: '/client',
  search: '/client/tim-kiem',
  map: '/client/tim-kiem',
  buy: '/client/tim-kiem?loai=mua',
  rent: '/client/tim-kiem?loai=thue',
  activity: '/client/hoat-dong',
  saved: '/client/da-luu',
  deals: '/client/giao-dich',
  profile: '/client/ca-nhan',
  property: (id: string) => `/client/property/${id}`,
  chat: '/client/chat',
  chatbot: '/client/chat',
  auth: '/login',
} as const

/** Broker CRM workspace */
export const BROKER_ROUTES = {
  dashboard: '/broker',
  properties: '/broker/properties',
  bookings: '/broker/bookings',
  customers: '/broker/khach-hang',
  analytics: '/broker/phan-tich',
  deals: '/broker/giao-dich',
  profile: '/broker/profile',
  newProperty: '/broker/properties/create',
} as const

/** Admin ops console */
export const ADMIN_ROUTES = {
  dashboard: '/admin/dashboard',
  overview: '/admin/dashboard',
  moderation: '/admin/moderation',
  users: '/admin/users',
  transactions: '/admin/transactions',
  operations: '/admin/van-hanh',
  logs: '/admin/logs',
  settings: '/admin/settings',
} as const
