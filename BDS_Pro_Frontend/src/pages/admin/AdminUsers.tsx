import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  Ban,
  Building2,
  CheckCircle,
  Eye,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import type { Property, User } from '@/types';
import { formatPrice, statusColors, statusLabels } from '@/utils/format';

const roleLabels: Record<string, string> = {
  buyer: 'Khách hàng',
  agent: 'Môi giới / Host',
  admin: 'Admin',
};

export function AdminUsers({ embedded = false }: { embedded?: boolean }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected broker to view their properties in Modal/Drawer
  const [selectedBroker, setSelectedBroker] = useState<User | null>(null);
  const [brokerProperties, setBrokerProperties] = useState<Property[]>([]);
  const [loadingBrokerProps, setLoadingBrokerProps] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    const params: any = { limit: 100 };
    if (roleFilter !== 'all') params.role = roleFilter;
    if (searchTerm.trim()) params.q = searchTerm.trim();

    adminService
      .getUsers(params)
      .then((res) => {
        setUsers(res.data || []);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  // Toggle active (lock/unlock)
  const handleToggleActive = async (user: User) => {
    const action = user.active ? 'khóa' : 'mở khóa';
    if (!window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản "${user.name}"?`)) return;
    try {
      await adminService.updateUser(user.id, { active: !user.active });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, active: !user.active } : u)),
      );
      if (selectedBroker && selectedBroker.id === user.id) {
        setSelectedBroker((prev) => (prev ? { ...prev, active: !user.active } : null));
      }
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật trạng thái');
    }
  };

  // Toggle verified
  const handleToggleVerified = async (user: User) => {
    const action = user.verified ? 'hủy xác minh' : 'xác minh (cấp tích xanh)';
    if (!window.confirm(`Bạn có chắc muốn ${action} cho "${user.name}"?`)) return;
    try {
      await adminService.updateUser(user.id, { verified: !user.verified });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, verified: !user.verified } : u)),
      );
      if (selectedBroker && selectedBroker.id === user.id) {
        setSelectedBroker((prev) => (prev ? { ...prev, verified: !user.verified } : null));
      }
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật xác minh');
    }
  };

  // Switch role between agent and buyer
  const handleToggleRole = async (user: User) => {
    const newRole = user.role === 'agent' ? 'buyer' : 'agent';
    const label = newRole === 'agent' ? 'Môi giới' : 'Khách hàng';
    if (!window.confirm(`Chuyển đổi vai trò của "${user.name}" thành ${label}?`)) return;
    try {
      await adminService.updateUser(user.id, { role: newRole as any });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole as any } : u)),
      );
      if (selectedBroker && selectedBroker.id === user.id) {
        setSelectedBroker((prev) => (prev ? { ...prev, role: newRole as any } : null));
      }
    } catch (err: any) {
      alert(err.message || 'Không thể đổi vai trò');
    }
  };

  // Delete user
  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`CẢNH BÁO: Bạn có chắc muốn xóa vĩnh viễn tài khoản "${user.name}"?`)) return;
    try {
      await adminService.deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      if (selectedBroker && selectedBroker.id === user.id) {
        setSelectedBroker(null);
      }
    } catch (err: any) {
      alert(err.message || 'Không thể xóa người dùng');
    }
  };

  // Open broker modal & fetch broker's properties
  const handleOpenBrokerModal = (user: User) => {
    setSelectedBroker(user);
    setLoadingBrokerProps(true);
    adminService
      .getPropertiesByBroker(user.id)
      .then((props) => setBrokerProperties(props))
      .catch(() => setBrokerProperties([]))
      .finally(() => setLoadingBrokerProps(false));
  };

  // Moderate listing inside modal
  const handleApproveListing = async (propertyId: string) => {
    try {
      await adminService.approveProperty(propertyId);
      setBrokerProperties((prev) =>
        prev.map((p) => (p.id === propertyId ? { ...p, status: 'active' } : p)),
      );
    } catch (err: any) {
      alert(err.message || 'Lỗi duyệt tin');
    }
  };

  const handleRejectListing = async (propertyId: string) => {
    const reason = window.prompt('Nhập lý do từ chối tin:', 'Thông tin không chính xác');
    if (!reason) return;
    try {
      await adminService.rejectProperty(propertyId, reason);
      setBrokerProperties((prev) =>
        prev.map((p) => (p.id === propertyId ? { ...p, status: 'rejected', rejectReason: reason } : p)),
      );
    } catch (err: any) {
      alert(err.message || 'Lỗi từ chối tin');
    }
  };

  const handleDeleteListing = async (propertyId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa vĩnh viễn tin đăng này?')) return;
    try {
      await adminService.deleteProperty(propertyId);
      setBrokerProperties((prev) => prev.filter((p) => p.id !== propertyId));
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa tin');
    }
  };

  // Stats
  const totalUsers = users.length;
  const agentCount = users.filter((u) => u.role === 'agent').length;
  const buyerCount = users.filter((u) => u.role === 'buyer').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      {!embedded && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý tài khoản & Môi giới</h1>
            <p className="mt-1 text-slate-500">
              Phân quyền, cấp phép, khóa tài khoản và quản lý tin đăng của từng môi giới
            </p>
          </div>
          <button
            type="button"
            onClick={fetchUsers}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tổng tài khoản</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalUsers}</p>
        </div>
        <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Môi giới / Host</p>
          <p className="mt-1 text-2xl font-bold text-brand-700">{agentCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Khách hàng (Buyer)</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{buyerCount}</p>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Role Tabs */}
          <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setRoleFilter('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                roleFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({totalUsers})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('agent')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                roleFilter === 'agent' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="h-3.5 w-3.5 text-brand-600" />
              Môi giới ({agentCount})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('buyer')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                roleFilter === 'buyer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Khách hàng ({buyerCount})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('admin')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                roleFilter === 'admin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, email, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-brand-500 focus:bg-white transition"
            />
          </form>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Người dùng / Môi giới</th>
                <th className="px-4 py-3.5">Vai trò</th>
                <th className="px-4 py-3.5">Trạng thái tài khoản</th>
                <th className="px-4 py-3.5">Xác minh (Tích xanh)</th>
                <th className="px-4 py-3.5">Ngày tham gia</th>
                <th className="px-5 py-3.5 text-right">Quản trị & Tin đăng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-brand-600" />
                      Đang nạp danh sách tài khoản...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    Không tìm thấy người dùng nào phù hợp
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="transition hover:bg-slate-50/60">
                    {/* User Profile */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover border border-slate-200 bg-slate-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-slate-900 truncate">{u.name}</p>
                            {u.verified && (
                              <span title="Tài khoản đã xác minh">
                                <BadgeCheck className="h-4 w-4 text-brand-600 shrink-0" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate">{u.email}</p>
                          {u.phone && <p className="text-[11px] text-slate-400">{u.phone}</p>}
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                          u.role === 'agent'
                            ? 'bg-brand-50 text-brand-700 border border-brand-200/60'
                            : u.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role === 'agent' && <Shield className="h-3 w-3 text-brand-600" />}
                        {roleLabels[u.role] || u.role}
                      </span>
                    </td>

                    {/* Active / Blocked */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          u.active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            u.active !== false ? 'bg-emerald-600' : 'bg-red-600'
                          }`}
                        />
                        {u.active !== false ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>

                    {/* Verified Status */}
                    <td className="px-4 py-4">
                      {u.verified ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <CheckCircle className="h-4 w-4" />
                          Đã xác minh
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Chưa xác minh</span>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td className="px-4 py-4 text-xs text-slate-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Button Xem tin đăng của môi giới */}
                        {u.role === 'agent' && (
                          <button
                            type="button"
                            onClick={() => handleOpenBrokerModal(u)}
                            className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 border border-brand-200 transition"
                            title="Xem tất cả tin đăng BĐS của môi giới này"
                          >
                            <Building2 className="h-3.5 w-3.5" />
                            Xem tin đăng
                          </button>
                        )}

                        {/* Toggle verified */}
                        <button
                          type="button"
                          onClick={() => handleToggleVerified(u)}
                          className={`rounded-lg p-2 transition ${
                            u.verified
                              ? 'text-brand-600 hover:bg-brand-50'
                              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                          }`}
                          title={u.verified ? 'Hủy tích xanh xác minh' : 'Cấp tích xanh xác minh'}
                        >
                          <BadgeCheck className="h-4 w-4" />
                        </button>

                        {/* Toggle lock / unlock */}
                        {u.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleToggleActive(u)}
                            className={`rounded-lg p-2 transition ${
                              u.active !== false
                                ? 'text-red-500 hover:bg-red-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={u.active !== false ? 'Khóa tài khoản này' : 'Mở khóa tài khoản'}
                          >
                            {u.active !== false ? <Ban className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </button>
                        )}

                        {/* Toggle Role */}
                        {u.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleToggleRole(u)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                            title={`Chuyển sang ${u.role === 'agent' ? 'Khách hàng' : 'Môi giới'}`}
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        )}

                        {/* Delete User */}
                        {u.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL / DRAWER XEM TIN ĐĂNG CỦA MÔI GIỚI ── */}
      {selectedBroker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-3">
                <img
                  src={selectedBroker.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedBroker.name)}`}
                  alt=""
                  className="h-12 w-12 rounded-full border border-slate-200 object-cover bg-white"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{selectedBroker.name}</h2>
                    {selectedBroker.verified && (
                      <span title="Đã xác minh">
                        <BadgeCheck className="h-4 w-4 text-brand-600" />
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        selectedBroker.active !== false
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {selectedBroker.active !== false ? 'Hoạt động' : 'Đang bị khóa'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {selectedBroker.email} · {selectedBroker.phone || 'Chưa cập nhật SĐT'} · Vai trò: {roleLabels[selectedBroker.role]}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/admin/properties`}
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
                >
                  Xem ở bảng tổng
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedBroker(null)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Subheader: Broker listing counts */}
            <div className="grid grid-cols-4 border-b border-slate-100 bg-white px-6 py-3 text-center text-xs">
              <div>
                <span className="text-slate-400">Tổng bài đăng:</span>
                <span className="ml-1 font-bold text-slate-900">{brokerProperties.length}</span>
              </div>
              <div>
                <span className="text-emerald-600">Đang hiển thị:</span>
                <span className="ml-1 font-bold text-emerald-700">
                  {brokerProperties.filter((p) => p.status === 'active').length}
                </span>
              </div>
              <div>
                <span className="text-amber-600">Chờ duyệt:</span>
                <span className="ml-1 font-bold text-amber-700">
                  {brokerProperties.filter((p) => p.status === 'pending').length}
                </span>
              </div>
              <div>
                <span className="text-red-600">Bị từ chối:</span>
                <span className="ml-1 font-bold text-red-700">
                  {brokerProperties.filter((p) => p.status === 'rejected').length}
                </span>
              </div>
            </div>

            {/* Modal Body: List of broker's properties */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingBrokerProps ? (
                <div className="py-12 text-center text-sm text-slate-500">
                  <RefreshCw className="mx-auto h-6 w-6 animate-spin text-brand-600 mb-2" />
                  Đang nạp bài đăng của {selectedBroker.name}...
                </div>
              ) : brokerProperties.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-500">
                  <Building2 className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                  Môi giới này chưa đăng bài bất động sản nào trên hệ thống.
                </div>
              ) : (
                brokerProperties.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'}
                        alt=""
                        className="h-16 w-24 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-semibold text-slate-900 truncate max-w-md" title={p.title}>
                          {p.title}
                        </h4>
                        <p className="text-xs text-slate-500 truncate max-w-md">
                          {p.address || `${p.district}, ${p.city}`} · {p.area} m²
                        </p>
                        <div className="mt-1 flex items-center gap-3">
                          <span className="font-bold text-brand-700 text-sm">
                            {formatPrice(p.price, p.transactionType)}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              statusColors[p.status] || 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {statusLabels[p.status] || p.status}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Ngày đăng: {p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : '—'}
                          </span>
                        </div>
                        {p.status === 'rejected' && p.rejectReason && (
                          <p className="mt-1 text-xs text-red-600">Lý do từ chối: {p.rejectReason}</p>
                        )}
                      </div>
                    </div>

                    {/* Listing Action buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <Link
                        to={`/client/property/${p.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                        title="Xem chi tiết trên web"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>

                      {p.status !== 'active' && (
                        <button
                          type="button"
                          onClick={() => handleApproveListing(p.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Duyệt bài
                        </button>
                      )}

                      {p.status !== 'rejected' && (
                        <button
                          type="button"
                          onClick={() => handleRejectListing(p.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 border border-amber-200 transition"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          Từ chối
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteListing(p.id)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50 transition"
                        title="Xóa tin đăng này"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 text-right">
              <button
                type="button"
                onClick={() => setSelectedBroker(null)}
                className="rounded-xl bg-slate-800 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-900 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
