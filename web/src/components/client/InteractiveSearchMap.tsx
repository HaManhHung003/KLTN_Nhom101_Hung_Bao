import { MapPin } from 'lucide-react'
import type { Property } from '@/types'
import { formatPricePin } from '@/utils/format'

interface InteractiveSearchMapProps {
  properties: Property[]
  selectedId?: string
  onSelect: (id: string) => void
  radiusKm: string
}

const PIN_POSITIONS = [
  { top: '28%', left: '42%' },
  { top: '52%', left: '28%' },
  { top: '22%', left: '58%' },
  { top: '62%', left: '52%' },
  { top: '38%', left: '22%' },
  { top: '48%', left: '72%' },
  { top: '35%', left: '65%' },
  { top: '55%', left: '45%' },
]

export function InteractiveSearchMap({ properties, selectedId, onSelect, radiusKm }: InteractiveSearchMapProps) {
  return (
    <div className="relative h-full min-h-[320px] overflow-hidden bg-gradient-to-br from-sky-50 via-teal-50 to-emerald-50">
      {/* Grid pattern */}
      <svg className="absolute inset-0 h-full w-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="search-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#64748b" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#search-grid)" />
      </svg>

      {/* Decorative roads */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute left-[20%] top-0 h-full w-1 bg-slate-300/60" />
        <div className="absolute left-[55%] top-0 h-full w-0.5 bg-slate-300/40" />
        <div className="absolute left-0 top-[40%] h-0.5 w-full bg-slate-300/50" />
        <div className="absolute left-0 top-[65%] h-1 w-full bg-slate-300/40" />
      </div>

      {/* Radius circle indicator */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-sky-400/50 bg-sky-400/5" />

      {/* Map controls overlay */}
      <div className="absolute left-4 top-4 z-10 rounded-xl bg-white/95 px-3 py-2 text-xs font-medium text-slate-600 shadow-md backdrop-blur">
        <MapPin className="mr-1 inline h-3.5 w-3.5 text-sky-600" />
        Bản đồ tương tác · Bán kính {radiusKm}km
      </div>

      <div className="absolute bottom-4 left-4 z-10 rounded-xl bg-white/95 px-3 py-2 text-[10px] text-slate-500 shadow-md backdrop-blur">
        Tích hợp Google Maps / Mapbox (demo)
      </div>

      {/* Price pins */}
      {properties.map((p, i) => {
        const pos = PIN_POSITIONS[i % PIN_POSITIONS.length]
        const isSelected = selectedId === p.id
        const priceLabel = formatPricePin(p.price, p.transactionType)

        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className={`absolute z-10 -translate-x-1/2 -translate-y-full transition-all duration-200 hover:z-20 hover:scale-110 ${
              isSelected ? 'z-20 scale-110' : ''
            }`}
            style={{ top: pos.top, left: pos.left }}
          >
            <div
              className={`relative whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-bold shadow-lg transition ${
                isSelected
                  ? 'bg-sky-700 text-white ring-4 ring-sky-200'
                  : 'bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-sky-600 hover:text-white'
              }`}
            >
              {priceLabel}
              <span
                className={`absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent ${
                  isSelected ? 'border-t-sky-700' : 'border-t-white'
                }`}
              />
            </div>
            {isSelected && (
              <div className="absolute left-1/2 top-full mt-2 w-52 -translate-x-1/2 rounded-xl bg-white p-3 text-left shadow-xl ring-1 ring-slate-100">
                <img src={p.images[0]} alt="" className="mb-2 h-20 w-full rounded-lg object-cover" />
                <p className="line-clamp-1 text-xs font-semibold text-slate-900">{p.title}</p>
                <p className="text-xs text-sky-600">{p.district}, {p.city}</p>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
