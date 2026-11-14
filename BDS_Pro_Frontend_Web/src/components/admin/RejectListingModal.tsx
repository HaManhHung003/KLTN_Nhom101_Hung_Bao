import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { REJECTION_REASONS, type RejectionReason } from '@/types/admin'

const REJECTION_REASON_LABELS: Record<RejectionReason, string> = {
  'Invalid legal document': 'Giấy tờ pháp lý không hợp lệ',
  'Misleading price': 'Giá sai lệch / gây hiểu nhầm',
  'Duplicate listing': 'Tin đăng trùng lặp',
  'Incomplete property information': 'Thông tin BĐS chưa đầy đủ',
  'Suspicious or stock images detected': 'Phát hiện ảnh stock / đáng ngờ',
  'Policy violation — contact required': 'Vi phạm chính sách — cần liên hệ',
}

interface RejectListingModalProps {
  listingTitle: string
  onConfirm: (reason: RejectionReason, note: string) => void
  onClose: () => void
}

export function RejectListingModal({ listingTitle, onConfirm, onClose }: RejectListingModalProps) {
  const [reason, setReason] = useState<RejectionReason>(REJECTION_REASONS[0])
  const [note, setNote] = useState('')

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="font-bold">Từ chối tin đăng</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-sm text-slate-600">
            Từ chối: <strong className="text-slate-900">{listingTitle}</strong>
          </p>

          <div>
            <label className="text-sm font-medium text-slate-700">Lý do từ chối *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as RejectionReason)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            >
              {REJECTION_REASONS.map((r) => (
                <option key={r} value={r}>{REJECTION_REASON_LABELS[r]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Ghi chú thêm</label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Chi tiết bổ sung gửi cho môi giới..."
              className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => onConfirm(reason, note)}
              className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Xác nhận từ chối
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
