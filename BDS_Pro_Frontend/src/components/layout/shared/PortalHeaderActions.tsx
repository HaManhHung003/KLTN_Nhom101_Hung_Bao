import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, LogIn, User as UserIcon } from 'lucide-react';
import { LogoutButton } from '@/components/common/LogoutButton';
import { AuthModal } from '@/components/common/AuthModal';
import { useAuth } from '@/context/AuthContext';
import { ADMIN_ROUTES, BROKER_ROUTES, CLIENT_ROUTES } from '@/config/routes';

export function PortalHeaderActions() {
  const { user, actorRole } = useAuth();
  const [openNotif, setOpenNotif] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setAuthMode('login');
            setAuthModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <LogIn className="h-4 w-4" />
          <span>Đăng nhập</span>
        </button>
        <button
          onClick={() => {
            setAuthMode('register');
            setAuthModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700 shadow-sm"
        >
          <UserIcon className="h-4 w-4" />
          <span>Đăng ký</span>
        </button>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authMode}
        />
      </div>
    );
  }

  const roleLabelMap: Record<string, string> = {
    guest: 'Khách vãng lai',
    user: '👤 Khách hàng (User)',
    host: '🏠 Môi giới/Chủ nhà (Host)',
    admin: '🛡️ Quản trị (Admin)',
  };

  const portalRouteMap: Record<string, string> = {
    user: CLIENT_ROUTES.home,
    host: BROKER_ROUTES.dashboard,
    admin: ADMIN_ROUTES.dashboard,
  };

  return (
    <div className="flex shrink-0 items-center gap-1 sm:gap-3">
      {/* Target Portal Link */}
      {actorRole !== 'guest' && (
        <Link
          to={portalRouteMap[actorRole] || CLIENT_ROUTES.home}
          className="hidden md:inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
        >
          <span>{roleLabelMap[actorRole]}</span>
        </Link>
      )}

      {/* Notifications */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenNotif((v) => !v)}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 sm:p-2.5"
        >
          <Bell className="h-5 w-5" />
        </button>

        {openNotif && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpenNotif(false)} />
            <div className="absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-1.5rem))] rounded-2xl border border-slate-200 bg-white shadow-xl p-4">
              <p className="font-semibold text-slate-900 text-sm">Thông báo</p>
              <p className="mt-1 text-xs text-slate-500">Chưa có thông báo mới nào.</p>
            </div>
          </>
        )}
      </div>

      {/* Profile info */}
      <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:pl-3">
        <img
          src={user.avatar || 'https://i.pravatar.cc/150?u=user'}
          alt={user.name}
          className="h-8 w-8 rounded-full ring-2 ring-brand-100"
        />
        <div className="hidden sm:block">
          <p className="max-w-[120px] truncate text-sm font-semibold text-slate-900">{user.name}</p>
          <p className="text-[10px] uppercase font-bold text-brand-600">{user.role}</p>
        </div>
      </div>

      <LogoutButton variant="ghost" showLabel={false} />
    </div>
  );
}
