import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { AdminUserDetailModal } from '@/components/admin/AdminUserDetailModal';
import { ADMIN_ROUTES } from '@/config/routes';
import type { User } from '@/types';

export function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminService
      .getUserDetail(id)
      .then((res) => {
        setUser(res);
      })
      .catch((err) => {
        setError(err.message || 'Không tìm thấy thông tin người dùng');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm font-semibold text-slate-600">Đang nạp hồ sơ người dùng...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-sm text-rose-600 font-semibold">{error || 'Không tìm thấy người dùng'}</p>
        <Link
          to={ADMIN_ROUTES.users}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại danh sách người dùng</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        to={ADMIN_ROUTES.users}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Quay lại Quản lý Người dùng</span>
      </Link>

      <AdminUserDetailModal
        user={user}
        onClose={() => navigate(ADMIN_ROUTES.users)}
        onUserUpdated={(updated) => setUser(updated)}
        onUserDeleted={() => navigate(ADMIN_ROUTES.users)}
      />
    </div>
  );
}

