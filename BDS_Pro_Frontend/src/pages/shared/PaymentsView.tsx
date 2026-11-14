import { useEffect, useState } from 'react';
import {
  CreditCard,
  Printer,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { transactions as mockTransactions } from '@/data/mockData';
import { transactionService } from '@/services/transaction.service';
import type { UserRole } from '@/types';

const methodLabels: Record<string, string> = {
  vnpay: 'VNPay Sandbox',
  momo: 'Ví MoMo',
  bank: 'Chuyển khoản VietQR',
  bank_transfer: 'Chuyển khoản Ngân hàng',
};

const statusConfig: Record<string, { label: string; class: string }> = {
  pending: { label: 'Chờ giải ngân', class: 'bg-amber-100 text-amber-800 border-amber-200' },
  completed: { label: 'Đã ký quỹ Escrow', class: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  failed: { label: 'Thất bại', class: 'bg-red-100 text-red-800 border-red-200' },
  refunded: { label: 'Đã hoàn cọc 100%', class: 'bg-blue-100 text-blue-800 border-blue-200' },
  disputed: { label: 'Đang khiếu nại', class: 'bg-orange-100 text-orange-800 border-orange-200' },
};

interface PaymentsViewProps {
  role: UserRole;
}

export function PaymentsView({ role }: PaymentsViewProps) {
  const titles = {
    buyer: { title: 'Đặt cọc & Biên lai ký quỹ', desc: 'Theo dõi tiền cọc đang được sàn BDS Pro bảo vệ qua tài khoản Escrow' },
    agent: { title: 'Giao dịch nhận cọc từ Khách', desc: 'Danh sách các căn hộ khách đã thanh toán tiền giữ chỗ qua sàn' },
    admin: { title: 'Giám sát Ký quỹ Escrow & Giao dịch', desc: 'Kiểm soát dòng tiền đặt cọc trung gian, phê duyệt giải ngân hoặc hoàn cọc' },
  };
  const t = titles[role];

  const [liveList, setLiveList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchPayments = () => {
    setLoading(true);
    const apiCall = role === 'admin' ? transactionService.getAdminPayments() : transactionService.getMyPayments();

    apiCall
      .then((data: any) => {
        const rawItems = Array.isArray(data) ? data : data?.data || [];
        const formatted = rawItems.map((tx: any) => ({
          id: tx.id,
          propertyId: tx.propertyId,
          propertyTitle: tx.property?.title || 'Căn hộ BĐS',
          propertyImage:
            tx.property?.media?.[0]?.url ||
            tx.property?.images?.[0] ||
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
          buyerName: tx.buyerName || tx.buyer?.name || 'Khách hàng',
          agentName: tx.agent?.name || 'Môi giới đại diện',
          amount: Number(tx.amount || 0),
          method: tx.method || 'bank',
          status: tx.status || 'completed',
          receiptId: tx.receiptId || `REC_${Date.now()}`,
          note: tx.note,
          createdAt: tx.createdAt ? new Date(tx.createdAt).toLocaleString('vi-VN') : 'Vừa xong',
        }));

        // Merge with mock transactions for rich demonstration
        const merged = [...formatted];
        const existingIds = new Set(formatted.map((f: any) => f.id));
        mockTransactions.forEach((m: any) => {
          if (!existingIds.has(m.id)) merged.push(m);
        });

        setLiveList(merged);
      })
      .catch((err) => {
        console.error('Lỗi khi tải lịch sử thanh toán:', err);
        setLiveList(mockTransactions);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayments();
  }, [role]);

  const handleEscrow = async (txId: string, action: 'payout' | 'refund') => {
    const actionText = action === 'payout' ? 'giải ngân tiền cọc cho môi giới' : 'hoàn tiền cọc 100% cho khách hàng';
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionText}?`)) return;

    try {
      setActionLoadingId(txId);
      await transactionService.handleEscrowAction(
        txId,
        action,
        action === 'payout' ? 'Đã ký HĐ công chứng thành công' : 'Khách hàng hủy cọc do sai lệch cam kết',
      );
      fetchPayments();
      alert(`Đã xử lý ${actionText} thành công!`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi xử lý Escrow');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePrint = (tx: any) => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html>
        <head><title>Biên lai - ${tx.receiptId}</title></head>
        <body style="font-family: sans-serif; padding: 40px; color: #1e293b;">
          <h2 style="color: #059669; border-bottom: 2px solid #059669; padding-bottom: 10px;">BDS PRO — BIÊN LAI KÝ QUỸ ĐẶT CỌC</h2>
          <p>Mã biên lai: <strong>#${tx.receiptId}</strong></p>
          <p>BĐS: <strong>${tx.propertyTitle}</strong></p>
          <p>Người nộp tiền: <strong>${tx.buyerName}</strong></p>
          <p>Môi giới phụ trách: <strong>${tx.agentName}</strong></p>
          <p>Số tiền ký quỹ: <strong style="font-size: 18px; color: #059669;">${tx.amount.toLocaleString('vi-VN')} VNĐ</strong></p>
          <p>Phương thức: <strong>${methodLabels[tx.method] || tx.method}</strong></p>
          <p>Thời gian: ${tx.createdAt}</p>
          <div style="margin-top: 30px; padding: 12px; border: 2px dashed #059669; color: #059669; font-weight: bold; width: fit-content;">
            ✓ TIỀN ĐANG ĐƯỢC BẢO VỆ QUA TÀI KHOẢN ESCROW BDS PRO
          </div>
        </body>
      </html>
    `);
    w.document.close();
    w.focus();
    w.print();
  };

  const completedCount = liveList.filter((x: any) => x.status === 'completed').length;
  const pendingCount = liveList.filter((x: any) => x.status === 'pending').length;
  const refundedCount = liveList.filter((x: any) => x.status === 'refunded').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader title={t.title} description={t.desc} />
        <button
          type="button"
          onClick={fetchPayments}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Đã Ký quỹ Escrow</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{completedCount}</p>
          <p className="text-xs text-emerald-700 font-medium">Bảo vệ an toàn 100%</p>
        </div>

        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Chờ giải ngân</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{pendingCount}</p>
          <p className="text-xs text-slate-500">Đang thẩm định hợp đồng</p>
        </div>

        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Đã hoàn cọc</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <RotateCcw className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{refundedCount}</p>
          <p className="text-xs text-slate-500">Hoàn tiền an toàn cho khách</p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {liveList.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
            Chưa có lịch sử thanh toán / đặt cọc nào.
          </div>
        ) : (
          liveList.map((tx: any) => {
            const st = statusConfig[tx.status] || statusConfig.completed;
            const isEscrowing = tx.status === 'completed' || tx.status === 'pending';

            return (
              <div
                key={tx.id}
                className="flex flex-col gap-4 rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs transition hover:border-emerald-300 hover:shadow-md sm:flex-row sm:items-center"
              >
                <img
                  src={tx.propertyImage}
                  alt=""
                  className="h-24 w-full shrink-0 rounded-2xl object-cover sm:h-20 sm:w-28 shadow-xs"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">{tx.propertyTitle}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {role === 'buyer' && `Môi giới: ${tx.agentName}`}
                        {role === 'agent' && `Khách hàng: ${tx.buyerName}`}
                        {role === 'admin' && `Khách: ${tx.buyerName} → Môi giới: ${tx.agentName}`}
                      </p>
                    </div>
                    <span className={`inline-block rounded-md px-2.5 py-0.5 text-[11px] font-bold border ${st.class}`}>
                      {st.label}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span className="font-extrabold text-emerald-700 text-sm">
                      {tx.amount.toLocaleString('vi-VN')} đ
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-600">
                      {methodLabels[tx.method] || tx.method}
                    </span>
                    <span className="text-slate-400">{tx.createdAt}</span>
                    {tx.receiptId && (
                      <span className="font-mono font-bold text-slate-700">#{tx.receiptId}</span>
                    )}
                  </div>

                  {tx.note && (
                    <p className="mt-1 text-[11px] text-slate-400 italic">Ghi chú: {tx.note}</p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {tx.receiptId && (
                    <button
                      type="button"
                      onClick={() => handlePrint(tx)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <Printer className="h-3.5 w-3.5 text-emerald-600" />
                      <span>In biên lai</span>
                    </button>
                  )}

                  {/* Admin Escrow Actions */}
                  {role === 'admin' && isEscrowing && (
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        disabled={actionLoadingId === tx.id}
                        onClick={() => handleEscrow(tx.id, 'payout')}
                        className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50"
                        title="Giải ngân tiền cọc cho môi giới sau khi hoàn tất ký hợp đồng"
                      >
                        ✓ Giải ngân cọc
                      </button>
                      <button
                        type="button"
                        disabled={actionLoadingId === tx.id}
                        onClick={() => handleEscrow(tx.id, 'refund')}
                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition cursor-pointer disabled:opacity-50"
                        title="Hoàn tiền 100% cho khách nếu BĐS sai lệch"
                      >
                        Hoàn cọc
                      </button>
                    </div>
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
