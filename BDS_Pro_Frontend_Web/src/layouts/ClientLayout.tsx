import { Outlet, useLocation } from 'react-router-dom'
import { FloatingMessengerChat } from '@/components/chat/FloatingMessengerChat'
import { ClientBottomNav } from '@/components/layout/client/ClientBottomNav'
import { ClientFooter, ClientHeader } from '@/components/layout/client/ClientChrome'

const FULL_BLEED_PREFIXES = ['/client/tim-kiem', '/client/chat']

/** Public-facing client portal — marketplace IA */
export function ClientLayout() {
  const { pathname } = useLocation()
  const fullBleed = FULL_BLEED_PREFIXES.some((p) => pathname.startsWith(p))
  const isChatPage = pathname.startsWith('/client/chat')

  return (
    <div className="portal-shell flex-col bg-white">
      <ClientHeader />
      <main
        className={
          fullBleed
            ? 'w-full flex-1 px-4 py-4 pb-20 sm:px-6 md:pb-8'
            : 'mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 sm:px-6 sm:py-8 md:pb-8'
        }
      >
        <Outlet />
      </main>
      {!fullBleed && <ClientFooter />}
      <ClientBottomNav />
      {!isChatPage && <FloatingMessengerChat />}
    </div>
  )
}
