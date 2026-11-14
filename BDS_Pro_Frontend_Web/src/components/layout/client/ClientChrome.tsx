import { Link, useLocation } from 'react-router-dom'
import { BrandLogo } from '@/components/layout/shared/BrandLogo'
import { PortalHeaderActions } from '@/components/layout/shared/PortalHeaderActions'
import { ADMIN_ROUTES, BROKER_ROUTES, CLIENT_ROUTES } from '@/config/routes'
import { useAuth } from '@/context/AuthContext'
import { Building2, PlusCircle, ShieldCheck } from 'lucide-react'

const HEADER_NAV = [
  { label: 'Trang chủ', path: CLIENT_ROUTES.home },
  { label: 'Tìm kiếm BĐS', path: CLIENT_ROUTES.search },
  { label: 'Giao dịch', path: CLIENT_ROUTES.deals },
  { label: 'Hoạt động', path: CLIENT_ROUTES.activity },
  { label: 'Đã lưu', path: CLIENT_ROUTES.saved },
] as const

export function ClientHeader() {
  const { user } = useAuth()
  const { pathname } = useLocation()

  return (
    <header className="portal-header">
      <div className="mx-auto flex h-14 min-h-[3.5rem] max-w-7xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6">
        <BrandLogo
          to={CLIENT_ROUTES.home}
          badge={user?.role === 'admin' ? 'QT' : user?.role === 'agent' ? 'MG' : user ? 'KH' : 'BĐS'}
          title="BDS Pro"
          subtitle={
            user?.role === 'admin'
              ? 'Quản trị'
              : user?.role === 'agent'
              ? 'Môi giới'
              : user
              ? 'Người tìm BĐS'
              : 'Nền tảng BĐS'
          }
          size="sm"
        />

        {/* Navigation links with active highlighting */}
        <nav className="hidden items-center gap-1 lg:flex">
          {HEADER_NAV.map((item) => {
            const isActive =
              item.path === CLIENT_ROUTES.home
                ? pathname === CLIENT_ROUTES.home
                : pathname.startsWith(item.path)

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Role Quick Switcher & Actions */}
        <div className="flex items-center gap-2">
          {user?.role === 'agent' && (
            <Link
              to={BROKER_ROUTES.dashboard}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Vào Kênh Môi giới</span>
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link
              to={ADMIN_ROUTES.dashboard}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 border border-purple-200 transition"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Vào Trang Quản trị</span>
            </Link>
          )}

          {(!user || user.role === 'buyer') && (
            <Link
              to={user ? BROKER_ROUTES.properties : '/login'}
              className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 shadow-xs transition"
            >
              <PlusCircle className="h-3.5 w-3.5 text-brand-600" />
              <span>Đăng tin BĐS</span>
            </Link>
          )}

          <PortalHeaderActions />
        </div>
      </div>
    </header>
  )
}

export function ClientFooter() {
  return (
    <footer className="mt-auto hidden border-t border-slate-200 bg-slate-900 text-slate-300 md:block">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white shadow-md">
              BĐS
            </div>
            <span className="font-bold text-white text-lg tracking-tight">BDS Pro</span>
          </div>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Nền tảng công nghệ số hóa quy trình tìm kiếm, giao dịch và quản lý bất động sản thông minh với bản đồ số, trợ lý AI và đặt cọc an toàn.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400"></span>
            Hệ thống vận hành 24/7 · Khóa luận tốt nghiệp
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white tracking-wide uppercase">Người tìm BĐS</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li><Link to={CLIENT_ROUTES.search} className="hover:text-white transition">Tìm kiếm & Bản đồ tương tác</Link></li>
            <li><Link to={CLIENT_ROUTES.deals} className="hover:text-white transition">Giao dịch & Đặt cọc an toàn</Link></li>
            <li><Link to={CLIENT_ROUTES.activity} className="hover:text-white transition">Lịch hẹn xem nhà thực tế</Link></li>
            <li><Link to={CLIENT_ROUTES.saved} className="hover:text-white transition">BĐS đã lưu & So sánh</Link></li>
            <li><Link to={CLIENT_ROUTES.chat} className="hover:text-white transition">Chat với Môi giới & AI Assistant</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white tracking-wide uppercase">Dành cho Đối tác</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li><Link to={BROKER_ROUTES.dashboard} className="hover:text-white transition">Kênh Môi giới & Host</Link></li>
            <li><Link to={BROKER_ROUTES.newProperty} className="hover:text-white transition">Đăng tin BĐS mới</Link></li>
            <li><Link to={BROKER_ROUTES.bookings} className="hover:text-white transition">Quản lý lịch hẹn với khách</Link></li>
            <li><Link to={ADMIN_ROUTES.dashboard} className="hover:text-white transition">Cổng Quản trị viên Sàn</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white tracking-wide uppercase">Bản tin thị trường</h4>
          <p className="mt-3 text-sm text-slate-400">
            Nhận thông tin phân tích giá nhà đất và các dự án BĐS mới nhất mỗi tuần.
          </p>
          <form className="mt-3 flex flex-col gap-2 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Nhập email của bạn..."
              className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            <button
              type="submit"
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 transition shadow-sm"
            >
              Đăng ký
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} BDS Pro · Đề tài KLTN Nhóm 101 · Mua bán & Cho thuê Bất động sản
      </div>
    </footer>
  )
}
