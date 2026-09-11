import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CheckCircle,
  Eye,
  RefreshCw,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import type { Property, User } from '@/types';
import { formatPrice, propertyTypeLabels, statusColors, statusLabels, transactionLabels } from '@/utils/format';

export function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [brokers, setBrokers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [brokerFilter, setBrokerFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Load brokers for filter dropdown
  useEffect(() => {
    adminService
      .getUsers({ role: 'agent', limit: 100 })
      .then((res) => setBrokers(res.data || []))
      .catch(() => {});
  }, []);

  const fetchProperties = () => {
    setLoading(true);
    const params: any = { limit: 100 };
    if (statusFilter !== 'all') params.status = statusFilter;
    if (brokerFilter !== 'all') params.ownerId = brokerFilter;
    if (typeFilter !== 'all') params.type = typeFilter;
    if (searchTerm.trim()) params.q = searchTerm.trim();

    adminService
      .getAllProperties(params)
      .then((res) => {
        setProperties(res.data || []);
      })
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProperties();
  }, [statusFilter, brokerFilter, typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties();
  };

  const handleApprove = async (id: string, title: string) => {
    if (!window.confirm(`Xác nhận duyệt tin đăng: "${title}"?`)) return;
    try {
      await adminService.approveProperty(id);
      fetchProperties();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi duyệt tin');
    }
  };

  const handleReject = async (id: string, title: string) => {
    const reason = window.prompt(`Nhập lý do từ chối tin "${title}":`, 'Nội dung chưa đầy đủ hoặc không hợp lệ');
    if (!reason) return;
    try {
      await adminService.rejectProperty(id, reason);
      fetchProperties();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi từ chối tin');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn tin đăng "${title}"?`)) return;
    try {
      await adminService.deleteProperty(id);
      fetchProperties();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa tin');
    }
  };

  // Metrics
  const totalCount = properties.length;
  const activeCount = properties.filter((p) => p.status === 'active').length;
  const pendingCount = properties.filter((p) => p.status === 'pending').length;
  const rejectedCount = properties.filter((p) => p.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý toàn bộ tin đăng BĐS</h1>
          <p className="mt-1 text-slate-500">
            Giám sát, phân loại và điều phối mọi tin đăng từ tất cả môi giới trong hệ thống
          </p>
        </div>
        <button
          type="button"
          onClick={fetchProperties}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tổng số tin</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalCount}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Đang hiển thị (Active)</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{activeCount}</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Chờ duyệt (Pending)</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{pendingCount}</p>
        </div>
        <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-600">Từ chối / Vi phạm</p>
          <p className="mt-1 text-2xl font-bold text-red-700">{rejectedCount}</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề, địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-brand-500 focus:bg-white transition"
            />
          </form>

          {/* Broker Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">Môi giới:</span>
            <select
              value={brokerFilter}
              onChange={(e) => setBrokerFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-500"
            >
              <option value="all">Tất cả môi giới</option>
              {brokers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.email})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ kiểm duyệt</option>
              <option value="active">Đang hiển thị</option>
              <option value="rejected">Bị từ chối</option>
              <option value="sold">Đã giao dịch</option>
              <option value="draft">Bản nháp</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-500"
            >
              <option value="all">Tất cả loại BĐS</option>
              <option value="apartment">Căn hộ chung cư</option>
              <option value="house">Nhà phố</option>
              <option value="villa">Biệt thự</option>
              <option value="land">Đất nền</option>
              <option value="office">Mặt bằng / Văn phòng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Bất động sản</th>
                <th className="px-4 py-3.5">Môi giới / Người đăng</th>
                <th className="px-4 py-3.5">Giá & Loại</th>
                <th className="px-4 py-3.5">Trạng thái</th>
                <th className="px-4 py-3.5">Chỉ số AI / Xem</th>
                <th className="px-5 py-3.5 text-right">Thao tác Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-brand-600" />
                      Đang nạp danh sách bất động sản...
                    </div>
                  </td>
                </tr>
              ) : properties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-slate-500">
                    <Building2 className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="mt-3 font-medium text-slate-700">Không tìm thấy tin đăng nào phù hợp</p>
                    <p className="mt-1 text-xs text-slate-400">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                  </td>
                </tr>
              ) : (
                properties.map((p) => (
                  <tr key={p.id} className="transition hover:bg-slate-50/60">
                    {/* BĐS thumbnail + title */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'}
                          alt=""
                          className="h-14 w-20 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0 max-w-[320px]">
                          <p className="font-semibold text-slate-900 truncate" title={p.title}>
                            {p.title}
                          </p>
                          <p className="text-xs text-slate-500 truncate" title={p.address}>
                            {p.address || `${p.district}, ${p.city}`}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                            <span>{propertyTypeLabels[p.type] || p.type}</span>
                            <span>·</span>
                            <span>{p.area} m²</span>
                            {p.bedrooms && (
                              <>
                                <span>·</span>
                                <span>{p.bedrooms} PN</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Owner / Broker */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700 text-xs shrink-0">
                          {p.ownerName ? p.ownerName.charAt(0).toUpperCase() : 'M'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">{p.ownerName || 'Môi giới'}</p>
                          <button
                            type="button"
                            onClick={() => setBrokerFilter(p.ownerId)}
                            className="text-[11px] text-brand-600 hover:underline"
                          >
                            Lọc tin của người này
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Price & Trans */}
                    <td className="px-4 py-4">
                      <p className="font-bold text-brand-700">
                        {formatPrice(p.price, p.transactionType)}
                      </p>
                      <span className="inline-block mt-0.5 text-[11px] text-slate-500 font-medium">
                        {transactionLabels[p.transactionType] || p.transactionType}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          statusColors[p.status] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {statusLabels[p.status] || p.status}
                      </span>
                      {p.status === 'rejected' && p.rejectReason && (
                        <p className="mt-1 text-[11px] text-red-600 line-clamp-1" title={p.rejectReason}>
                          Lý do: {p.rejectReason}
                        </p>
                      )}
                    </td>

                    {/* AI Score & Views */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center justify-center rounded-lg px-2 py-0.5 text-xs font-bold ${
                            (p.aiScore ?? 0) >= 80
                              ? 'bg-emerald-100 text-emerald-700'
                              : (p.aiScore ?? 0) >= 60
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          AI: {p.aiScore ?? 70}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Eye className="h-3.5 w-3.5" />
                          {p.viewCount || 0}
                        </div>
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View detail button */}
                        <Link
                          to={`/client/property/${p.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                          title="Xem chi tiết tin trên web"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        {/* Approve button if not active */}
                        {p.status !== 'active' && (
                          <button
                            type="button"
                            onClick={() => handleApprove(p.id, p.title)}
                            className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 transition"
                            title="Duyệt bài đăng này"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}

                        {/* Reject button if active or pending */}
                        {p.status !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => handleReject(p.id, p.title)}
                            className="rounded-lg p-2 text-amber-600 hover:bg-amber-50 transition"
                            title="Từ chối / Gỡ bài này"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.title)}
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50 transition"
                          title="Xóa vĩnh viễn"
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
