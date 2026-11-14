import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Calendar, ChevronRight, HandCoins, KeyRound, MapPin, RefreshCw, ShieldCheck } from 'lucide-react';
import { currentUsers, userDeals as mockDeals } from '@/data/mockData';
import { formatPrice, transactionLabels } from '@/utils/format';
import { transactionService } from '@/services/transaction.service';
import { useAuth } from '@/context/AuthContext';
import type { DealStatus, TransactionType, UserRole } from '@/types';
import { CLIENT_ROUTES } from '@/config/routes';

const DEAL_STATUS: Record<DealStatus, { label: string; class: string }> = {
  deposit_paid: { label: 'Đã đặt cọc (Ký quỹ)', class: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  in_progress: { label: 'Đang thẩm định / Ký HĐ', class: 'bg-amber-100 text-amber-800 border-amber-200' },
  completed: { label: 'Giao dịch thành công', class: 'bg-blue-100 text-blue-800 border-blue-200' },
  cancelled: { label: 'Đã hủy / Hoàn cọc', class: 'bg-slate-100 text-slate-600 border-slate-200' },
};

interface MyDealsViewProps {
  role: Extract<UserRole, 'buyer' | 'agent'>;
  embedded?: boolean;
}

export function MyDealsView({ role, embedded = false }: MyDealsViewProps) {
  const { user } = useAuth();
  const currentUserId = user?.id || (role === 'buyer' ? currentUsers.buyer.id : currentUsers.agent.id);

  const [liveDeals, setLiveDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('all');

  const clientTabs = [
    { id: 'all', label: 'Tất cả thương vụ' },
    { id: 'rent', label: 'Thuê nhà' },
    { id: 'sale', label: 'Mua bán' },
  ] as const;

  const brokerTabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'rent', label: 'Cho thuê' },
    { id: 'sale', label: 'Đã bán' },
    { id: 'active', label: 'Đang giữ cọc' },
  ] as const;

  const tabs = role === 'buyer' ? clientTabs : brokerTabs;

  // Fetch live deals from Backend API
  const fetchDeals = () => {
    setLoading(true);
    transactionService
      .getMyDeals({ limit: 50 })
      .then((res) => {
        const rawItems = res?.data || res?.items || (Array.isArray(res) ? res : []);
        const formatted = rawItems.map((d: any) => ({
          id: d.id,
          propertyId: d.propertyId,
          propertyTitle: d.property?.title || 'Căn hộ BĐS',
          propertyImage:
            d.property?.media?.[0]?.url ||
            d.property?.images?.[0] ||
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
          transactionType: d.transactionType || d.property?.transactionType || 'sale',
          dealStatus: d.dealStatus || 'deposit_paid',
          price: Number(d.price || d.property?.price || 0),
          depositAmount: Number(d.depositAmount || 0),
          address: d.property?.address ? `${d.property.address}, ${d.property.district || ''}` : 'TP. Hồ Chí Minh',
          buyerId: d.buyerId,
          buyerName: d.buyer?.name || 'Khách hàng',
          agentId: d.agentId,
          agentName: d.agent?.name || 'Môi giới phụ trách',
          completedAt: d.completedAt,
          createdAt: d.createdAt,
        }));

        // Merge with mock deals for rich demonstration if few live deals exist
        const merged = [...formatted];
        const existingIds = new Set(formatted.map((f: any) => f.id));
        mockDeals
          .filter((d) => (role === 'buyer' ? d.buyerId === currentUserId : d.agentId === currentUserId))
          .forEach((m) => {
            if (!existingIds.has(m.id)) merged.push(m);
          });

        setLiveDeals(merged);
      })
      .catch((err) => {
        console.error('Lỗi khi tải thương vụ:', err);
        // Fallback to mockDeals
        setLiveDeals(
          mockDeals.filter((d) => (role === 'buyer' ? d.buyerId === currentUserId : d.agentId === currentUserId)),
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDeals();
  }, [role, currentUserId]);

  const filtered = useMemo(() => {
    if (activeTab === 'all') return liveDeals;
    if (activeTab === 'active') {
      return liveDeals.filter((d) => d.dealStatus === 'deposit_paid' || d.dealStatus === 'in_progress');
    }
    return liveDeals.filter((d) => d.transactionType === activeTab);
  }, [liveDeals, activeTab]);

  const stats = useMemo(
    () => ({
      rent: liveDeals.filter((d) => d.transactionType === 'rent').length,
      sale: liveDeals.filter((d) => d.transactionType === 'sale').length,
      depositPaid: liveDeals.filter((d) => d.dealStatus === 'deposit_paid').length,
      completed: liveDeals.filter((d) => d.dealStatus === 'completed').length,
    }),
    [liveDeals],
  );

  const handleUpdateStatus = async (dealId: string, nextStatus: DealStatus) => {
    try {
      await transactionService.updateDealStatus(dealId, nextStatus);
      fetchDeals();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  return (
    <div className="space-y-6">
      {!embedded && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {role === 'buyer' ? 'Giao dịch & Đặt cọc của tôi' : 'Quản lý Giao dịch chốt cọc'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {role === 'buyer'
                ? 'Theo dõi BĐS bạn đã ký quỹ đặt cọc giữ chỗ, đang thuê hoặc đang xúc tiến mua bán'
                : 'Danh sách các căn hộ khách đã đặt cọc ký quỹ qua sàn BDS Pro và tiến độ hoàn tất'}
            </p>
          </div>
          <button
            type="button"
            onClick={fetchDeals}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Đang giữ cọc</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{stats.depositPaid}</p>
          <p className="text-[11px] text-emerald-700 font-medium">Bảo vệ qua BDS Pro Escrow</p>
        </div>

        <div className="rounded-3xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {role === 'buyer' ? 'Hợp đồng thuê' : 'Cho thuê'}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <KeyRound className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{stats.rent}</p>
          <p className="text-[11px] text-slate-500">Căn hộ &amp; Nhà phố thuê</p>
        </div>

        <div className="rounded-3xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {role === 'buyer' ? 'Mua bán' : 'Đã bán'}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{stats.sale}</p>
          <p className="text-[11px] text-slate-500">BĐS mua bán chuyển nhượng</p>
        </div>

        <div className="rounded-3xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Đã hoàn tất</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <HandCoins className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{stats.completed}</p>
          <p className="text-[11px] text-violet-700 font-medium">Bàn giao &amp; Ký HĐ xong</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-2xl px-4 py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Deals List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
            Chưa có giao dịch / đặt cọc nào trong mục này.
          </div>
        ) : (
          filtered.map((deal) => {
            const st = DEAL_STATUS[deal.dealStatus as DealStatus] || DEAL_STATUS.deposit_paid;
            const detailPath = CLIENT_ROUTES.property(deal.propertyId);

            return (
              <div
                key={deal.id}
                className="group flex flex-col gap-4 rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs transition hover:border-emerald-300 hover:shadow-md sm:flex-row sm:items-center"
              >
                <img
                  src={deal.propertyImage}
                  alt=""
                  className="h-28 w-full shrink-0 rounded-2xl object-cover sm:h-24 sm:w-36 shadow-xs"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                      {transactionLabels[deal.transactionType as TransactionType] || 'Mua bán'}
                    </span>
                    <span className={`inline-block rounded-md px-2.5 py-0.5 text-[11px] font-bold border ${st.class}`}>
                      {st.label}
                    </span>
                  </div>

                  <h3 className="mt-1.5 font-bold text-slate-900 group-hover:text-emerald-700 transition">
                    <Link to={detailPath}>{deal.propertyTitle}</Link>
                  </h3>

                  <p className="mt-1 flex items-start gap-1 text-xs text-slate-500 truncate">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                    {deal.address}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm">
                    <span className="font-extrabold text-emerald-700">
                      Giá chốt: {formatPrice(deal.price, deal.transactionType)}
                    </span>
                    <span className="font-bold text-slate-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60">
                      Tiền cọc ký quỹ: {deal.depositAmount.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <p className="mt-1.5 text-[11px] text-slate-400">
                    {role === 'buyer' ? `Môi giới: ${deal.agentName}` : `Khách mua/thuê: ${deal.buyerName}`}
                    {' · '}
                    <Calendar className="mr-0.5 inline h-3 w-3" />
                    {deal.completedAt
                      ? `Hoàn tất ngày ${new Date(deal.completedAt).toLocaleDateString('vi-VN')}`
                      : `Ngày đặt cọc: ${new Date(deal.createdAt).toLocaleDateString('vi-VN')}`}
                  </p>
                </div>

                {/* Right Action buttons */}
                <div className="flex sm:flex-col items-end gap-2 shrink-0">
                  <Link
                    to={detailPath}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-100 hover:text-emerald-800 transition"
                  >
                    <span>Xem BĐS</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>

                  {/* Broker Action button */}
                  {role === 'agent' && deal.dealStatus === 'deposit_paid' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(deal.id, 'in_progress' as DealStatus)}
                      className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer"
                    >
                      Bắt đầu thẩm định HĐ
                    </button>
                  )}
                  {role === 'agent' && deal.dealStatus === 'in_progress' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(deal.id, 'completed' as DealStatus)}
                      className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition cursor-pointer"
                    >
                      Xác nhận hoàn tất
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
