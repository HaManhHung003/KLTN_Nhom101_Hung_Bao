import { CreditCard, Download, Shield, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/common/Badge';
import { transactions } from '@/data/mockData';
import type { UserRole } from '@/types';

const methodLabels: Record<string, string> = { vnpay: 'VNPay', momo: 'MoMo', bank: 'Chuyển khoản' };
const statusConfig: Record<string, { label: string; class: string }> = {
  pending: { label: 'Chờ xử lý', class: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Thành công', class: 'bg-emerald-100 text-emerald-700' },
  failed: { label: 'Thất bại', class: 'bg-red-100 text-red-700' },
  refunded: { label: 'Đã hoàn tiền', class: 'bg-blue-100 text-blue-700' },
  disputed: { label: 'Khiếu nại', class: 'bg-orange-100 text-orange-700' },
};

interface PaymentsViewProps {
  role: UserRole;
}

export function PaymentsView({ role }: PaymentsViewProps) {
  const titles = {
    buyer: { title: 'Đặt cọc & Thanh toán', desc: 'Lịch sử giao dịch, biên lai điện tử' },
    agent: { title: 'Giao dịch cọc', desc: 'Nhận thông báo khi khách đặt cọc thành công' },
    admin: { title: 'Giám sát giao dịch', desc: 'Theo dõi toàn bộ giao dịch, escrow & khiếu nại' },
  };
  const t = titles[role];

  return (
    <div>
      <PageHeader title={t.title} description={t.desc} />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Shield className="h-6 w-6 text-brand-600" />
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {transactions.filter((x: any) => x.status === 'completed').length}
          </p>
          <p className="text-sm text-slate-500">Giao dịch thành công</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <CreditCard className="h-6 w-6 text-amber-600" />
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {transactions.filter((x: any) => x.status === 'pending').length}
          </p>
          <p className="text-sm text-slate-500">Đang chờ xử lý</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <AlertCircle className="h-6 w-6 text-orange-600" />
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {transactions.filter((x: any) => x.status === 'disputed').length}
          </p>
          <p className="text-sm text-slate-500">Khiếu nại / tranh chấp</p>
        </div>
      </div>

      <div className="space-y-4">
        {transactions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
            Chưa có lịch sử thanh toán / đặt cọc nào.
          </div>
        ) : (
          transactions.map((tx: any) => {
            const st = statusConfig[tx.status] || statusConfig.pending;
            return (
              <div key={tx.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
                <img src={tx.propertyImage} alt="" className="h-20 w-28 shrink-0 rounded-xl object-cover" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{tx.propertyTitle}</h3>
                      <p className="text-sm text-slate-500">
                        {role === 'buyer' && `Môi giới: ${tx.agentName}`}
                        {role === 'agent' && `Khách: ${tx.buyerName}`}
                        {role === 'admin' && `${tx.buyerName} → ${tx.agentName}`}
                      </p>
                    </div>
                    <Badge className={st.class}>{st.label}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm">
                    <span className="font-bold text-brand-700">{tx.amount.toLocaleString('vi-VN')} đ</span>
                    <span className="text-slate-500">{methodLabels[tx.method] || tx.method}</span>
                    <span className="text-slate-400">{tx.createdAt}</span>
                    {tx.receiptId && <span className="text-slate-400">#{tx.receiptId}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  {tx.receiptId && (
                    <button type="button" className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium hover:bg-slate-50">
                      <Download className="h-3.5 w-3.5" /> Biên lai
                    </button>
                  )}
                  {role === 'admin' && tx.status === 'disputed' && (
                    <button type="button" className="rounded-xl bg-orange-600 px-3 py-2 text-xs font-semibold text-white">
                      Xử lý khiếu nại
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
