import type { LegalStatus, PropertyType, TransactionType } from '@/types'

export interface MediaFile {
  id: string
  name: string
  url: string
  type: 'image' | 'video'
}

export interface ListingWizardForm {
  title: string
  description: string
  transactionType: TransactionType
  category: PropertyType
  price: string
  area: string
  province: string
  district: string
  ward: string
  street: string
  latitude: number
  longitude: number
  media: MediaFile[]
  legalStatus: LegalStatus
  floors: string
  bedrooms: string
  bathrooms: string
  direction: string
  furniture: string
}

export const WIZARD_STEPS = [
  { id: 1, label: 'General Info' },
  { id: 2, label: 'Location' },
  { id: 3, label: 'Media' },
  { id: 4, label: 'Legal & Details' },
  { id: 5, label: 'Review' },
] as const

export const INITIAL_WIZARD_FORM: ListingWizardForm = {
  title: '',
  description: '',
  transactionType: 'sale',
  category: 'apartment',
  price: '',
  area: '',
  province: 'TP. Hồ Chí Minh',
  district: '',
  ward: '',
  street: '',
  latitude: 10.7769,
  longitude: 106.7009,
  media: [],
  legalStatus: 'so_hong',
  floors: '',
  bedrooms: '',
  bathrooms: '',
  direction: 'east',
  furniture: 'full',
}

export const PROVINCES = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Long An', 'Bình Dương']
export const DISTRICTS: Record<string, string[]> = {
  'TP. Hồ Chí Minh': ['Quận 1', 'Quận 2', 'Quận 7', 'Bình Thạnh', 'Thủ Đức'],
  'Hà Nội': ['Ba Đình', 'Cầu Giấy', 'Gia Lâm', 'Hoàn Kiếm'],
  'Đà Nẵng': ['Hải Châu', 'Sơn Trà', 'Ngũ Hành Sơn'],
  'Long An': ['Long An'],
  'Bình Dương': ['Thủ Dầu Một', 'Dĩ An'],
}

export const DIRECTIONS = [
  { value: 'east', label: 'East' },
  { value: 'west', label: 'West' },
  { value: 'south', label: 'South' },
  { value: 'north', label: 'North' },
  { value: 'northeast', label: 'Northeast' },
  { value: 'northwest', label: 'Northwest' },
  { value: 'southeast', label: 'Southeast' },
  { value: 'southwest', label: 'Southwest' },
]

export const FURNITURE_OPTIONS = [
  { value: 'full', label: 'Fully furnished' },
  { value: 'partial', label: 'Partially furnished' },
  { value: 'empty', label: 'Unfurnished' },
]

export const LEGAL_OPTIONS: { value: LegalStatus; label: string }[] = [
  { value: 'so_hong', label: 'Pink Book (Sổ hồng)' },
  { value: 'so_do', label: 'Red Book (Sổ đỏ)' },
  { value: 'hop_dong', label: 'Sales Contract' },
  { value: 'cho_so', label: 'Pending certificate' },
]
