import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  BadgeCheck,
  Ban,
  Building2,
  Calendar,
  CalendarCheck,
  Camera,
  Loader2,
  CheckCircle2,
  Edit,
  Eye,
  Mail,
  Phone,
  Save,
  Trash2,
  User as UserIcon,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { uploadService } from '@/services/upload.service';
import { formatPrice, statusColors, statusLabels } from '@/utils/format';
import type { Property, User } from '@/types';

interface AdminUserDetailModalProps {
  user: User | null;
  onClose: () => void;
  onUserUpdated?: (updated: User) => void;
  onUserDeleted?: (userId: string) => void;
}

export function AdminUserDetailModal({
  user,
  onClose,
  onUserUpdated,
  onUserDeleted,
}: AdminUserDetailModalProps) {
  if (!user) return null;

  const [activeTab, setActiveTab] = useState<'profile' | 'properties' | 'appointments'>('profile');
  const [currentUser, setCurrentUser] = useState<User>(user);

  // Edit form state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editPhone, setEditPhone] = useState(user.phone || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Broker Properties state
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProps, setLoadingProps] = useState(false);

  // Buyer Appointments state
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingApts, setLoadingApts] = useState(false);

  useEffect(() => {
    setCurrentUser(user);
    setEditName(user.name);
    setEditPhone(user.phone || '');
    setIsEditing(false);
    setSaveSuccess(null);
    setSaveError(null);

    // If agent, load their properties
    if (user.role === 'agent') {
      setLoadingProps(true);
      adminService
        .getPropertiesByBroker(user.id)
        .then((res) => setProperties(res))
        .catch(() => setProperties([]))
        .finally(() => setLoadingProps(false));
    }

    // Load appointments (for either agent or buyer)
    setLoadingApts(true);
    adminService
      .getUserAppointments(user.id)
      .then((res) => setAppointments(res))
      .catch(() => setAppointments([]))
      .finally(() => setLoadingApts(false));
  }, [user]);

  // Upload avatar from computer by admin
  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp ảnh hợp lệ');
      return;
    }

    setUploadingAvatar(true);
    try {
      const res = await uploadService.uploadSingleImage(file, 'bdspro/avatars');
      if (res && res.url) {
        await adminService.updateUser(currentUser.id, { avatar: res.url });
        setCurrentUser((prev) => ({ ...prev, avatar: res.url }));
        if (onUserUpdated) onUserUpdated({ ...currentUser, avatar: res.url });
        setSaveSuccess('Tải ảnh đại diện từ máy tính lên thành công!');
        setTimeout(() => setSaveSuccess(null), 3500);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi tải ảnh lên máy chủ');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Save Info
  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const updated = await adminService.updateUser(currentUser.id, {
        name: editName.trim(),
        phone: editPhone.trim() || undefined,
      });

      setCurrentUser((prev) => ({ ...prev, ...updated }));
      setIsEditing(false);
      setSaveSuccess('Đã cập nhật thông tin người dùng thành công!');
      if (onUserUpdated) onUserUpdated({ ...currentUser, ...updated });
      setTimeout(() => setSaveSuccess(null), 3500);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi cập nhật người dùng.';
      setSaveError(Array.isArray(msg) ? msg.join('; ') : msg);
    } finally {
      setSaving(false);
    }
  };

  // Toggle active
  const handleToggleActive = async () => {
    const nextState = !currentUser.active;
    const action = nextState ? 'mở khóa' : 'khóa';
    if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản "${currentUser.name}"?`)) return;

    try {
      await adminService.updateUser(currentUser.id, { active: nextState });
      setCurrentUser((prev) => ({ ...prev, active: nextState }));
      if (onUserUpdated) onUserUpdated({ ...currentUser, active: nextState });
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật trạng thái');
    }
  };

  // Toggle verified
  const handleToggleVerified = async () => {
    const nextState = !currentUser.verified;
    const action = nextState ? 'cấp tích xanh xác minh' : 'hủy xác minh';
    if (!window.confirm(`Bạn có chắc muốn ${action} cho "${currentUser.name}"?`)) return;

    try {
      await adminService.updateUser(currentUser.id, { verified: nextState });
      setCurrentUser((prev) => ({ ...prev, verified: nextState }));
      if (onUserUpdated) onUserUpdated({ ...currentUser, verified: nextState });
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật xác minh');
    }
  };

  // Toggle Role
  const handleToggleRole = async () => {
    const nextRole = currentUser.role === 'agent' ? 'buyer' : 'agent';
    const label = nextRole === 'agent' ? 'Môi giới / Host' : 'Khách hàng';
    if (!window.confirm(`Chuyển đổi vai trò của "${currentUser.name}" sang "${label}"?`)) return;

    try {
      await adminService.updateUser(currentUser.id, { role: nextRole as any });
      setCurrentUser((prev) => ({ ...prev, role: nextRole as any }));
      if (onUserUpdated) onUserUpdated({ ...currentUser, role: nextRole as any });
    } catch (err: any) {
      alert(err.message || 'Lỗi chuyển đổi vai trò');
    }
  };

  // Delete User
  const handleDelete = async () => {
    if (!window.confirm(`CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${currentUser.name}"?`)) return;

    try {
      await adminService.deleteUser(currentUser.id);
      if (onUserDeleted) onUserDeleted(currentUser.id);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa tài khoản');
    }
  };

  const roleLabelMap: Record<string, { label: string; color: string }> = {
    buyer: { label: 'Người tìm BĐS (Khách hàng)', color: 'bg-sky-100 text-sky-800 border-sky-200' },
    agent: { label: 'Môi giới / Host (Agent)', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    admin: { label: 'Quản trị viên (Admin)', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  };

  const roleCfg = roleLabelMap[currentUser.role || 'buyer'] || roleLabelMap.buyer;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Hidden File Input for uploading avatar from computer */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarFile}
          accept="image/png, image/jpeg, image/jpg, image/webp"
          className="hidden"
        />
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-wrap items-center gap-5">
            <div className="relative group">
              <img
                src={
                  currentUser.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    currentUser.name
                  )}`
                }
                alt={currentUser.name}
                className="h-20 w-20 rounded-full object-cover ring-4 ring-white/20 shadow-lg"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                title="Tải ảnh mới từ máy tính"
              >
                {uploadingAvatar ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <>
                    <Camera className="h-5 w-5" />
                    <span className="text-[9px] font-bold">Đổi ảnh</span>
                  </>
                )}
              </button>
              {currentUser.verified && (
                <div
                  className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md ring-2 ring-slate-900"
                  title="Tài khoản đã xác minh"
                >
                  <BadgeCheck className="h-3.5 w-3.5" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold truncate">{currentUser.name}</h2>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-xs font-bold ${roleCfg.color}`}
                >
                  {roleCfg.label}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    currentUser.active !== false
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      currentUser.active !== false ? 'bg-emerald-400' : 'bg-rose-400'
                    }`}
                  />
                  {currentUser.active !== false ? 'Đang hoạt động' : 'Tài khoản bị khóa'}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {currentUser.email}
                </span>
                <span className="flex items-center gap-1 font-medium text-white">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {currentUser.phone || 'Chưa có SĐT'}
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Calendar className="h-3.5 w-3.5" />
                  Tham gia: {new Date(currentUser.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Quick Action Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-6 py-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
              Thao tác Admin:
            </span>

            {/* Lock / Unlock */}
            {currentUser.role !== 'admin' && (
              <button
                type="button"
                onClick={handleToggleActive}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition ${
                  currentUser.active !== false
                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                {currentUser.active !== false ? (
                  <>
                    <Ban className="h-3.5 w-3.5" />
                    <span>Khóa tài khoản</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Mở khóa tài khoản</span>
                  </>
                )}
              </button>
            )}

            {/* Toggle verified badge */}
            <button
              type="button"
              onClick={handleToggleVerified}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition ${
                currentUser.verified
                  ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <BadgeCheck className="h-3.5 w-3.5" />
              <span>{currentUser.verified ? 'Hủy tích xanh' : 'Cấp tích xanh xác minh'}</span>
            </button>

            {/* Switch Role */}
            {currentUser.role !== 'admin' && (
              <button
                type="button"
                onClick={handleToggleRole}
                className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition"
              >
                <UserX className="h-3.5 w-3.5 text-slate-500" />
                <span>
                  Đổi thành {currentUser.role === 'agent' ? 'Khách hàng' : 'Môi giới'}
                </span>
              </button>
            )}

            {/* Edit Info Button */}
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 font-semibold text-indigo-700 hover:bg-indigo-50 border border-indigo-200 transition"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>{isEditing ? 'Hủy sửa' : 'Sửa thông tin'}</span>
            </button>
          </div>

          {currentUser.role !== 'admin' && (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1 rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 transition"
              title="Xóa vĩnh viễn tài khoản"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Notification Toast */}
        {saveSuccess && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 animate-fade-in shadow-xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {saveError && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-800 animate-fade-in shadow-xs">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6 pt-3 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 pb-3 px-3 border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserIcon className="h-4 w-4" />
            <span>Thông tin cá nhân &amp; Hồ sơ</span>
          </button>

          {currentUser.role === 'agent' && (
            <button
              type="button"
              onClick={() => setActiveTab('properties')}
              className={`flex items-center gap-2 pb-3 px-3 border-b-2 transition ${
                activeTab === 'properties'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>BĐS đã đăng ({properties.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('appointments')}
            className={`flex items-center gap-2 pb-3 px-3 border-b-2 transition ${
              activeTab === 'appointments'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Lịch hẹn xem nhà ({appointments.length})</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {/* ── TAB 1: PROFILE DETAILS ── */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {isEditing ? (
                <form onSubmit={handleSaveInfo} className="space-y-4 rounded-2xl border border-indigo-200 bg-indigo-50/30 p-5">
                  <h3 className="font-bold text-slate-900 text-sm">Chỉnh sửa thông tin bởi Admin</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700">Họ và tên *</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700">Số điện thoại</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="0901234567"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-60"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>{saving ? 'Đang lưu...' : 'Lưu cập nhật'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Hủy bỏ
                    </button>
                  </div>
                </form>
              ) : null}

              {/* Readonly info grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                  <span className="text-xs font-medium text-slate-400">ID Người dùng (UUID)</span>
                  <p className="mt-1 font-mono text-xs font-bold text-slate-800 break-all">
                    {currentUser.id}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                  <span className="text-xs font-medium text-slate-400">Địa chỉ Email</span>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{currentUser.email}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                  <span className="text-xs font-medium text-slate-400">Số điện thoại</span>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {currentUser.phone || 'Chưa cập nhật'}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                  <span className="text-xs font-medium text-slate-400">Trạng thái xác thực</span>
                  <div className="mt-1 flex items-center gap-2">
                    {currentUser.verified ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" /> Đã xác thực Email
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">Chưa xác thực Email</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary Stats Overview */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">Tổng quan hoạt động trên sàn</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3 text-center">
                    <span className="text-[11px] text-slate-500">Tin đăng BĐS</span>
                    <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                      {properties.length}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 text-center">
                    <span className="text-[11px] text-slate-500">Lịch xem nhà</span>
                    <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                      {appointments.length}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 text-center col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-slate-500">Trạng thái bảo mật</span>
                    <p className="text-xs font-bold text-emerald-600 mt-1">
                      {currentUser.active !== false ? 'Bình thường' : 'Đang bị khóa'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: BROKER PROPERTIES ── */}
          {activeTab === 'properties' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">
                  Danh mục tin BĐS do môi giới đăng ({properties.length})
                </h3>
              </div>

              {loadingProps ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  Đang nạp danh sách BĐS...
                </div>
              ) : properties.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">
                  Môi giới này chưa đăng tin BĐS nào trên hệ thống.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {properties.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs transition hover:border-indigo-400"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={
                            p.images?.[0] ||
                            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
                          }
                          alt=""
                          className="h-14 w-20 shrink-0 rounded-xl object-cover border border-slate-100"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-xs truncate">{p.title}</p>
                          <p className="mt-0.5 text-xs font-bold text-emerald-600">
                            {formatPrice(p.price, p.transactionType)}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            📍 {p.address || `${p.district}, ${p.city}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            statusColors[p.status || 'draft'] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {statusLabels[p.status || 'draft'] || p.status}
                        </span>

                        <Link
                          to={`/client/property/${p.id}`}
                          target="_blank"
                          className="rounded-xl border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition"
                          title="Xem trên sàn"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: APPOINTMENTS ── */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Danh sách lịch hẹn xem nhà liên quan ({appointments.length})
              </h3>

              {loadingApts ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  Đang nạp dữ liệu lịch hẹn...
                </div>
              ) : appointments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">
                  Không có lịch hẹn xem nhà nào được ghi nhận cho tài khoản này.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {appointments.map((apt: any) => (
                    <div
                      key={apt.id}
                      className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">
                          {apt.property?.title || apt.propertyTitle || 'Bất động sản'}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 font-bold text-[10px] uppercase ${
                            apt.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : apt.status === 'cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {apt.status === 'confirmed'
                            ? 'Đã xác nhận'
                            : apt.status === 'cancelled'
                            ? 'Đã hủy'
                            : 'Chờ xác nhận'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {apt.date} · {apt.time}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          Khách: {apt.buyer?.name || apt.buyerName || 'Người mua'}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          Môi giới: {apt.agent?.name || 'Chủ BĐS'}
                        </span>
                      </div>

                      {apt.note && (
                        <p className="text-[11px] text-slate-400 italic">Ghi chú: {apt.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Hệ thống quản trị BDS Pro · Xem hồ sơ chi tiết người dùng
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
