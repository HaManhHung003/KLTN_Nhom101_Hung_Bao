import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authStorage } from '@/services/auth.service';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  const hasToken = authStorage.isAuthenticated();

  // Đang nạp profile khi có token trong localStorage
  if (loading && hasToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Đang xác thực quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập -> Chuyển hướng tới login kèm state.from để sau đó quay lại
  if (!hasToken || (!loading && !user)) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  // Kiểm tra quyền (Role)
  if (allowedRoles && allowedRoles.length > 0 && user) {
    const role = user.role;
    const isAllowed = allowedRoles.some((allowed) => {
      if (allowed === role) return true;
      if (allowed === 'agent' && (role === 'agent' as any)) return true;
      if (allowed === 'host' && (role === 'agent' as any)) return true;
      if (allowed === 'buyer' && (role === 'buyer' as any)) return true;
      if (allowed === 'user' && (role === 'buyer' as any)) return true;
      return false;
    });

    if (!isAllowed) {
      // Nếu không có quyền vào portal này, điều hướng về đúng portal của họ
      if (role === 'admin') return <Navigate to="/admin" replace />;
      if (role === 'agent') return <Navigate to="/broker" replace />;
      return <Navigate to="/client" replace />;
    }
  }

  return children;
}

