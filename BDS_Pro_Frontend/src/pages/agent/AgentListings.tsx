import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { propertyService } from '@/services/property.service';
import type { Property } from '@/types';
import { formatPrice, statusColors, statusLabels } from '@/utils/format';
import { BROKER_ROUTES } from '@/config/routes';

export function AgentListings({ embedded = false }: { embedded?: boolean }) {
  const [myListings, setMyListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = () => {
    setLoading(true);
    propertyService
      .getMyProperties()
      .then((res) => {
        if (res && res.data) {
          setMyListings(res.data);
        }
      })
      .catch(() => {})
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
    } catch (err: any) {
      alert(err.message || 'Không thể xóa tin đăng');
    }
  };

  return (
    <div className={embedded ? 'space-y-4' : 'space-y-6'}>
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý tin đăng của tôi</h1>
            <p className="text-slate-500">{myListings.length} tin · Dữ liệu thực từ CSDL MySQL</p>
          </div>
          <Link
            to={BROKER_ROUTES.newProperty}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Tạo tin mới
          </Link>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-left text-slate-600 font-semibold">
              <th className="p-4">Tin đăng</th>
              <th className="p-4">Giá</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Lượt xem</th>
              <th className="p-4">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  Đang nạp danh sách tin đăng của bạn...
                </td>
              </tr>
            ) : myListings.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-500">
                  Bạn chưa có tin đăng nào. Bấm <strong>&quot;Tạo tin mới&quot;</strong> để đăng bài đầu tiên!
                </td>
              </tr>
            ) : (
              myListings.map((p) => (
                <tr key={p.id} className="transition hover:bg-slate-50/80">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'}
                        alt=""
                        className="h-12 w-16 rounded-lg object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-semibold text-slate-900 line-clamp-1">{p.title}</p>
                        <p className="text-xs text-slate-500">{p.address || `${p.district}, ${p.city}`}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-brand-700">{formatPrice(p.price, p.transactionType)}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[p.status] || 'bg-slate-100 text-slate-700'}`}>
                      {statusLabels[p.status] || p.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Eye className="h-3.5 w-3.5" />
                      {p.viewCount || 0}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Link to={`/client/property/${p.id}`} className="rounded-lg p-2 hover:bg-slate-100" title="Xem chi tiết">
                        <Eye className="h-4 w-4 text-slate-600" />
                      </Link>
                      <Link to={`/broker/properties/${p.id}/edit`} className="rounded-lg p-2 hover:bg-slate-100" title="Chỉnh sửa">
                        <Edit className="h-4 w-4 text-slate-600" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id, p.title)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
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
  );
}
