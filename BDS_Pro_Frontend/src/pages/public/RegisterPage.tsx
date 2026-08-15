import { Link } from 'react-router-dom'
import { Building2, Mail, Phone, Lock, User, Shield } from 'lucide-react'
import { useState } from 'react'

export function RegisterPage() {
  const [accountType, setAccountType] = useState<'buyer' | 'agent'>('buyer')

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 font-bold text-white">BP</div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Đăng ký tài khoản</h1>
          <p className="mt-2 text-sm text-slate-500">FR-U01 — Email/SĐT, OAuth Google/Facebook (demo)</p>
        </div>

        <div className="mt-6 flex gap-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setAccountType('buyer')}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${accountType === 'buyer' ? 'bg-white shadow text-brand-700' : 'text-slate-600'}`}
          >
            Người tìm BĐS
          </button>
          <button
            type="button"
            onClick={() => setAccountType('agent')}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${accountType === 'agent' ? 'bg-white shadow text-brand-700' : 'text-slate-600'}`}
          >
            Môi giới / Chủ BĐS
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="text-sm font-medium text-slate-700">Họ và tên</label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Nguyễn Văn A" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="email" placeholder="email@gmail.com" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="tel" placeholder="0901234567" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="password" placeholder="••••••••" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500" />
            </div>
          </div>

          {accountType === 'agent' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
                <Shield className="h-4 w-4" />
                Xác minh môi giới (FR-U05)
              </div>
              <p className="mt-1 text-xs text-amber-700">Upload CMND/CCCD và giấy phép môi giới sau khi đăng ký</p>
              <button type="button" className="mt-2 text-xs font-medium text-brand-600 hover:underline">+ Tải lên giấy tờ</button>
            </div>
          )}

          <button type="submit" className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700">
            Tạo tài khoản
          </button>
        </form>

        <div className="mt-4 flex gap-3">
          <button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm hover:bg-slate-50">
            <Building2 className="h-4 w-4" /> Google
          </button>
          <button type="button" className="flex flex-1 rounded-xl border border-slate-200 py-2.5 text-sm hover:bg-slate-50">
            Facebook
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Đã có tài khoản? <Link to="/login" className="font-semibold text-brand-600 hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  )
}
