import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { BrokerSidebar } from '@/components/layout/broker/BrokerSidebar'
import { BrokerTopBar } from '@/components/layout/broker/BrokerTopBar'
import { PortalMobileHeader } from '@/components/layout/shared/PortalMobileHeader'
import { BROKER_ROUTES } from '@/config/routes'

/** Broker / owner CRM workspace */
export function BrokerLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="portal-shell">
      <div className="hidden md:block">
        <BrokerSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      </div>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)} aria-hidden />
          <div className="fixed inset-y-0 left-0 z-50 md:hidden">
            <BrokerSidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
          </div>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <PortalMobileHeader
          title="BDS Pro"
          homePath={BROKER_ROUTES.dashboard}
          badge="MG"
          menuOpen={mobileOpen}
          onOpenMenu={() => setMobileOpen(true)}
          onCloseMenu={() => setMobileOpen(false)}
        />
        <BrokerTopBar />
        <main className="portal-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
