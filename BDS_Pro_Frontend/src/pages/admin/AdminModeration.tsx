import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { propertyService } from '@/services/property.service';
import type { Property } from '@/types';
import { formatPrice, propertyTypeLabels, transactionLabels } from '@/utils/format';

export function AdminModeration() {
  const [queue, setQueue] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = () => {
    setLoading(true);
    propertyService
      .getPendingProperties()
      .then((res) => {
        if (res && res.data) setQueue(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPending();
    window.addEventListener('bdspro_property_updated', fetchPending);
    return () => window.removeEventListener('bdspro_property_updated', fetchPending);
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await adminService.approveProperty(id);
      setQueue((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Lỗi khi duyệt tin');
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Nhập lý do từ chối tin đăng:');
    if (!reason) return;
    try {
      await adminService.rejectProperty(id, reason);
      setQueue((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Lỗi khi từ chối tin');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kiểm duyệt tin đăng BĐS</h1>
        <p className="text-slate-500">Hàng đợi kiểm duyệt tin đăng từ Host / Môi giới</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-slate-500">Đang nạp hàng đợi duyệt tin...</div>
      ) : queue.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
          Hàng đợi trống — Tất cả tin bài đã được xử lý xong!
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((p) => (
            <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row">
                <img
                  src={p.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'}
                  alt=""
                  className="h-48 w-full rounded-xl object-cover lg:h-40 lg:w-56"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">{p.title}</h3>
                  <p className="mt-1 text-emerald-700 font-bold">{formatPrice(p.price, p.transactionType)}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-500">
                    <span>{propertyTypeLabels[p.type] || p.type}</span>
                    <span>·</span>
                    <span>{transactionLabels[p.transactionType] || p.transactionType}</span>
                    <span>·</span>
                    <span>{p.area} m²</span>
                    <span>·</span>
                    <span>{p.address || `${p.district}, ${p.city}`}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">{p.description}</p>
                  <p className="mt-2 text-xs text-slate-400">Người đăng: {p.ownerName || 'Host'} · {p.createdAt}</p>
                </div>
                <div className="flex flex-row gap-2 lg:flex-col justify-center">
                  <button
                    type="button"
                    onClick={() => handleApprove(p.id)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm"
                  >
                    <Check className="h-4 w-4" /> Duyệt tin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(p.id)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" /> Từ chối
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
