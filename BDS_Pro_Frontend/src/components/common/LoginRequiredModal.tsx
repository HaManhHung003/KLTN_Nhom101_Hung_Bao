import { Link } from 'react-router-dom'
import { Lock, X, UserPlus, LogIn, Sparkles } from 'lucide-react'

interface LoginRequiredModalProps {
  isOpen: boolean
  onClose: () => void
  /** Hành động người dùng muốn thực hiện, dùng để hiển thị thông điệp phù hợp */
  action?: 'save' | 'book' | 'chat' | 'deposit' | 'review' | 'compare' | 'contact'
  /** Đường dẫn redirect sau khi đăng nhập thành công */
  redirectTo?: string
}

const actionCopy: Record<NonNullable<LoginRequiredModalProps['action']>, { title: string; desc: string }> = {
  save: {
    title: 'Lưu tin yêu thích',
    desc: 'Đăng nhập để lưu BĐS vào danh sách yêu thích và nhận thông báo khi có cập nhật.',
  },
  book: {
    title: 'Đặt lịch xem BĐS',
    desc: 'Bạn cần đăng nhập để đặt lịch hẹn xem nhà/đất với môi giới.',
  },
  chat: {
    title: 'Chat với môi giới',
    desc: 'Đăng nhập để trò chuyện trực tiếp với chủ BĐS hoặc môi giới.',
  },
  deposit: {
    title: 'Đặt cọc an toàn',
    desc: 'Đăng nhập để thực hiện đặt cọc giữ chỗ qua cổng thanh toán bảo mật.',
  },
  review: {
    title: 'Đánh giá BĐS',
    desc: 'Chia sẻ trải nghiệm của bạn để giúp cộng đồng có thêm thông tin.',
  },
  compare: {
    title: 'So sánh BĐS nâng cao',
    desc: 'Đăng nhập để lưu và đồng bộ danh sách so sánh trên nhiều thiết bị.',
  },
  contact: {
    title: 'Liên hệ tư vấn',
    desc: 'Đăng nhập để được hỗ trợ tư vấn BĐS nhanh chóng qua chat hoặc gọi điện.',
  },
}

export function LoginRequiredModal({
  isOpen,
  onClose,
  action = 'save',
  redirectTo,
}: LoginRequiredModalProps) {
  if (!isOpen) return null

  const copy = actionCopy[action]
  const target = redirectTo
    ? `/login?redirect=${encodeURIComponent(redirectTo)}`
    : '/login'
  const registerTarget = redirectTo
    ? `/register?redirect=${encodeURIComponent(redirectTo)}`
    : '/register'

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-1.5 text-slate-500 backdrop-blur transition hover:bg-white hover:text-slate-900"
          aria-label="Đóng"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Hero gradient header */}
        <div className="relative bg-gradient-to-br from-brand-700 via-brand-600 to-teal-600 px-6 pb-10 pt-8 text-center text-white">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur">
            <Lock className="h-7 w-7" />
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur">
            <Sparkles className="h-3 w-3" />
            Yêu cầu đăng nhập
          </div>
          <h2 className="mt-3 text-xl font-bold sm:text-2xl">{copy.title}</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-emerald-100">{copy.desc}</p>
        </div>

        {/* Body */}
        <div className="space-y-3 px-6 pb-6 pt-5">
          <Link
            to={target}
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            <LogIn className="h-4 w-4" />
            Đăng nhập
          </Link>
          <Link
            to={registerTarget}
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <UserPlus className="h-4 w-4" />
            Đăng ký miễn phí
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="block w-full text-center text-xs font-medium text-slate-400 hover:text-slate-600"
          >
            Tiếp tục xem không cần đăng nhập
          </button>
        </div>

        {/* Benefits strip */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 bg-slate-50/60 px-2 py-3 text-center text-[11px] text-slate-500">
          <div>✓ Lưu tin</div>
          <div>✓ Chat AI</div>
          <div>✓ Đặt cọc</div>
        </div>
      </div>
    </div>
  )
}