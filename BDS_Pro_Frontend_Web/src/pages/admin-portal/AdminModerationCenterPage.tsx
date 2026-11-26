import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Eye,
  Search,
  ShieldAlert,
  X,
} from 'lucide-react';
import { ModerationDrawer } from '@/components/admin/ModerationDrawer';
import { RejectListingModal } from '@/components/admin/RejectListingModal';
import { RiskScoreBadge } from '@/components/admin/RiskScoreBadge';
import { propertyService } from '@/services/property.service';
import { formatPrice } from '@/utils/format';
import type { ModerationQueueItem } from '@/types/admin';
import type { Property } from '@/types';

export function AdminModerationCenterPage() {
  const [queue, setQueue] = useState<ModerationQueueItem[]>([]);
  const [selected, setSelected] = useState<ModerationQueueItem | null>(null);
  const [rejectTarget, setRejectTarget] = useState<ModerationQueueItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fetchPending = () => {
    setLoading(true);
    propertyService
      .getPendingProperties()
      .then((res: any) => {
        const list: Property[] = Array.isArray(res) ? res : res?.data || [];
        const items: ModerationQueueItem[] = list.map((p) => ({
          id: p.id,
          propertyId: p.id,
          title: p.title,
          thumbnail:
            p.images?.[0] ||
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
          brokerName: p.ownerName || 'Môi giới',
          submittedAt: p.createdAt
            ? new Date(p.createdAt).toLocaleDateString('vi-VN')
            : new Date().toLocaleDateString('vi-VN'),
          riskScore: 'low',
          price: p.price,
          transactionType: p.transactionType || 'sale',
          type: p.type || 'apartment',
          area: p.area,
          address: p.address,
          district: p.district || 'Quận 1',
          city: p.city || 'TP. Hồ Chí Minh',
          description: p.description,
          legalStatus: p.legalStatus || 'so_hong',
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          amenities: p.amenities || [],
          validationChecks: [
            { id: '1', label: 'Thông tin hợp lệ', status: 'passed' },
          ],
        }));
        setQueue(items);
      })
      .catch((err) => {
        console.error('Lỗi nạp danh sách duyệt tin:', err);
        setQueue([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPending();
    window.addEventListener('bdspro_property_updated', fetchPending);
    return () => window.removeEventListener('bdspro_property_updated', fetchPending);
  }, []);

  async function handleApprove(id: string) {
    try {
      await propertyService.moderateProperty(id, 'active');
      setQueue((prev) => prev.filter((item) => item.id !== id));
      setSelected(null);
      setFeedbackMsg('Đã phê duyệt tin đăng thành công! Tin đã xuất hiện công khai trên sàn.');
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Lỗi duyệt tin');
    }
  }

  async function handleRejectConfirm() {
    if (!rejectTarget) return;
    try {
      await propertyService.moderateProperty(rejectTarget.id, 'rejected', 'Từ chối duyệt tin');
      setQueue((prev) => prev.filter((item) => item.id !== rejectTarget.id));
      setRejectTarget(null);
      setSelected(null);
      setFeedbackMsg('Đã từ chối tin đăng thành công.');
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Lỗi từ chối tin');
    }
  }

  const filteredQueue = useMemo(() => {
    if (!searchQuery.trim()) return queue;
    const q = searchQuery.toLowerCase();
    return queue.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.brokerName.toLowerCase().includes(q) ||
        (item.address && item.address.toLowerCase().includes(q))
    );
  }, [queue, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trung tâm kiểm duyệt tin đăng</h1>
          <p className="text-slate-500">
            Duyệt tin BĐS chờ đăng từ Môi giới — Kiểm tra tự động kết hợp phê duyệt thủ công
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-800 shadow-xs">
          <ShieldAlert className="h-4 w-4" />
          <span>{queue.length} tin trong hàng chờ</span>
        </div>
      </div>

      {feedbackMsg && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-medium text-emerald-800 animate-fade-in shadow-xs">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Search and stats bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
        <span className="text-xs font-semibold text-slate-600">
          Danh sách tin chờ xử lý ({filteredQueue.length})
        </span>

        <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tiêu đề, môi giới, địa chỉ..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Queue Table with Action Buttons */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Ảnh &amp; Tiêu đề BĐS</th>
                <th className="px-4 py-3.5">Mức giá</th>
                <th className="px-4 py-3.5">Môi giới gửi</th>
                <th className="px-4 py-3.5">Ngày nộp</th>
                <th className="px-4 py-3.5">Đánh giá an toàn</th>
                <th className="px-4 py-3.5 text-right">Hành động duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    Đang nạp danh sách tin chờ duyệt...
                  </td>
                </tr>
              ) : filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-slate-500">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
                    Hàng chờ trống — Tất cả tin đăng đã được xử lý!
                  </td>
                </tr>
              ) : (
                filteredQueue.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.thumbnail}
                          alt=""
                          className="h-14 w-20 shrink-0 rounded-xl object-cover border border-slate-200 cursor-pointer"
                          onClick={() => setSelected(item)}
                        />
                        <div className="min-w-0">
                          <p
                            className="font-bold text-slate-900 text-sm line-clamp-1 hover:text-brand-600 cursor-pointer"
                            onClick={() => setSelected(item)}
                          >
                            {item.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                            📍 {item.address}, {item.district}, {item.city}
                          </p>
                          <span className="mt-1 inline-block text-[11px] font-medium text-slate-400">
                            Loại: {item.type} · Diện tích: {item.area} m²
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-extrabold text-emerald-600 text-sm">
                        {formatPrice(item.price, item.transactionType)}
                      </p>
                      <span className="text-[11px] text-slate-400">
                        {item.transactionType === 'sale' ? 'Bán' : 'Cho thuê'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-slate-800 text-xs">{item.brokerName}</p>
                      <span className="text-[10px] text-slate-400">Chủ sở hữu / Host</span>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-slate-500">{item.submittedAt}</td>

                    <td className="px-4 py-3.5">
                      <RiskScoreBadge level={item.riskScore} />
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelected(item)}
                          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 transition"
                          title="Xem chi tiết hồ sơ BĐS"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApprove(item.id)}
                          className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                          title="Duyệt đăng tin ngay"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Duyệt</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRejectTarget(item)}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                          title="Từ chối duyệt tin"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Từ chối</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModerationDrawer
        item={selected}
        onClose={() => setSelected(null)}
        onApprove={handleApprove}
        onReject={(id) => {
          const target = queue.find((q) => q.id === id);
          if (target) setRejectTarget(target);
        }}
      />

      {rejectTarget && (
        <RejectListingModal
          listingTitle={rejectTarget.title}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleRejectConfirm}
        />
      )}
    </div>
  );
}
