import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Search, Sparkles } from 'lucide-react'
import { PropertyCard } from '@/components/common/PropertyCard'
import { CLIENT_ROUTES } from '@/config/routes'
import { buyerNotifications, favoriteIds, properties } from '@/data/mockData'

export function BuyerHome() {
  const active = properties.filter((p) => p.status === 'active')
  const aiRecommended = [...active].sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0)).slice(0, 4)
  const unread = buyerNotifications.filter((n) => !n.read).length

  return (
    <div className="space-y-8">
      <section className="portal-hero shadow-brand-100/40">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative max-w-2xl">
          <p className="text-sm font-medium text-brand-100">Hành trình: Khám phá → Xem nhà → Đặt cọc</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
            Tìm ngôi nhà phù hợp với bạn
          </h1>
          <p className="mt-3 text-brand-100">
            Tìm kiếm thông minh trên bản đồ, gợi ý AI theo ngân sách & khu vực
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Nhập quận, dự án, địa chỉ..."
                className="w-full rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 shadow-lg outline-none placeholder:text-slate-400"
              />
            </div>
            <Link
              to={CLIENT_ROUTES.search}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-semibold text-brand-700 shadow-lg transition hover:bg-brand-50"
            >
              Tìm kiếm
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link to={CLIENT_ROUTES.rent} className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur transition hover:bg-white/25">
              Cho thuê
            </Link>
            <Link to={CLIENT_ROUTES.buy} className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur transition hover:bg-white/25">
              Mua bán
            </Link>
            {['Căn hộ', 'Nhà phố', 'Quận 7', 'Bình Thạnh'].map((tag) => (
              <Link
                key={tag}
                to={CLIENT_ROUTES.search}
                className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur transition hover:bg-white/25"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to={`${CLIENT_ROUTES.activity}?tab=lich-hen`} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-200 hover:shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Sắp tới</p>
          <p className="mt-1 text-lg font-bold text-slate-900">Lịch xem nhà</p>
          <p className="mt-1 text-sm text-brand-600">18/08 · 9:00 · Vinhomes CP</p>
        </Link>
        <Link to={CLIENT_ROUTES.deals} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Giao dịch</p>
          <p className="mt-1 text-lg font-bold text-slate-900">2 thuê · 1 mua</p>
          <p className="mt-1 text-sm text-emerald-600">Xem BĐS đã thuê / mua</p>
        </Link>
        <Link to={`${CLIENT_ROUTES.activity}?tab=tin-nhan`} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-200 hover:shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Liên hệ</p>
          <p className="mt-1 text-lg font-bold text-slate-900">2 tin nhắn mới</p>
          <p className="mt-1 text-sm text-slate-500">Trần Văn Bảo · Môi giới</p>
        </Link>
        <Link to={CLIENT_ROUTES.profile} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-200 hover:shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Thông báo</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{unread} chưa đọc</p>
          <p className="mt-1 text-sm text-slate-500">Nhắc lịch & gợi ý AI</p>
        </Link>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-500" />
            <h2 className="text-xl font-bold text-slate-900">Gợi ý cho bạn</h2>
          </div>
          <Link to={CLIENT_ROUTES.search} className="text-sm font-medium text-brand-600 hover:underline">
            Xem thêm
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {aiRecommended.map((p) => (
            <PropertyCard key={p.id} property={p} isFavorite={favoriteIds.includes(p.id)} />
          ))}
        </div>
      </section>

      <Link
        to={CLIENT_ROUTES.search}
        className="flex items-center justify-between rounded-2xl border border-dashed border-brand-300 bg-brand-50/50 p-6 transition hover:bg-brand-50"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
            <MapPin className="h-6 w-6 text-brand-600" />
          </div>
          <div>
            <p className="font-bold text-slate-900">Xem trên bản đồ</p>
            <p className="text-sm text-slate-500">Tìm theo bán kính từ vị trí làm việc / tiện ích</p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-brand-600" />
      </Link>
    </div>
  )
}
