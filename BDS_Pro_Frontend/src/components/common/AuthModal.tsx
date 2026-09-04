import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Phone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('buyer');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({ name, email, password, phone, role });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title & Tabs */}
        <div className="mb-6 text-center">
          <h3 className="text-2xl font-bold text-slate-900">
            {mode === 'login' ? 'Đăng nhập tài khoản' : 'Đăng ký tài khoản mới'}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {mode === 'login'
              ? 'Nhập thông tin để tiếp tục trải nghiệm BDS Pro'
              : 'Chọn vai trò và tạo tài khoản nhanh chóng'}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Họ và tên</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Số điện thoại</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Vai trò tài khoản (Actor)</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('buyer')}
                    className={`rounded-xl border p-2 text-xs font-medium transition ${
                      role === 'buyer'
                        ? 'border-brand-600 bg-brand-50 text-brand-700 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    👤 Người mua/thuê (User)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('agent')}
                    className={`rounded-xl border p-2 text-xs font-medium transition ${
                      role === 'agent'
                        ? 'border-brand-600 bg-brand-50 text-brand-700 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    🏠 Môi giới/Chủ nhà (Host)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`rounded-xl border p-2 text-xs font-medium transition ${
                      role === 'admin'
                        ? 'border-brand-600 bg-brand-50 text-brand-700 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    🛡️ Quản trị (Admin)
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-700 disabled:opacity-50"
          >
            {loading
              ? 'Đang xử lý...'
              : mode === 'login'
              ? 'Đăng nhập'
              : 'Đăng ký ngay'}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-slate-500">
          {mode === 'login' ? (
            <>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-semibold text-brand-600 hover:underline"
              >
                Đăng ký tài khoản mới
              </button>
            </>
          ) : (
            <>
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-semibold text-brand-600 hover:underline"
              >
                Đăng nhập ngay
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
