import type { LegalStatus, PropertyType, TransactionType } from '@/types'

export interface MediaFile {
  id: string
  name: string
  url: string
  type: 'image' | 'video'
  rawFile?: File
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

export const PROVINCES = [
  'TP. Hồ Chí Minh',
  'Hà Nội',
  'Bình Dương',
  'Đà Nẵng',
  'Đồng Nai',
  'Bà Rịa - Vũng Tàu',
  'Long An',
]

export const DISTRICTS: Record<string, string[]> = {
  'TP. Hồ Chí Minh': [
    'Quận 1',
    'Quận 3',
    'Quận 4',
    'Quận 5',
    'Quận 7',
    'Quận 8',
    'Quận 10',
    'Quận 11',
    'Quận 12',
    'Bình Thạnh',
    'Thành phố Thủ Đức',
    'Gò Vấp',
    'Tân Bình',
    'Tân Phú',
    'Bình Tân',
    'Huyện Bình Chánh',
    'Huyện Nhà Bè',
    'Huyện Củ Chi',
    'Huyện Hóc Môn',
  ],
  'Hà Nội': [
    'Ba Đình',
    'Cầu Giấy',
    'Đống Đa',
    'Hoàn Kiếm',
    'Hai Bà Trưng',
    'Tây Hồ',
    'Thanh Xuân',
    'Nam Từ Liêm',
    'Bắc Từ Liêm',
    'Long Biên',
    'Gia Lâm',
    'Đông Anh',
  ],
  'Bình Dương': [
    'Thành phố Thủ Dầu Một',
    'Thành phố Dĩ An',
    'Thành phố Thuận An',
    'Thị xã Bến Cát',
    'Thị xã Tân Uyên',
  ],
  'Đà Nẵng': [
    'Hải Châu',
    'Sơn Trà',
    'Ngũ Hành Sơn',
    'Thanh Khê',
    'Cẩm Lệ',
    'Liên Chiểu',
  ],
  'Đồng Nai': [
    'Thành phố Biên Hòa',
    'Huyện Long Thành',
    'Thành phố Long Khánh',
  ],
  'Bà Rịa - Vũng Tàu': [
    'Thành phố Vũng Tàu',
    'Thành phố Bà Rịa',
    'Thị xã Phú Mỹ',
  ],
  'Long An': [
    'Thành phố Tân An',
    'Huyện Bến Lức',
    'Huyện Đức Hòa',
  ],
}

export const WARDS: Record<string, Record<string, string[]>> = {
  'TP. Hồ Chí Minh': {
    'Quận 1': [
      'Phường Bến Nghé',
      'Phường Bến Thành',
      'Phường Phạm Ngũ Lão',
      'Phường Tân Định',
      'Phường Đa Kao',
      'Phường Nguyễn Cư Trinh',
      'Phường Nguyễn Thái Bình',
      'Phường Cầu Kho',
      'Phường Cầu Ông Lãnh',
      'Phường Cô Giang',
    ],
    'Quận 3': [
      'Phường Võ Thị Sáu',
      'Phường 1',
      'Phường 2',
      'Phường 3',
      'Phường 4',
      'Phường 5',
      'Phường 9',
      'Phường 14',
    ],
    'Quận 4': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 6', 'Phường 8', 'Phường 9', 'Phường 13'],
    'Quận 5': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 7', 'Phường 11'],
    'Quận 7': [
      'Phường Tân Phong',
      'Phường Tân Phú',
      'Phường Tân Quy',
      'Phường Tân Thuận Đông',
      'Phường Tân Thuận Tây',
      'Phường Bình Thuận',
      'Phường Phú Thuận',
      'Phường Phú Mỹ',
      'Phường Tân Hưng',
      'Phường Tân Kiểng',
    ],
    'Quận 8': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8'],
    'Quận 10': ['Phường 1', 'Phường 2', 'Phường 4', 'Phường 9', 'Phường 10', 'Phường 12', 'Phường 14', 'Phường 15'],
    'Quận 11': ['Phường 1', 'Phường 3', 'Phường 5', 'Phường 8', 'Phường 10', 'Phường 12', 'Phường 15'],
    'Quận 12': [
      'Phường An Phú Đông',
      'Phường Thạnh Lộc',
      'Phường Thạnh Xuân',
      'Phường Đông Hưng Thuận',
      'Phường Tân Chánh Hiệp',
      'Phường Tân Thới Hiệp',
      'Phường Trung Mỹ Tây',
      'Phường Tân Thới Nhất',
      'Phường Tân Hưng Thuận',
    ],
    'Bình Thạnh': [
      'Phường 1',
      'Phường 2',
      'Phường 3',
      'Phường 12',
      'Phường 14',
      'Phường 15',
      'Phường 17',
      'Phường 19',
      'Phường 22',
      'Phường 24',
      'Phường 25',
      'Phường 26',
      'Phường 27',
      'Phường 28',
    ],
    'Thành phố Thủ Đức': [
      'Phường Thảo Điền',
      'Phường An Phú',
      'Phường An Khánh',
      'Phường Bình An',
      'Phường Thủ Thiêm',
      'Phường Hiệp Bình Chánh',
      'Phường Hiệp Bình Phước',
      'Phường Linh Trung',
      'Phường Linh Xuân',
      'Phường Phước Long A',
      'Phường Phước Long B',
      'Phường Tăng Nhơn Phú A',
      'Phường Long Thạnh Mỹ',
    ],
    'Gò Vấp': [
      'Phường 1',
      'Phường 3',
      'Phường 5',
      'Phường 7',
      'Phường 10',
      'Phường 11',
      'Phường 12',
      'Phường 17',
    ],
    'Tân Bình': ['Phường 1', 'Phường 2', 'Phường 4', 'Phường 13', 'Phường 15'],
    'Tân Phú': ['Phường Hòa Thạnh', 'Phường Phú Thạnh', 'Phường Phú Thọ Hòa', 'Phường Sơn Kỳ', 'Phường Tân Sơn Nhì'],
    'Bình Tân': ['Phường An Lạc', 'Phường Tân Tạo', 'Phường Bình Hưng Hòa', 'Phường Bình Trị Đông'],
    'Huyện Bình Chánh': ['Xã Bình Hưng', 'Xã Phong Phú', 'Xã Vĩnh Lộc A', 'Xã Vĩnh Lộc B', 'Thị trấn Tân Túc'],
    'Huyện Nhà Bè': ['Xã Phước Kiển', 'Xã Nhơn Đức', 'Xã Phú Xuân', 'Thị trấn Nhà Bè'],
    'Huyện Củ Chi': ['Thị trấn Củ Chi', 'Xã Tân An Hội', 'Xã Bình Mỹ'],
    'Huyện Hóc Môn': ['Thị trấn Hóc Môn', 'Xã Bà Điểm', 'Xã Tân Xuân'],
  },
  'Hà Nội': {
    'Ba Đình': ['Phường Cống Vị', 'Phường Đội Cấn', 'Phường Kim Mã', 'Phường Ngọc Hà', 'Phường Quán Thánh', 'Phường Liễu Giai'],
    'Cầu Giấy': ['Phường Dịch Vọng', 'Phường Dịch Vọng Hậu', 'Phường Mai Dịch', 'Phường Nghĩa Tân', 'Phường Yên Hòa', 'Phường Trung Hòa'],
    'Đống Đa': ['Phường Cát Linh', 'Phường Láng Hạ', 'Phường Ô Chợ Dừa', 'Phường Văn Miếu', 'Phường Khâm Thiên'],
    'Hoàn Kiếm': ['Phường Hàng Bạc', 'Phường Hàng Bông', 'Phường Hàng Gai', 'Phường Tràng Tiền', 'Phường Lý Thái Tổ'],
    'Hai Bà Trưng': ['Phường Bách Khoa', 'Phường Minh Khai', 'Phường Trương Định', 'Phường Vĩnh Tuy'],
    'Tây Hồ': ['Phường Bưởi', 'Phường Nhật Tân', 'Phường Quảng An', 'Phường Xuân La', 'Phường Yên Phụ'],
    'Thanh Xuân': ['Phường Hạ Đình', 'Phường Khương Trung', 'Phường Nhân Chính', 'Phường Thanh Xuân Bắc'],
    'Nam Từ Liêm': ['Phường Mỹ Đình 1', 'Phường Mỹ Đình 2', 'Phường Trung Văn', 'Phường Tây Mỗ', 'Phường Đại Mỗ'],
    'Bắc Từ Liêm': ['Phường Cổ Nhuế 1', 'Phường Cổ Nhuế 2', 'Phường Xuân Đỉnh', 'Phường Phú Diễn'],
    'Long Biên': ['Phường Bồ Đề', 'Phường Gia Thụy', 'Phường Ngọc Lâm', 'Phường Việt Hưng'],
    'Gia Lâm': ['Thị trấn Trâu Quỳ', 'Xã Đa Tốn', 'Xã Cổ Bi'],
    'Đông Anh': ['Thị trấn Đông Anh', 'Xã Hải Bối', 'Xã Vĩnh Ngọc'],
  },
  'Bình Dương': {
    'Thành phố Thủ Dầu Một': ['Phường Phú Hòa', 'Phường Phú Lợi', 'Phường Chánh Nghĩa', 'Phường Định Hòa', 'Phường Hiệp Thành'],
    'Thành phố Dĩ An': ['Phường Dĩ An', 'Phường An Bình', 'Phường Tân Bình', 'Phường Đông Hòa'],
    'Thành phố Thuận An': ['Phường Lái Thiêu', 'Phường An Phú', 'Phường Bình Hòa'],
    'Thị xã Bến Cát': ['Phường Mỹ Phước', 'Phường Hòa Lợi'],
    'Thị xã Tân Uyên': ['Phường Uyên Hưng', 'Phường Tân Phước Khánh'],
  },
  'Đà Nẵng': {
    'Hải Châu': ['Phường Hải Châu 1', 'Phường Hải Châu 2', 'Phường Nam Dương', 'Phường Hòa Cường Bắc'],
    'Sơn Trà': ['Phường An Hải Bắc', 'Phường An Hải Tây', 'Phường Phước Mỹ'],
    'Ngũ Hành Sơn': ['Phường Mỹ An', 'Phường Khuê Mỹ', 'Phường Hòa Hải'],
    'Thanh Khê': ['Phường An Khê', 'Phường Chính Gián'],
    'Cẩm Lệ': ['Phường Khuê Trung', 'Phường Hòa Thọ Đông'],
    'Liên Chiểu': ['Phường Hòa Khánh Bắc', 'Phường Hòa Khánh Nam'],
  },
  'Đồng Nai': {
    'Thành phố Biên Hòa': ['Phường Trảng Dài', 'Phường Tân Phong', 'Phường Hố Nai', 'Phường Bửu Long'],
    'Huyện Long Thành': ['Thị trấn Long Thành', 'Xã Lộc An', 'Xã Bình Sơn'],
    'Thành phố Long Khánh': ['Phường Xuân An', 'Phường Xuân Bình'],
  },
  'Bà Rịa - Vũng Tàu': {
    'Thành phố Vũng Tàu': ['Phường 1', 'Phường 2', 'Phường Thắng Tam', 'Phường Nguyễn An Ninh', 'Phường Rạch Dừa'],
    'Thành phố Bà Rịa': ['Phường Phước Trung', 'Phường Phước Hưng'],
    'Thị xã Phú Mỹ': ['Phường Phú Mỹ', 'Phường Mỹ Xuân'],
  },
  'Long An': {
    'Thành phố Tân An': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4'],
    'Huyện Bến Lức': ['Thị trấn Bến Lức', 'Xã An Thạnh'],
    'Huyện Đức Hòa': ['Thị trấn Đức Hòa', 'Xã Mỹ Hạnh Nam'],
  },
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
