import { Bath, BedDouble, MapPin, Search, SlidersHorizontal } from 'lucide-react'
import type { TransactionType } from '@/types'

export interface SearchFilters {
  transactionType: TransactionType
  location: string
  priceMin: number
  priceMax: number
  beds: string
  baths: string
  radius: string
}

interface SearchFilterBarProps {
  filters: SearchFilters
  onChange: (patch: Partial<SearchFilters>) => void
  resultCount: number
}

const RADIUS_OPTIONS = ['1', '3', '5'] as const
const BED_OPTIONS = ['Bất kỳ', '1+', '2+', '3+', '4+']
const BATH_OPTIONS = ['Bất kỳ', '1+', '2+', '3+']

export function SearchFilterBar({ filters, onChange, resultCount }: SearchFilterBarProps) {
  const priceLabel =
    filters.transactionType === 'rent'
      ? `${(filters.priceMin / 1_000_000).toFixed(0)} – ${(filters.priceMax / 1_000_000).toFixed(0)} tr/tháng`
      : `${(filters.priceMin / 1_000_000).toFixed(0)} tr – ${(filters.priceMax / 1_000_000_000).toFixed(1)} tỷ`

  return (
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="flex flex-wrap items-end gap-3 px-4 py-3 sm:px-5">
        {/* Buy / Rent toggle */}
        <div className="flex shrink-0 rounded-xl bg-slate-100 p-1">
          {(['sale', 'rent'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onChange({ transactionType: type })}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                filters.transactionType === type
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {type === 'sale' ? 'Mua' : 'Thuê'}
            </button>
          ))}
        </div>

        {/* Location */}
        <div className="min-w-[180px] flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-500">Khu vực</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.location}
              onChange={(e) => onChange({ location: e.target.value })}
              placeholder="Quận, thành phố hoặc địa chỉ..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>
        </div>

        {/* Price range slider */}
        <div className="w-full min-w-[200px] sm:w-56">
          <label className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Khoảng giá</span>
            <span className="text-sky-600">{priceLabel}</span>
          </label>
          <div className="space-y-1">
            <input
              type="range"
              min={0}
              max={20_000_000_000}
              step={100_000_000}
              value={filters.priceMax}
              onChange={(e) => onChange({ priceMax: Number(e.target.value) })}
              className="h-2 w-full cursor-pointer accent-sky-600"
            />
            <input
              type="range"
              min={0}
              max={filters.priceMax}
              step={50_000_000}
              value={filters.priceMin}
              onChange={(e) => onChange({ priceMin: Number(e.target.value) })}
              className="h-2 w-full cursor-pointer accent-sky-600"
            />
          </div>
        </div>

        {/* Beds */}
        <div className="w-24">
          <label className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-500">
            <BedDouble className="h-3.5 w-3.5" /> Phòng ngủ
          </label>
          <select
            value={filters.beds}
            onChange={(e) => onChange({ beds: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-500"
          >
            {BED_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* Baths */}
        <div className="w-24">
          <label className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-500">
            <Bath className="h-3.5 w-3.5" /> Phòng tắm
          </label>
          <select
            value={filters.baths}
            onChange={(e) => onChange({ baths: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-500"
          >
            {BATH_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* Radius */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Bán kính</label>
          <div className="flex gap-1">
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onChange({ radius: r })}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  filters.radius === r
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r}km
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
        >
          <Search className="h-4 w-4" />
          Tìm kiếm
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2 text-xs text-slate-500 sm:px-5">
        <span>
          <strong className="text-slate-800">{resultCount}</strong> BĐS trong vòng {filters.radius}km
        </span>
        <span className="flex items-center gap-1">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Đang lọc
        </span>
      </div>
    </div>
  )
}
