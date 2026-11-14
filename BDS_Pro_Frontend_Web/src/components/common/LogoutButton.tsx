import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { CLIENT_ROUTES } from '@/config/routes';

interface LogoutButtonProps {
  variant?: 'default' | 'ghost' | 'sidebar-dark' | 'sidebar-light';
  className?: string;
  showLabel?: boolean;
}

export function LogoutButton({ variant = 'default', className = '', showLabel = true }: LogoutButtonProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(CLIENT_ROUTES.auth);
  };

  const styles = {
    default:
      'inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-red-50 hover:border-red-200 hover:text-red-600',
    ghost:
      'inline-flex items-center gap-2 rounded-xl p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600',
    'sidebar-dark':
      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-red-400',
    'sidebar-light':
      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600',
  }[variant];

  return (
    <button onClick={handleLogout} type="button" className={`${styles} ${className}`} title="Đăng xuất">
      <LogOut className="h-4 w-4 shrink-0" />
      {showLabel && <span>Đăng xuất</span>}
    </button>
  );
}
