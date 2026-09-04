import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Property } from '@/types'
import { CLIENT_ROUTES } from '@/config/routes'
import { formatPrice } from '@/utils/format'

interface AiPropertyMiniCardProps {
  property: Property
}

export function AiPropertyMiniCard({ property }: AiPropertyMiniCardProps) {
  return (
    <div className="flex w-64 shrink-0 gap-2.5 rounded-xl border border-violet-200/60 bg-white p-2 shadow-sm">
      <img
        src={property.images[0]}
        alt=""
        className="h-16 w-20 shrink-0 rounded-lg object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-xs font-semibold text-slate-900">{property.title}</p>
        <p className="mt-0.5 text-xs font-bold text-violet-700">
          {formatPrice(property.price, property.transactionType)}
        </p>
        <p className="text-[10px] text-slate-500">{property.district} · {property.area} m²</p>
        <Link
          to={CLIENT_ROUTES.property(property.id)}
          className="mt-1.5 inline-flex items-center gap-1 rounded-lg bg-violet-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-violet-700"
        >
          Xem nhanh
          <ExternalLink className="h-2.5 w-2.5" />
        </Link>
      </div>
    </div>
  )
}
