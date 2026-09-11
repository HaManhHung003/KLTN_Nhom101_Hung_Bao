import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminMobileNav } from '@/components/layout/admin/AdminMobileNav'
import { AdminSidebar } from '@/components/layout/admin/AdminSidebar'
import { AdminTopBar } from '@/components/layout/admin/AdminTopBar'
import { PortalMobileHeader } from '@/components/layout/shared/PortalMobileHeader'
import { ADMIN_ROUTES } from '@/config/routes'

/** Platform administration console */
export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="portal-shell">
      <div className="hidden md:block">
        <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      </div>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)} aria-hidden />
          <div className="fixed inset-y-0 left-0 z-50 md:hidden">
            <AdminSidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
          </div>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <PortalMobileHeader
          title="BDS Pro"
          homePath={ADMIN_ROUTES.dashboard}
          badge="QT"
          menuOpen={mobileOpen}
          onOpenMenu={() => setMobileOpen(true)}
          onCloseMenu={() => setMobileOpen(false)}
        />
        <AdminTopBar />
        <AdminMobileNav />
        <main className="portal-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
