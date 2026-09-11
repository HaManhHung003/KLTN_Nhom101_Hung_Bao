import { Menu, X } from 'lucide-react'
import { BrandLogo } from '@/components/layout/shared/BrandLogo'

interface PortalMobileHeaderProps {
  title: string
  homePath: string
  badge: string
  menuOpen: boolean
  onOpenMenu: () => void
  onCloseMenu: () => void
}

export function PortalMobileHeader({
  title,
  homePath,
  badge,
  menuOpen,
  onOpenMenu,
  onCloseMenu,
}: PortalMobileHeaderProps) {
  return (
    <div className="flex h-14 items-center gap-2 border-b border-slate-200 bg-white px-3 md:hidden">
      <button type="button" onClick={onOpenMenu} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Mở menu">
        <Menu className="h-5 w-5" />
      </button>
      <BrandLogo to={homePath} badge={badge} title={title} size="sm" />
      {menuOpen && (
        <button type="button" onClick={onCloseMenu} className="ml-auto rounded-lg p-2 text-slate-600" aria-label="Đóng menu">
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
