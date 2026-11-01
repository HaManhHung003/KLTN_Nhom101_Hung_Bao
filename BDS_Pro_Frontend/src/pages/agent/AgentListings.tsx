import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Edit,
  Eye,
  Plus,
  Search,
  Send,
  Trash2,
} from 'lucide-react';
import { propertyService } from '@/services/property.service';
import type { Property } from '@/types';
import { formatPrice, statusColors, statusLabels } from '@/utils/format';
import { BROKER_ROUTES } from '@/config/routes';

export function AgentListings({ embedded = false }: { embedded?: boolean }) {
  const [myListings, setMyListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fetchListings = () => {
    setLoading(true);
    propertyService
      .getMyProperties()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setMyListings(list);
      })
      .catch((err) => {
        console.error('Lỗi nạp tin đăng:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchListings();
    window.addEventListener('bdspro_property_updated', fetchListings);
    return () => window.removeEventListener('bdspro_property_updated', fetchListings);
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tin đăng "${title}"?`)) return;
    try {
      await propertyService.deleteProperty(id);
      setMyListings((prev) => prev.filter((p) => p.id !== id));
      setFeedbackMsg(`Đã xóa tin đăng "${title}" thành công.`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Không thể xóa tin đăng');
    }
  };

  // 1-Click submit draft to pending moderation
  const handleSubmitDraft = async (id: string, title: string) => {
    try {
      await propertyService.submitProperty(id);
      setMyListings((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'pending' } : p))
      );
      setFeedbackMsg(`Đã gửi duyệt tin "${title}" thành công! Vui lòng chờ Admin phê duyệt.`);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Không thể gửi duyệt tin');
    }
  };

  // Filter listings by status & search query
  const filteredListings = useMemo(() => {
    return myListings.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const haystack = `${p.title} ${p.address || ''} ${p.district || ''} ${p.city || ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [myListings, statusFilter, searchQuery]);

  return (
    <div className={embedded ? 'space-y-4' : 'space-y-6'}>
      {!embedded && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý tin đăng của tôi</h1>
            <p className="text-slate-500">
              {myListings.length} tin trong danh mục · Cập nhật liên tục từ CSDL MySQL
            </p>
          </div>
          <Link
            to={BROKER_ROUTES.newProperty}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm transition"
          >
            <Plus className="h-4 w-4" />
            Tạo tin mới
          </Link>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Tất cả ({myListings.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Đang hiển thị ({myListings.filter((p) => p.status === 'active').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Chờ duyệt ({myListings.filter((p) => p.status === 'pending').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('draft')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === 'draft'
                ? 'bg-slate-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Bản nháp ({myListings.filter((p) => p.status === 'draft').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tiêu đề, địa chỉ..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {feedbackMsg && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-medium text-emerald-800 animate-fade-in shadow-xs">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Listings Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm text-left">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Thông tin BĐS</th>
                <th className="p-4">Giá giao dịch</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-center">Lượt xem</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-500">
                    Đang nạp danh sách tin đăng của bạn...
                  </td>
                </tr>
              ) : filteredListings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    {searchQuery || statusFilter !== 'all' ? (
                      'Không tìm thấy tin đăng phù hợp với bộ lọc.'
                    ) : (
                      <>
                        Bạn chưa có tin đăng nào.{' '}
                        <Link
                          to={BROKER_ROUTES.properties}
                          className="font-bold text-emerald-600 hover:underline"
                        >
                          Tạo tin mới ngay!
                        </Link>
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                filteredListings.map((p) => (
                  <tr key={p.id} className="transition hover:bg-slate-50/70">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            p.images?.[0] ||
                            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
                          }
                          alt=""
                          className="h-14 w-20 shrink-0 rounded-xl object-cover border border-slate-200"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm line-clamp-1">{p.title}</p>
                          <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                            📍 {p.address || `${p.district}, ${p.city}`}
                          </p>
                          <span className="mt-1 inline-block text-[11px] font-medium text-slate-400">
                            Loại: {p.type} · Diện tích: {p.area} m²
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <p className="font-extrabold text-emerald-600 text-sm">
                        {formatPrice(p.price, p.transactionType)}
                      </p>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {p.transactionType === 'sale' ? 'Mua bán' : 'Cho thuê'}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          statusColors[p.status || 'draft'] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {statusLabels[p.status || 'draft'] || p.status}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
                        <Eye className="h-3.5 w-3.5 text-slate-400" />
                        {p.viewCount || 0}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* If Draft, allow 1-click submit */}
                        {p.status === 'draft' && (
                          <button
                            type="button"
                            onClick={() => handleSubmitDraft(p.id, p.title)}
                            className="inline-flex items-center gap-1 rounded-xl bg-amber-500 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-amber-600 transition shadow-xs"
                            title="Gửi duyệt tin"
                          >
                            <Send className="h-3 w-3" />
                            <span>Gửi duyệt</span>
                          </button>
                        )}

                        <Link
                          to={`/client/property/${p.id}`}
                          target="_blank"
                          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 transition"
                          title="Xem trên sàn"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        <Link
                          to={`/broker/properties/${p.id}/edit`}
                          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 transition"
                          title="Chỉnh sửa tin"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.title)}
                          className="rounded-xl border border-rose-200 p-2 text-rose-600 hover:bg-rose-50 transition"
                          title="Xóa tin đăng"
                        >
                          <Trash2 className="h-4 w-4" />
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
    </div>
  );
}
