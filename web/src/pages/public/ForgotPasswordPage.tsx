import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'

export function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <Link to="/login" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Quay lại đăng nhập
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Quên mật khẩu</h1>
        <p className="mt-2 text-sm text-slate-500">Nhập email/SĐT để nhận mã OTP xác thực (FR-U02)</p>

        <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="text-sm font-medium text-slate-700">Email hoặc SĐT</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="email@gmail.com hoặc 0901234567" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500" />
            </div>
          </div>
          <button type="submit" className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700">
            Gửi mã OTP
          </button>
        </form>

        <div className="mt-6 rounded-xl bg-slate-50 p-4 text-center">
          <p className="text-sm text-slate-600">Demo: Mã OTP là <strong>123456</strong></p>
          <input type="text" placeholder="Nhập OTP" maxLength={6} className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-center text-lg tracking-widest outline-none focus:border-brand-500" />
          <button type="button" className="mt-3 w-full rounded-xl border border-brand-600 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-50">
            Xác nhận & đặt lại mật khẩu
          </button>
        </div>
      </div>
    </div>
  )
}
