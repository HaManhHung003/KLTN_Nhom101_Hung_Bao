import { Link } from 'react-router-dom';
import { Plus, Shield } from 'lucide-react';
import { PortalTopBar } from '@/components/layout/shared/PortalTopBar';
import { ADMIN_ROUTES } from '@/config/routes';

export function AdminTopBar() {
  return (
    <PortalTopBar
      searchPlaceholder="Tìm kiếm user, tin đăng, báo cáo..."
      actions={
        <>
          <Link to={ADMIN_ROUTES.moderation} className="portal-btn-ghost hidden sm:inline-flex">
            <Shield className="h-4 w-4" />
            Kiểm duyệt tin
          </Link>
          <button type="button" className="portal-btn-primary !px-2.5 !py-1.5 text-xs sm:!px-3 sm:!py-2 sm:text-sm">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Thao tác nhanh</span>
          </button>
        </>
      }
    />
  );
}
