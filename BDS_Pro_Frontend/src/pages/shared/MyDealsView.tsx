import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Calendar, ChevronRight, HandCoins, KeyRound, MapPin } from 'lucide-react'
import { Badge } from '@/components/common/Badge'
import { currentUsers, userDeals } from '@/data/mockData'
import { formatPrice, transactionLabels } from '@/utils/format'
import type { DealStatus, TransactionType, UserRole } from '@/types'
import { CLIENT_ROUTES } from '@/config/routes'

const DEAL_STATUS: Record<DealStatus, { label: string; class: string }> = {
  deposit_paid: { label: 'Đã đặt cọc', class: 'bg-sky-100 text-sky-700' },
  in_progress: { label: 'Đang xử lý', class: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Hoàn tất', class: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Đã hủy', class: 'bg-slate-100 text-slate-600' },
}

interface MyDealsViewProps {
  role: Extract<UserRole, 'buyer' | 'agent'>
  embedded?: boolean
}

export function MyDealsView({ role, embedded = false }: MyDealsViewProps) {
  const userId = role === 'buyer' ? currentUsers.buyer.id : currentUsers.agent.id

  const clientTabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'rent', label: 'Đang thuê' },
    { id: 'sale', label: 'Đã mua / Mua' },
  ] as const

  const brokerTabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'rent', label: 'Cho thuê' },
    { id: 'sale', label: 'Đã bán' },
    { id: 'active', label: 'Đang xử lý' },
  ] as const

  const tabs = role === 'buyer' ? clientTabs : brokerTabs
  const [activeTab, setActiveTab] = useState<string>('all')

  const deals = useMemo(() => {
    return userDeals.filter((d) =>
      role === 'buyer' ? d.buyerId === userId : d.agentId === userId,
    )
  }, [role, userId])

  const filtered = useMemo(() => {
    if (activeTab === 'all') return deals
    if (activeTab === 'active') {
      return deals.filter((d) => d.dealStatus === 'deposit_paid' || d.dealStatus === 'in_progress')
    }
    return deals.filter((d) => d.transactionType === activeTab)
  }, [deals, activeTab])

  const stats = useMemo(() => ({
    rent: deals.filter((d) => d.transactionType === 'rent').length,
    sale: deals.filter((d) => d.transactionType === 'sale').length,
    completed: deals.filter((d) => d.dealStatus === 'completed').length,
  }), [deals])

  const propertyPath = role === 'buyer' ? CLIENT_ROUTES.property : undefined

  return (
    <div className="space-y-5">
      {!embedded && (
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {role === 'buyer' ? 'Giao dịch của tôi' : 'Giao dịch đã chốt'}
          </h1>
          <p className="mt-1 text-slate-500">
            {role === 'buyer'
              ? 'Theo dõi BĐS bạn đang thuê, đang mua và đã hoàn tất'
              : 'BĐS đã cho thuê, đã bán và đang trong quy trình giao dịch'}
          </p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <KeyRound className="h-5 w-5 text-sky-600" />
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.rent}</p>
          <p className="text-xs text-slate-500">{role === 'buyer' ? 'Hợp đồng thuê' : 'Cho thuê'}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <Building2 className="h-5 w-5 text-emerald-600" />
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.sale}</p>
          <p className="text-xs text-slate-500">{role === 'buyer' ? 'Mua bán' : 'Đã bán'}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <HandCoins className="h-5 w-5 text-violet-600" />
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.completed}</p>
          <p className="text-xs text-slate-500">Hoàn tất</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            Chưa có giao dịch trong mục này.
          </div>
        ) : (
          filtered.map((deal) => {
            const st = DEAL_STATUS[deal.dealStatus]
            const detailPath = propertyPath?.(deal.propertyId)

            const inner = (
              <>
                <img
                  src={deal.propertyImage}
                  alt=""
                  className="h-28 w-full shrink-0 rounded-xl object-cover sm:h-24 sm:w-32"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start gap-2">
                    <Badge className="bg-sky-100 text-sky-700">
                      {transactionLabels[deal.transactionType as TransactionType]}
                    </Badge>
                    <Badge className={st.class}>{st.label}</Badge>
                  </div>
                  <h3 className="mt-2 font-semibold text-slate-900">{deal.propertyTitle}</h3>
                  <p className="mt-1 flex items-start gap-1 text-xs text-slate-500">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {deal.address}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <span className="font-bold text-sky-700">
                      {formatPrice(deal.price, deal.transactionType)}
                    </span>
                    <span className="text-slate-500">
                      Cọc: {deal.depositAmount.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {role === 'buyer' ? `Môi giới: ${deal.agentName}` : `Khách: ${deal.buyerName}`}
                    {' · '}
                    <Calendar className="mr-0.5 inline h-3 w-3" />
                    {deal.completedAt
                      ? `Hoàn tất ${new Date(deal.completedAt).toLocaleDateString('vi-VN')}`
                      : `Bắt đầu ${new Date(deal.createdAt).toLocaleDateString('vi-VN')}`}
                  </p>
                </div>
                {detailPath && (
                  <ChevronRight className="hidden h-5 w-5 shrink-0 text-slate-300 sm:block" />
                )}
              </>
            )

            return detailPath ? (
              <Link
                key={deal.id}
                to={detailPath}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-sky-200 hover:shadow-md sm:flex-row sm:items-center"
              >
                {inner}
              </Link>
            ) : (
              <div
                key={deal.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
              >
                {inner}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
