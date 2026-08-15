import { Link } from 'react-router-dom'
import { BrandLogo } from '@/components/layout/shared/BrandLogo'
import { PortalHeaderActions } from '@/components/layout/shared/PortalHeaderActions'
import { ADMIN_ROUTES, BROKER_ROUTES, CLIENT_ROUTES } from '@/config/routes'
import { buyerNotifications, currentUsers } from '@/data/mockData'

const HEADER_NAV = [
  { label: 'Trang chủ', path: CLIENT_ROUTES.home },
  { label: 'Tìm kiếm', path: CLIENT_ROUTES.search },
  { label: 'Giao dịch', path: CLIENT_ROUTES.deals },
  { label: 'Hoạt động', path: CLIENT_ROUTES.activity },
  { label: 'Đã lưu', path: CLIENT_ROUTES.saved },
] as const

export function ClientHeader() {
  const user = currentUsers.buyer

  return (
    <header className="portal-header">
      <div className="mx-auto flex h-14 min-h-[3.5rem] max-w-7xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6">
        <BrandLogo to={CLIENT_ROUTES.home} badge="KH" title="BDS Pro" subtitle="Người tìm BĐS" size="sm" />

        <nav className="hidden items-center gap-0.5 lg:flex">
          {HEADER_NAV.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 xl:px-4"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <PortalHeaderActions
          user={{ name: user.name, avatar: user.avatar, roleLabel: 'Khách hàng' }}
          notifications={buyerNotifications}
          profilePath={CLIENT_ROUTES.profile}
        />
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">BĐS</div>
            <span className="font-bold text-white">BDS Pro</span>
          </div>
          <p className="mt-3 text-sm text-slate-400">
            Mua, thuê và quản lý BĐS với bản đồ, trợ lý AI và đặt cọc an toàn.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Người tìm BĐS</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to={CLIENT_ROUTES.search} className="hover:text-white">Tìm kiếm & Bản đồ</Link></li>
            <li><Link to={CLIENT_ROUTES.deals} className="hover:text-white">Giao dịch của tôi</Link></li>
            <li><Link to={CLIENT_ROUTES.activity} className="hover:text-white">Hoạt động của tôi</Link></li>
            <li><Link to={CLIENT_ROUTES.saved} className="hover:text-white">Đã lưu & So sánh</Link></li>
            <li><Link to={CLIENT_ROUTES.chat} className="hover:text-white">Chat & Trợ lý AI</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Dành cho môi giới</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to={BROKER_ROUTES.dashboard} className="hover:text-white">Bảng điều khiển</Link></li>
            <li><Link to={BROKER_ROUTES.newProperty} className="hover:text-white">Đăng tin BĐS</Link></li>
            <li><Link to={ADMIN_ROUTES.dashboard} className="hover:text-white">Quản trị hệ thống</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Bản tin</h4>
          <p className="mt-3 text-sm text-slate-400">Thông tin thị trường & tin mới mỗi tuần.</p>
          <form className="mt-3 flex flex-col gap-2 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="email@gmail.com"
              className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-brand-500"
            />
            <button type="submit" className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-500">
              Đăng ký
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} BDS Pro · KLTN Demo
      </div>
    </footer>
  )
}
