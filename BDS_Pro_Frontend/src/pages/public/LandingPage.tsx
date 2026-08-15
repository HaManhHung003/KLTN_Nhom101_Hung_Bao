import { Link } from 'react-router-dom'
import { ArrowRight, Bot, MapPin, Shield, Sparkles } from 'lucide-react'
import { BrandLogo } from '@/components/layout/shared/BrandLogo'
import { PropertyCard } from '@/components/common/PropertyCard'
import { properties } from '@/data/mockData'

export function LandingPage() {
  const featured = properties.filter((p) => p.status === 'active').slice(0, 3)

  return (
    <div className="min-h-screen bg-white">
      <header className="portal-header">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <BrandLogo to="/" badge="BĐS" title="BDS Pro" subtitle="Nền tảng BĐS thông minh" />
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-slate-600 hover:text-brand-600">Tính năng</a>
            <a href="#listings" className="text-sm text-slate-600 hover:text-brand-600">Tin nổi bật</a>
            <a href="#roles" className="text-sm text-slate-600 hover:text-brand-600">Vai trò</a>
          </nav>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              to="/register"
              className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:px-5"
            >
              Đăng ký
            </Link>
            <Link
              to="/login"
              className="rounded-xl bg-brand-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 sm:px-5"
            >
              Đăng nhập Demo
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-teal-700 px-6 py-20 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-teal-300 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Nền tảng BĐS thông minh
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Mua bán & cho thuê bất động sản trực quan trên bản đồ
            </h1>
            <p className="mt-6 text-lg text-emerald-100">
              Số hóa quy trình tìm kiếm, đặt lịch xem nhà, chat real-time và đặt cọc an toàn.
              Tích hợp AI gợi ý BĐS phù hợp nhu cầu của bạn.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                Khám phá ngay
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 font-semibold transition hover:bg-white/10"
              >
                Tìm hiểu thêm
              </a>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: 'Tin đăng', value: '1.500+' },
              { label: 'Môi giới', value: '340+' },
              { label: 'Giao dịch', value: '180+' },
              { label: 'Đánh giá', value: '4.8★' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-emerald-100">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold text-slate-900">Tính năng nổi bật</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-500">
          Giải pháp toàn diện cho người tìm BĐS, môi giới và quản trị viên
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: MapPin, title: 'Bản đồ tương tác', desc: 'Tìm kiếm theo bán kính, tọa độ và tiện ích xung quanh' },
            { icon: Bot, title: 'Trợ lý AI', desc: 'Phân tích nhu cầu và gợi ý BĐS phù hợp tự động' },
            { icon: Shield, title: 'Đặt cọc an toàn', desc: 'Cổng thanh toán tích hợp, escrow bảo vệ giao dịch' },
            { icon: Sparkles, title: 'Bảng điều khiển', desc: 'Phân tích hiệu suất tin đăng và KPI kinh doanh' },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-200 p-6 transition hover:border-brand-200 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
                <f.icon className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="listings" className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-slate-900">BĐS nổi bật</h2>
          <p className="mt-2 text-slate-500">Dữ liệu demo — sẽ kết nối API sau</p>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <PropertyCard key={p.id} property={p} detailPath={`/client/property/${p.id}`} />
            ))}
          </div>
        </div>
      </section>

      <section id="roles" className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold text-slate-900">3 vai trò người dùng</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { role: 'Người tìm BĐS', desc: 'Tìm kiếm, Hoạt động, Đã lưu, Trợ lý AI', path: '/client', color: 'from-blue-500 to-cyan-500' },
            { role: 'Môi giới / Chủ BĐS', desc: 'Tổng quan, Tin đăng, Khách hàng, Phân tích', path: '/broker', color: 'from-brand-500 to-teal-500' },
            { role: 'Quản trị viên', desc: 'Kiểm duyệt, Người dùng, Vận hành, Nhật ký', path: '/admin/dashboard', color: 'from-violet-500 to-purple-500' },
          ].map((r) => (
            <Link
              key={r.role}
              to={r.path}
              className={`group rounded-2xl bg-gradient-to-br ${r.color} p-6 text-white transition hover:scale-[1.02] hover:shadow-xl`}
            >
              <h3 className="text-xl font-bold">{r.role}</h3>
              <p className="mt-3 text-sm text-white/80">{r.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">
                Xem giao diện <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-900 px-6 py-8 text-center text-sm text-slate-400">
        © 2026 BDS Pro — KLTN Nhóm 101 Hùng Bảo · Giao diện demo React + dữ liệu tĩnh
      </footer>
    </div>
  )
}
