import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ADMIN_ROUTES, BROKER_ROUTES, CLIENT_ROUTES } from '@/config/routes';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login({ email, password });
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      if (user?.role === 'admin') {
        navigate(ADMIN_ROUTES.dashboard);
      } else if (user?.role === 'agent') {
        navigate(BROKER_ROUTES.dashboard);
      } else {
        navigate(CLIENT_ROUTES.home);
      }
    } catch (err: any) {
      setError(err.message || 'Email hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 via-emerald-50/20 to-slate-100 px-4 py-12">
      {/* Nút quay lại trang chủ */}
      <div className="absolute left-6 top-6">
        <Link
          to={CLIENT_ROUTES.home}
          className="inline-flex items-center gap-2 rounded-xl bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur transition hover:bg-white hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Về trang chủ</span>
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* Card đăng nhập */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50 sm:p-10">
          {/* Logo & Tiêu đề */}
          <div className="text-center">
            <Link to={CLIENT_ROUTES.home} className="inline-flex items-center gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-lg font-bold text-white shadow-md shadow-brand-500/20">
                BP
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">BDS Pro</span>
            </Link>
            <h1 className="mt-5 text-2xl font-bold text-slate-900">Chào mừng trở lại!</h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Đăng nhập để quản lý và tìm kiếm bất động sản
            </p>
          </div>

          {/* Thông báo lỗi */}
          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-center text-xs font-semibold text-red-600">
              {error}
            </div>
          )}

          {/* Biểu mẫu đăng nhập */}
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-semibold text-slate-700">Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Mật khẩu</label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative mt-1">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center pt-1">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <span>Đăng nhập</span>
              )}
            </button>
          </form>

          {/* Chuyển hướng đăng ký */}
          <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-500">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:underline">
              Đăng ký tài khoản mới
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
