import { Link, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { LogoutButton } from '@/components/common/LogoutButton'
import { BrandLogo } from '@/components/layout/shared/BrandLogo'
import type { NavItem } from '@/config/routes'

export interface PortalSidebarConfig {
  homePath: string
  dashboardPath: string
  badge: string
  title: string
  subtitle?: string
  nav: NavItem[]
}

interface PortalSidebarProps {
  config: PortalSidebarConfig
  collapsed?: boolean
  onToggle?: () => void
  footer?: ReactNode
}

export function PortalSidebar({ config, collapsed = false, onToggle, footer }: PortalSidebarProps) {
  const location = useLocation()

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-56 sm:w-64'
      }`}
    >
      <div
        className={`flex h-14 items-center border-b border-slate-100 sm:h-16 ${
          collapsed ? 'justify-center px-2' : 'justify-between px-3 sm:px-4'
        }`}
      >
        {!collapsed && (
          <BrandLogo
            to={config.homePath}
            badge={config.badge}
            title={config.title}
            subtitle={config.subtitle}
            size="sm"
          />
        )}
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2 lg:p-3">
        {config.nav.map((item) => {
          const active =
            item.path === config.dashboardPath
              ? location.pathname === item.path || location.pathname === config.homePath
              : location.pathname.startsWith(item.path)
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`portal-nav-link relative ${active ? 'portal-nav-link-active' : ''} ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-brand-600' : 'text-slate-400'}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.badge ? (
                <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              ) : null}
              {collapsed && item.badge ? (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
              ) : null}
            </Link>
          )
        })}
      </nav>

      <div className="space-y-2 border-t border-slate-100 p-2 lg:p-3">
        {footer}
        <LogoutButton variant="sidebar-light" showLabel={!collapsed} className={collapsed ? 'justify-center px-2' : ''} />
      </div>
    </aside>
  )
}
