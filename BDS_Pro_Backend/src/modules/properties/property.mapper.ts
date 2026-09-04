import { Property } from './entities/property.entity';

/** Hình dạng tin BĐS trả về client, khớp interface Property ở frontend web. */
export interface PublicProperty {
  id: string;
  title: string;
  type: string;
  transactionType: string;
  price: number;
  area: number;
  legalStatus: string;
  address: string;
  district: string;
  city: string;
  latitude: number;
  longitude: number;
  amenities: string[];
  images: string[];
  status: string;
  ownerId: string;
  ownerName: string;
  viewCount: number;
  favoriteCount: number;
  description: string;
  bedrooms?: number;
  bathrooms?: number;
  createdAt: string;
  aiScore?: number;
  rejectReason?: string;
  isFavorited?: boolean;
}

export function toPublicProperty(
  p: Property,
  opts: { isFavorited?: boolean } = {},
): PublicProperty {
  const images = (p.media ?? [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((m) => m.url);

  return {
    id: p.id,
    title: p.title,
    type: p.type,
    transactionType: p.transactionType,
    price: Number(p.price),
    area: Number(p.area),
    legalStatus: p.legalStatus,
    address: p.address,
    district: p.district,
    city: p.city,
    latitude: Number(p.latitude),
    longitude: Number(p.longitude),
    amenities: p.amenities ?? [],
    images,
    status: p.status,
    ownerId: p.ownerId,
    ownerName: p.owner?.name ?? '',
    viewCount: p.viewCount,
    favoriteCount: p.favoriteCount,
    description: p.description,
    bedrooms: p.bedrooms ?? undefined,
    bathrooms: p.bathrooms ?? undefined,
    createdAt: p.createdAt?.toISOString?.() ?? String(p.createdAt),
    aiScore: p.aiScore ?? undefined,
    rejectReason: p.rejectReason ?? undefined,
    isFavorited: opts.isFavorited,
  };
}

export const PropertyMapper = {
  toDto: (p: Property, isFavorited = false) => toPublicProperty(p, { isFavorited }),
};

