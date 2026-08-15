import { useRef, useState } from 'react'
import { MapPin } from 'lucide-react'

interface MapPinPickerProps {
  latitude: number
  longitude: number
  onChange: (lat: number, lng: number) => void
}

export function MapPinPicker({ latitude, longitude, onChange }: MapPinPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  function updateFromEvent(clientX: number, clientY: number) {
    const el = mapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1)
    const y = Math.min(Math.max((clientY - rect.top) / rect.height, 0), 1)
    const lat = 10.65 + (1 - y) * 0.35
    const lng = 106.45 + x * 0.55
    onChange(Number(lat.toFixed(6)), Number(lng.toFixed(6)))
  }

  function handlePointerDown(e: React.PointerEvent) {
    setDragging(true)
    mapRef.current?.setPointerCapture(e.pointerId)
    updateFromEvent(e.clientX, e.clientY)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return
    updateFromEvent(e.clientX, e.clientY)
  }

  function handlePointerUp(e: React.PointerEvent) {
    setDragging(false)
    mapRef.current?.releasePointerCapture(e.pointerId)
  }

  const pinLeft = ((longitude - 106.45) / 0.55) * 100
  const pinTop = (1 - (latitude - 10.65) / 0.35) * 100

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">
        Pin location on map <span className="text-slate-400">(drag pin to adjust)</span>
      </label>
      <div
        ref={mapRef}
        role="application"
        aria-label="Map pin picker"
        className="relative h-56 cursor-crosshair overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <svg className="absolute inset-0 h-full w-full opacity-25" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="broker-map-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#64748b" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#broker-map-grid)" />
        </svg>

        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full transition-transform"
          style={{ left: `${pinLeft}%`, top: `${pinTop}%` }}
        >
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-emerald-600 p-2 shadow-lg ring-4 ring-emerald-200">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div className="mt-1 h-0 w-0 border-x-8 border-x-transparent border-t-8 border-t-emerald-600" />
          </div>
        </div>

        <div className="absolute bottom-2 left-2 rounded-lg bg-white/90 px-2 py-1 text-[10px] text-slate-500 shadow">
          Mock map · Google Maps integration later
        </div>
      </div>
      <p className="text-xs text-slate-500">
        Coordinates: <strong>{latitude.toFixed(6)}</strong>, <strong>{longitude.toFixed(6)}</strong>
      </p>
    </div>
  )
}
