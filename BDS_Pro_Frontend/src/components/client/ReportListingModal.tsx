import { useState } from 'react';
import { Flag, X } from 'lucide-react';
import { propertyService } from '@/services/property.service';
import type { Property } from '@/types';

interface ReportListingModalProps {
  property: Property;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

const REPORT_REASONS = [
  'Thông tin sai sự thật',
  'Hình ảnh không đúng thực tế',
  'Giá bất thường / lừa đảo',
  'Tin trùng lặp',
  'Khác',
];

/** Modal báo cáo tin đăng vi phạm — gửi lên endpoint /admin/reports. */
export function ReportListingModal({ property, onClose, onSuccess, onError }: ReportListingModalProps) {
  const [reasonType, setReasonType] = useState<string>(REPORT_REASONS[0]);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      await propertyService.reportProperty(
        property.id,
        `${reasonType}: ${reason.trim()}`,
      );
      onSuccess();
      onClose();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Không thể gửi báo cáo');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md animate-fade-in rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="flex items-center gap-2 font-bold text-slate-900">
            <Flag className="h-5 w-5 text-rose-600" /> Báo cáo tin đăng
          </h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Tin đăng: <strong className="text-slate-900">{property.title}</strong>
        </p>

        <label className="mt-4 block text-sm font-medium text-slate-700">Lý do</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {REPORT_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReasonType(r)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                reasonType === r
                  ? 'border-rose-300 bg-rose-50 text-rose-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <label htmlFor="report-detail" className="mt-4 block text-sm font-medium text-slate-700">
          Mô tả chi tiết
        </label>
        <textarea
          id="report-detail"
          required
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
          placeholder="VD: Hình ảnh lấy từ dự án khác, giá không khớp thực tế..."
          className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
        />
        <div className="mt-1 text-right text-[10px] text-slate-400">{reason.length}/500</div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Huỷ
          </button>
          <button
            type="submit"
            disabled={!reason.trim() || submitting}
            className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
          >
            {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
          </button>
        </div>
      </form>
    </div>
  );
}
