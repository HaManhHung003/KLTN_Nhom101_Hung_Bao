import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  Calendar,
  CalendarCheck,
  Camera,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  FolderOpen,
  Heart,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  Upload,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';
import { propertyService } from '@/services/property.service';
import { appointmentService } from '@/services/appointment.service';
import { uploadService } from '@/services/upload.service';
import { ADMIN_ROUTES, BROKER_ROUTES, CLIENT_ROUTES } from '@/config/routes';
import type { UserRole } from '@/types';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces',
];

interface UserProfileViewProps {
  role?: UserRole;
  embedded?: boolean;
}

export function UserProfileView(_props: UserProfileViewProps = {}) {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'stats'>('info');

  // Form Profile State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Form Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  // Statistics State
  const [stats, setStats] = useState({
    myListingsCount: 0,
    activeListingsCount: 0,
    appointmentsCount: 0,
    favoritesCount: 0,
  });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  // Load user statistics depending on role
  useEffect(() => {
    if (!user) return;

    if (user.role === 'agent') {
      propertyService.getMyProperties().then((res: any) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        const active = list.filter((p: any) => p.status === 'active').length;
        setStats((prev) => ({
          ...prev,
          myListingsCount: list.length,
          activeListingsCount: active,
        }));
      });
      appointmentService.getMyAppointments().then((res: any) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setStats((prev) => ({ ...prev, appointmentsCount: list.length }));
      });
    } else if (user.role === 'buyer') {
      appointmentService.getMyAppointments().then((res: any) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setStats((prev) => ({ ...prev, appointmentsCount: list.length }));
      });
      propertyService.getFavorites().then((res: any) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setStats((prev) => ({ ...prev, favoritesCount: list.length }));
      });
    }
  }, [user]);

  // Upload Avatar File from Computer
  const handleUploadFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileError('Vui lòng chọn một tệp hình ảnh hợp lệ (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Kích thước ảnh không được vượt quá 5MB.');
      return;
    }

    setUploadingAvatar(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const res = await uploadService.uploadSingleImage(file, 'bdspro/avatars');
      if (res && res.url) {
        setAvatar(res.url);

        // Tự động lưu cập nhật ảnh đại diện vào CSDL người dùng
        const updated = await authService.updateProfile({
          avatar: res.url,
        });

        if (setUser) {
          setUser((prev) => (prev ? { ...prev, ...updated } : updated));
        }

        setProfileSuccess('Tải ảnh đại diện từ máy tính lên thành công!');
        setTimeout(() => setProfileSuccess(null), 4000);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Không thể tải ảnh lên máy chủ.';
      setProfileError(Array.isArray(msg) ? msg.join('; ') : msg);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    if (!name.trim()) {
      setProfileError('Họ và tên không được để trống.');
      setSavingProfile(false);
      return;
    }

    try {
      const updated = await authService.updateProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
        avatar: avatar.trim() || undefined,
      });

      if (setUser) {
        setUser((prev) => (prev ? { ...prev, ...updated } : updated));
      }

      setProfileSuccess('Cập nhật thông tin cá nhân thành công!');
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Không thể cập nhật hồ sơ.';
      setProfileError(Array.isArray(msg) ? msg.join('; ') : msg);
    } finally {
      setSavingProfile(false);
    }
  };

  // Password Policy Checklist Validations
  const hasLength = newPassword.length >= 8 && newPassword.length <= 16;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasDigit = /\d/.test(newPassword);
  const hasSpecial = /[^a-zA-Z0-9]/.test(newPassword);
  const isPassValid = hasLength && hasUpper && hasLower && hasDigit && hasSpecial;

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPass(true);
    setPassSuccess(null);
    setPassError(null);

    if (!currentPassword) {
      setPassError('Vui lòng nhập mật khẩu hiện tại.');
      setChangingPass(false);
      return;
    }
    if (!isPassValid) {
      setPassError('Mật khẩu mới chưa đáp ứng đầy đủ yêu cầu bảo mật.');
      setChangingPass(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('Mật khẩu xác nhận không khớp với mật khẩu mới.');
      setChangingPass(false);
      return;
    }

    try {
      await authService.changePassword({
        currentPassword,
        newPassword,
      });
      setPassSuccess('Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới của bạn.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(null), 5000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Không thể đổi mật khẩu.';
      setPassError(Array.isArray(msg) ? msg.join('; ') : msg);
    } finally {
      setChangingPass(false);
    }
  };

  if (!user) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
        <UserIcon className="mx-auto h-12 w-12 text-slate-400 mb-3" />
        <h3 className="font-bold text-slate-900 text-lg">Bạn chưa đăng nhập</h3>
        <p className="mt-1 text-sm text-slate-500">
          Vui lòng đăng nhập tài khoản để quản lý hồ sơ và bảo mật cá nhân.
        </p>
        <Link
          to="/login"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  const roleBadgeConfig = {
    admin: { label: 'Quản trị viên (Admin)', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    agent: { label: 'Môi giới / Host (Agent)', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    buyer: { label: 'Người tìm BĐS (Khách hàng)', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  }[user.role || 'buyer'];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Hidden File Input for uploading from computer */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      {/* ── 1. IDENTITY HEADER CARD ── */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar with Camera Hover Button */}
            <div className="relative group">
              <img
                src={
                  avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    user.name
                  )}`
                }
                alt={user.name}
                className="h-24 w-24 rounded-full object-cover ring-4 ring-brand-100 shadow-md"
              />

              {/* Upload overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                title="Tải ảnh mới từ máy tính"
              >
                {uploadingAvatar ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                ) : (
                  <>
                    <Camera className="h-6 w-6" />
                    <span className="text-[10px] font-bold mt-0.5">Đổi ảnh</span>
                  </>
                )}
              </button>

              {user.verified && (
                <div
                  className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md ring-2 ring-white"
                  title="Tài khoản đã được xác minh"
                >
                  <BadgeCheck className="h-4 w-4" />
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{user.name}</h1>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-xs font-bold ${roleBadgeConfig.color}`}
                >
                  {roleBadgeConfig.label}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {user.phone || 'Chưa cập nhật SĐT'}
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="h-3.5 w-3.5" />
                  Gia nhập: {new Date(user.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>

          {/* Quick upload button in header */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-100 hover:text-slate-900 transition disabled:opacity-60"
          >
            {uploadingAvatar ? (
              <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
            ) : (
              <Upload className="h-4 w-4 text-brand-600" />
            )}
            <span>{uploadingAvatar ? 'Đang tải ảnh...' : 'Tải ảnh từ máy tính'}</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex border-b border-slate-100 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 pb-3 px-4 border-b-2 transition ${
              activeTab === 'info'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserIcon className="h-4 w-4" />
            <span>Thông tin cá nhân</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 pb-3 px-4 border-b-2 transition ${
              activeTab === 'security'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lock className="h-4 w-4" />
            <span>Đổi mật khẩu &amp; Bảo mật</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 pb-3 px-4 border-b-2 transition ${
              activeTab === 'stats'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Hoạt động &amp; Thống kê</span>
          </button>
        </div>
      </div>

      {/* ── 2. TAB 1: THÔNG TIN CÁ NHÂN & ẢNH ĐẠI DIỆN ── */}
      {activeTab === 'info' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Chi tiết hồ sơ cá nhân</h2>
            <p className="text-xs text-slate-500">
              Cập nhật tên hiển thị, số điện thoại liên lạc và tải ảnh đại diện từ máy tính
            </p>
          </div>

          {profileSuccess && (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-semibold text-emerald-800 animate-fade-in shadow-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-medium text-rose-800 animate-fade-in shadow-xs">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          {/* ── DEDICATED COMPUTER FILE UPLOAD ZONE ── */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Ảnh đại diện tài khoản</h3>
                <p className="text-xs text-slate-500">
                  Chọn ảnh từ máy tính hoặc kéo thả tệp hình ảnh vào đây
                </p>
              </div>
              <span className="text-[11px] text-slate-400">PNG, JPG, WEBP (Tối đa 5MB)</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Current Preview */}
              <div className="relative shrink-0">
                <img
                  src={
                    avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                      user.name
                    )}`
                  }
                  alt="Avatar preview"
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-md border border-slate-200"
                />
                {uploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 text-white">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
                  </div>
                )}
              </div>

              {/* Upload Drop Zone / Button */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 w-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center cursor-pointer transition ${
                  isDragOver
                    ? 'border-brand-500 bg-brand-50/50'
                    : 'border-slate-300 bg-white hover:border-brand-400 hover:bg-slate-50'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 mb-2">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Bấm vào đây để chọn ảnh từ máy tính
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  hoặc kéo thả tệp ảnh từ File Explorer vào đây
                </p>
              </div>
            </div>

            {/* Avatar presets & initial generator */}
            <div className="pt-2 border-t border-slate-200/60">
              <label className="text-xs font-semibold text-slate-600">
                Hoặc chọn nhanh ảnh đại diện có sẵn:
              </label>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {AVATAR_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(p)}
                    className={`relative rounded-full p-0.5 transition ${
                      avatar === p ? 'ring-2 ring-brand-600 scale-105' : 'hover:scale-105 opacity-80'
                    }`}
                  >
                    <img src={p} alt="" className="h-10 w-10 rounded-full object-cover" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setAvatar(
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-xs"
                >
                  Dùng chữ cái tên
                </button>
              </div>
            </div>
          </div>

          {/* Form details */}
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Name */}
              <div>
                <label className="text-xs font-bold text-slate-700">Họ và tên *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập họ và tên..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-bold text-slate-700">
                  Số điện thoại liên lạc (Duy nhất 1 tài khoản)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ví dụ: 0901234567"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Email (Readonly) */}
              <div>
                <label className="text-xs font-bold text-slate-700">
                  Địa chỉ Email (Đã xác minh, không thể thay đổi)
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              {/* Role (Readonly) */}
              <div>
                <label className="text-xs font-bold text-slate-700">Vai trò tài khoản</label>
                <input
                  type="text"
                  value={roleBadgeConfig.label}
                  disabled
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed font-semibold"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile || uploadingAvatar}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-700 transition disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                <span>{savingProfile ? 'Đang lưu...' : 'Lưu thay đổi hồ sơ'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── 3. TAB 2: ĐỔI MẬT KHẨU & BẢO MẬT ── */}
      {activeTab === 'security' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Đổi mật khẩu tài khoản</h2>
            <p className="text-xs text-slate-500">
              Bảo vệ tài khoản bằng mật khẩu mạnh đáp ứng đầy đủ tiêu chuẩn bảo mật
            </p>
          </div>

          {passSuccess && (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-semibold text-emerald-800 animate-fade-in shadow-xs">
              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{passSuccess}</span>
            </div>
          )}

          {passError && (
            <div className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-medium text-rose-800 animate-fade-in shadow-xs">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{passError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
            {/* Current Password */}
            <div>
              <label className="text-xs font-bold text-slate-700">Mật khẩu hiện tại *</label>
              <div className="relative mt-1.5">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 pr-10 text-sm text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-brand-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-xs font-bold text-slate-700">Mật khẩu mới *</label>
              <div className="relative mt-1.5">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 pr-10 text-sm text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-brand-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Dynamic Checklist */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 space-y-1.5 text-xs">
              <p className="font-semibold text-slate-700 mb-1">Yêu cầu bảo mật mật khẩu:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <div className={`flex items-center gap-1.5 ${hasLength ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                  {hasLength ? <Check className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                  <span>Từ 8 đến 16 ký tự</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                  {hasUpper ? <Check className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                  <span>Ít nhất 1 chữ hoa (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                  {hasLower ? <Check className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                  <span>Ít nhất 1 chữ thường (a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasDigit ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                  {hasDigit ? <Check className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                  <span>Ít nhất 1 chữ số (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                  {hasSpecial ? <Check className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                  <span>Ít nhất 1 ký tự đặc biệt (!@#...)</span>
                </div>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="text-xs font-bold text-slate-700">Xác nhận mật khẩu mới *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={changingPass || !isPassValid || newPassword !== confirmPassword}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-700 transition disabled:opacity-50"
              >
                <KeyRound className="h-4 w-4" />
                <span>{changingPass ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── 4. TAB 3: HOẠT ĐỘNG & THỐNG KÊ ── */}
      {activeTab === 'stats' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Hoạt động tài khoản</h2>
            <p className="text-xs text-slate-500">
              Tổng quan tương tác và các lối tắt nhanh theo quyền hạn tài khoản của bạn
            </p>
          </div>

          {/* Role specific summary cards */}
          {user.role === 'buyer' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Lịch xem nhà đã đặt</span>
                  <CalendarCheck className="h-5 w-5 text-sky-600" />
                </div>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {stats.appointmentsCount}
                </p>
                <Link
                  to={CLIENT_ROUTES.activity}
                  className="mt-3 inline-block text-xs font-semibold text-sky-600 hover:underline"
                >
                  Xem danh sách lịch hẹn →
                </Link>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Bất động sản đã lưu</span>
                  <Heart className="h-5 w-5 text-rose-500" />
                </div>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {stats.favoritesCount}
                </p>
                <Link
                  to={CLIENT_ROUTES.saved}
                  className="mt-3 inline-block text-xs font-semibold text-rose-600 hover:underline"
                >
                  Xem danh sách đã lưu →
                </Link>
              </div>
            </div>
          )}

          {user.role === 'agent' && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Tin đăng BĐS</span>
                  <Building2 className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {stats.myListingsCount}
                </p>
                <Link
                  to={BROKER_ROUTES.properties}
                  className="mt-3 inline-block text-xs font-semibold text-emerald-600 hover:underline"
                >
                  Quản lý tin đăng →
                </Link>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Tin đã duyệt (Active)</span>
                  <Check className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="mt-2 text-3xl font-extrabold text-emerald-600">
                  {stats.activeListingsCount}
                </p>
                <p className="mt-3 text-xs text-slate-400">Đang hiển thị trên sàn</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Lịch hẹn với khách</span>
                  <CalendarCheck className="h-5 w-5 text-purple-600" />
                </div>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {stats.appointmentsCount}
                </p>
                <Link
                  to={BROKER_ROUTES.bookings}
                  className="mt-3 inline-block text-xs font-semibold text-purple-600 hover:underline"
                >
                  Xác nhận lịch hẹn →
                </Link>
              </div>
            </div>
          )}

          {user.role === 'admin' && (
            <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-5 space-y-3">
              <div className="flex items-center gap-2 text-purple-800 font-bold">
                <ShieldCheck className="h-5 w-5" />
                <span>Quyền Quản Trị Hệ Thống Toàn Quyền</span>
              </div>
              <p className="text-xs text-purple-700 leading-relaxed">
                Tài khoản của bạn có quyền giám sát toàn bộ tin đăng BĐS, kiểm duyệt bài đăng, cấp tài khoản cho môi giới và kiểm tra lịch sử audit logs hệ thống.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Link
                  to={ADMIN_ROUTES.moderation}
                  className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700"
                >
                  Trung tâm kiểm duyệt
                </Link>
                <Link
                  to={ADMIN_ROUTES.users}
                  className="rounded-xl border border-purple-300 bg-white px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50"
                >
                  Quản lý Người dùng
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
