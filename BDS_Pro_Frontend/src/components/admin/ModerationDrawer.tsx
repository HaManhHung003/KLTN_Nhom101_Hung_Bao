import { AlertCircle, Check, CheckCircle, MapPin, X } from 'lucide-react'
import { Badge } from '@/components/common/Badge'
import { RiskScoreBadge } from '@/components/admin/RiskScoreBadge'
import type { ModerationQueueItem, ValidationStatus } from '@/types/admin'
import {
  formatPrice,
  legalLabels,
  propertyTypeLabels,
  transactionLabels,
} from '@/utils/format'

interface ModerationDrawerProps {
  item: ModerationQueueItem | null
  onClose: () => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

function CheckIcon({ status }: { status: ValidationStatus }) {
  if (status === 'passed') return <CheckCircle className="h-4 w-4 text-emerald-600" />
  if (status === 'failed') return <X className="h-4 w-4 text-red-600" />
  return <AlertCircle className="h-4 w-4 text-amber-500" />
}

function checkLabel(status: ValidationStatus): string {
  if (status === 'passed') return 'ĐẠT'
  if (status === 'failed') return 'KHÔNG ĐẠT'
  return 'CẢNH BÁO'
}

export function ModerationDrawer({ item, onClose, onApprove, onReject }: ModerationDrawerProps) {
  if (!item) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-4xl flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-bold text-slate-900">Duyệt tin đăng</h2>
            <p className="text-xs text-slate-500">Tin #{item.propertyId.toUpperCase()}</p>
          </div>
          <div className="flex items-center gap-2">
            <RiskScoreBadge level={item.riskScore} />
            <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
          {/* Listing details — left */}
          <div className="flex-1 overflow-y-auto border-b border-slate-100 p-5 lg:border-b-0 lg:border-r">
            <img src={item.thumbnail} alt="" className="aspect-video w-full rounded-xl object-cover" />
            <h3 className="mt-4 text-xl font-bold text-slate-900">{item.title}</h3>
            <p className="mt-1 text-lg font-bold text-indigo-700">
              {formatPrice(item.price, item.transactionType)}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge className="bg-slate-100 text-slate-600">{propertyTypeLabels[item.type]}</Badge>
              <Badge className="bg-indigo-100 text-indigo-700">{transactionLabels[item.transactionType]}</Badge>
              <Badge className="bg-slate-100 text-slate-600">{legalLabels[item.legalStatus]}</Badge>
            </div>
            <div className="mt-3 flex items-start gap-2 text-sm text-slate-500">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              {item.address}, {item.district}, {item.city}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="font-bold">{item.area} m²</p>
                <p className="text-xs text-slate-500">Diện tích</p>
              </div>
              {item.bedrooms != null && (
                <div className="rounded-lg bg-slate-50 p-2">
                  <p className="font-bold">{item.bedrooms}</p>
                  <p className="text-xs text-slate-500">Phòng ngủ</p>
                </div>
              )}
              {item.bathrooms != null && (
                <div className="rounded-lg bg-slate-50 p-2">
                  <p className="font-bold">{item.bathrooms}</p>
                  <p className="text-xs text-slate-500">Phòng tắm</p>
                </div>
              )}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">{item.description}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {item.amenities.map((a) => (
                <Badge key={a} className="bg-slate-100 text-slate-600">{a}</Badge>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-400">
              Môi giới: <strong>{item.brokerName}</strong> · Gửi lúc {item.submittedAt}
            </p>
          </div>

          {/* Auto-validation checklist — right */}
          <div className="w-full shrink-0 overflow-y-auto bg-slate-50 p-5 lg:w-80">
            <h4 className="font-bold text-slate-900">Danh sách kiểm tra tự động</h4>
            <p className="mt-1 text-xs text-slate-500">Kết quả sàng lọc sơ bộ bằng AI</p>
            <ul className="mt-4 space-y-2">
              {item.validationChecks.map((check) => (
                <li
                  key={check.id}
                  className={`rounded-xl border bg-white p-3 ${
                    check.status === 'failed'
                      ? 'border-red-200'
                      : check.status === 'warning'
                        ? 'border-amber-200'
                        : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <CheckIcon status={check.status} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800">
                        {check.label}:{' '}
                        <span
                          className={
                            check.status === 'passed'
                              ? 'text-emerald-600'
                              : check.status === 'failed'
                                ? 'text-red-600'
                                : 'text-amber-600'
                          }
                        >
                          {checkLabel(check.status)}
                        </span>
                      </p>
                      {check.detail && (
                        <p className="mt-0.5 text-xs text-slate-500">{check.detail}</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action footer */}
        <div className="flex gap-3 border-t border-slate-100 bg-white p-5">
          <button
            type="button"
            onClick={() => onReject(item.id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-red-200 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <X className="h-4 w-4" />
            Từ chối tin
          </button>
          <button
            type="button"
            onClick={() => onApprove(item.id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Check className="h-4 w-4" />
            Duyệt & Xuất bản
          </button>
        </div>
      </aside>
    </>
  )
}
