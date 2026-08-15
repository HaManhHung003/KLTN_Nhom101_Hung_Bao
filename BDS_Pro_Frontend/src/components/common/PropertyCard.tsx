import { useEffect, useState } from 'react'
import { Bath, BedDouble, Heart, MapPin, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Property } from '@/types'
import { Badge } from './Badge'
import { formatPrice, isVerifiedLegal, propertyTypeLabels, transactionLabels } from '@/utils/format'

interface PropertyCardProps {
  property: Property
  isFavorite?: boolean
  detailPath?: string
  onToggleFavorite?: () => void
  /** Enable image carousel cycling on hover */
  carousel?: boolean
  /** Show compact layout for search list panel */
  compact?: boolean
}

export function PropertyCard({
  property,
  isFavorite = false,
  detailPath = `/client/property/${property.id}`,
  onToggleFavorite,
  carousel = false,
  compact = false,
}: PropertyCardProps) {
  const [imageIndex, setImageIndex] = useState(0)
  const [hovering, setHovering] = useState(false)
  const images = property.images.length > 0 ? property.images : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800']
  const verified = isVerifiedLegal(property.legalStatus)

  useEffect(() => {
    if (!carousel || !hovering || images.length <= 1) return
    const timer = setInterval(() => {
      setImageIndex((i) => (i + 1) % images.length)
    }, 1200)
    return () => clearInterval(timer)
  }, [carousel, hovering, images.length])

  useEffect(() => {
    if (!hovering) setImageIndex(0)
  }, [hovering])

  return (
    <article
      className={`group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${
        compact ? 'flex gap-0' : ''
      }`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className={`relative overflow-hidden ${compact ? 'aspect-square w-36 shrink-0' : 'aspect-[4/3] w-full'}`}>
        <img
          src={images[imageIndex]}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {carousel && images.length > 1 && (
          <>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === imageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                  }`}
                />
              ))}
            </div>
            {hovering && (
              <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/20 to-transparent py-2 text-center text-[10px] font-medium text-white">
                {imageIndex + 1} / {images.length}
              </div>
            )}
          </>
        )}

        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          <Badge className="bg-sky-600 text-white text-[10px]">{transactionLabels[property.transactionType]}</Badge>
          {!compact && (
            <Badge className="bg-white/90 text-slate-700 text-[10px]">{propertyTypeLabels[property.type]}</Badge>
          )}
          {verified && (
            <Badge className="flex items-center gap-0.5 bg-emerald-600 text-white text-[10px]">
              <ShieldCheck className="h-3 w-3" />
              Pháp lý xác thực
            </Badge>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            onToggleFavorite?.()
          }}
          className="absolute right-2 top-2 rounded-full bg-white/90 p-2 shadow-sm transition hover:bg-white"
          aria-label={isFavorite ? 'Bỏ lưu tin' : 'Lưu tin'}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
        </button>
      </div>

      <Link to={detailPath} className={`block ${compact ? 'min-w-0 flex-1 p-3' : 'p-4'}`}>
        <p className={`font-bold text-sky-700 ${compact ? 'text-base' : 'text-lg'}`}>
          {formatPrice(property.price, property.transactionType)}
        </p>
        <h3 className={`mt-0.5 font-semibold text-slate-900 ${compact ? 'line-clamp-1 text-sm' : 'line-clamp-2'}`}>
          {property.title}
        </h3>
        <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-500 sm:text-sm">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{property.district}, {property.city}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 sm:text-sm">
          <span>{property.area} m²</span>
          {property.bedrooms != null && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" />
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              {property.bathrooms}
            </span>
          )}
        </div>
      </Link>
    </article>
  )
}
