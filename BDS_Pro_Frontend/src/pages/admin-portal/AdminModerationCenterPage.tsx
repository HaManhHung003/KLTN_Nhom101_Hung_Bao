import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { ModerationDrawer } from '@/components/admin/ModerationDrawer';
import { RejectListingModal } from '@/components/admin/RejectListingModal';
import { RiskScoreBadge } from '@/components/admin/RiskScoreBadge';
import { moderationQueue as seedQueue } from '@/data/mockData';
import { propertyService } from '@/services/property.service';
import type { ModerationQueueItem } from '@/types/admin';

export function AdminModerationCenterPage() {
  const [queue, setQueue] = useState<ModerationQueueItem[]>(seedQueue);
  const [selected, setSelected] = useState<ModerationQueueItem | null>(null);
  const [rejectTarget, setRejectTarget] = useState<ModerationQueueItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertyService
      .getPendingProperties()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const items: ModerationQueueItem[] = res.data.map((p) => ({
            id: p.id,
            propertyId: p.id,
            title: p.title,
            thumbnail: p.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
            brokerName: p.ownerName || 'Môi giới',
            submittedAt: p.createdAt || '2026-08-28',
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
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleApprove(id: string) {
    try {
      await propertyService.moderateProperty(id, 'active');
      setQueue((prev) => prev.filter((item) => item.id !== id));
      setSelected(null);
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
    } catch (err: any) {
      alert(err.message || 'Lỗi từ chối tin');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trung tâm kiểm duyệt</h1>
          <p className="text-slate-500">Duyệt tin chờ đăng — kiểm tra tự động + quyết định thủ công</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800">
          <ShieldAlert className="h-4 w-4" />
          {queue.length} tin trong hàng chờ
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Ảnh</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Tiêu đề</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Môi giới</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Ngày gửi</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Mức rủi ro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Đang nạp danh sách tin chờ duyệt...
                  </td>
                </tr>
              ) : queue.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-slate-500">
                    Hàng chờ trống — đã duyệt hết tin đăng
                  </td>
                </tr>
              ) : (
                queue.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className="cursor-pointer transition hover:bg-indigo-50/50"
                  >
                    <td className="px-4 py-3">
                      <img src={item.thumbnail} alt="" className="h-12 w-16 rounded-lg object-cover" />
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{item.title}</td>
                    <td className="px-4 py-3 text-slate-600">{item.brokerName}</td>
                    <td className="px-4 py-3 text-slate-500">{item.submittedAt}</td>
                    <td className="px-4 py-3">
                      <RiskScoreBadge level={item.riskScore} />
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
