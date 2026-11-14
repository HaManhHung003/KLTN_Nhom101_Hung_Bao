import { MapPin } from 'lucide-react'
import type { Property } from '@/types'

interface MapPlaceholderProps {
  properties?: Property[]
  selectedId?: string
  onSelect?: (id: string) => void
  height?: string
}

export function MapPlaceholder({ properties = [], selectedId, onSelect, height = '100%' }: MapPlaceholderProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50"
      style={{ height }}
    >
      <div className="absolute inset-0 opacity-30">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="absolute left-4 top-4 rounded-xl bg-white/95 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm backdrop-blur">
        <MapPin className="mr-1 inline h-3.5 w-3.5 text-brand-600" />
        Bản đồ tương tác (demo) — tích hợp Google Maps / Mapbox sau
      </div>

      {properties.map((p, i) => {
        const positions = [
          { top: '35%', left: '45%' },
          { top: '55%', left: '30%' },
          { top: '25%', left: '60%' },
          { top: '65%', left: '55%' },
          { top: '40%', left: '25%' },
          { top: '50%', left: '70%' },
        ]
        const pos = positions[i % positions.length]
        const isSelected = selectedId === p.id

        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect?.(p.id)}
            className={`absolute -translate-x-1/2 -translate-y-full transition-transform hover:scale-110 ${isSelected ? 'z-10 scale-125' : ''}`}
            style={{ top: pos.top, left: pos.left }}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full shadow-lg ${
                isSelected ? 'bg-brand-700 ring-4 ring-brand-200' : 'bg-brand-600'
              }`}
            >
              <MapPin className="h-4 w-4 text-white" />
            </div>
            {isSelected && (
              <div className="absolute left-1/2 top-full mt-1 w-48 -translate-x-1/2 rounded-lg bg-white p-2 text-left text-xs shadow-xl">
                <p className="font-semibold text-slate-900 line-clamp-1">{p.title}</p>
                <p className="text-brand-600">{p.district}</p>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
