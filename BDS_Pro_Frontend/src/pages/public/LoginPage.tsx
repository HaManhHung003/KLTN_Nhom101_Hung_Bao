import { Link, useSearchParams } from 'react-router-dom'
import { Building2, Eye, EyeOff, Lock, Mail, Shield, UserSearch } from 'lucide-react'
import { useState } from 'react'
import type { UserRole } from '@/types'

const rolePaths: Record<UserRole, string> = {
  buyer: '/client',
  agent: '/broker',
  admin: '/admin/dashboard',
}

export function LoginPage() {
  const [params] = useSearchParams()
  const preselected = params.get('role') as UserRole | null
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<UserRole>(preselected ?? 'buyer')

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-gradient-to-br from-brand-800 via-brand-700 to-teal-700 p-12 lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-lg font-bold text-white">BP</div>
          <h1 className="mt-8 text-4xl font-bold text-white">BDS Pro</h1>
          <p className="mt-4 max-w-md text-lg text-emerald-100">
            Đăng nhập để truy cập đầy đủ tính năng theo vai trò: tìm kiếm, đăng tin, quản trị hệ thống.
          </p>
        </div>
        <div className="space-y-2 text-sm text-emerald-200/80">
          <p>✓ JWT / OAuth — tích hợp sau</p>
          <p>✓ Demo UI — chọn role bên dưới</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-slate-900">Đăng nhập</h2>
          <p className="mt-2 text-slate-500">FR-U01, FR-U02 — Email/SĐT + OTP (demo)</p>

          <form className="mt-8 space-y-4" onSubmit={(e) => { e.preventDefault(); window.location.href = rolePaths[role] }}>
            <div>
              <label className="text-sm font-medium text-slate-700">Email hoặc SĐT</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="text" defaultValue="demo@bdspro.vn" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type={showPassword ? 'text' : 'password'} defaultValue="123456" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-10 text-sm outline-none focus:border-brand-500" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Vai trò demo</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {([
                  { id: 'buyer' as const, label: 'Tìm BĐS', icon: UserSearch },
                  { id: 'agent' as const, label: 'Môi giới', icon: Building2 },
                  { id: 'admin' as const, label: 'Admin', icon: Shield },
                ]).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-medium transition ${
                      role === r.id ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <r.icon className="h-4 w-4" />
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                Ghi nhớ đăng nhập
              </label>
              <Link to="/forgot-password" className="text-brand-600 hover:underline">Quên mật khẩu?</Link>
            </div>

            <button type="submit" className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700">
              Đăng nhập
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:underline">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
