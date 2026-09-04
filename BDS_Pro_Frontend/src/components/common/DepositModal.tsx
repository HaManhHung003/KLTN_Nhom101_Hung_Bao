import { useState } from 'react'
import { CreditCard, Shield, X } from 'lucide-react'
import type { Property } from '@/types'
import { formatPrice } from '@/utils/format'

interface DepositModalProps {
  property: Property
  onClose: () => void
}

export function DepositModal({ property, onClose }: DepositModalProps) {
  const [step, setStep] = useState(1)
  const depositAmount = property.transactionType === 'rent' ? 5000000 : 500000000

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg animate-fade-in rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-600" />
            <h2 className="font-bold text-slate-900">Đặt cọc an toàn</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="font-medium text-slate-900 line-clamp-2">{property.title}</p>
                <p className="mt-1 text-brand-700 font-bold">{formatPrice(property.price, property.transactionType)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Số tiền cọc</label>
                <p className="mt-1 text-2xl font-bold text-slate-900">{depositAmount.toLocaleString('vi-VN')} đ</p>
                <p className="text-xs text-slate-500">Tiền giữ qua escrow — hoàn trả nếu giao dịch không thành</p>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700"
              >
                Tiếp tục thanh toán
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">Chọn cổng thanh toán (sandbox demo)</p>
              {(['vnpay', 'momo', 'bank'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 hover:border-brand-500 hover:bg-brand-50"
                >
                  <CreditCard className="h-5 w-5 text-brand-600" />
                  <span className="font-medium uppercase">{method === 'bank' ? 'Chuyển khoản' : method}</span>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <Shield className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">Thanh toán thành công!</h3>
              <p className="mt-2 text-sm text-slate-500">Mã biên lai: VN20260815001</p>
              <p className="mt-1 text-sm text-slate-500">Môi giới và Admin đã được thông báo</p>
              <button type="button" onClick={onClose} className="mt-6 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white">
                Hoàn tất
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
