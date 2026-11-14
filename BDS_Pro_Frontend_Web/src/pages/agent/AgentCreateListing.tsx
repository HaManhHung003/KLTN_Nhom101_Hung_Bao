import { useState } from 'react'
import { Upload, MapPin } from 'lucide-react'
import { propertyTypeLabels, transactionLabels } from '@/utils/format'

export function AgentCreateListing() {
  const [step, setStep] = useState(1)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tạo tin BĐS mới</h1>
        <p className="text-slate-500">Quy trình: Nháp → Chờ duyệt → Admin phê duyệt → Hiển thị</p>
      </div>

      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${step >= s ? 'bg-brand-600' : 'bg-slate-200'}`}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-bold text-slate-900">Bước 1: Thông tin cơ bản</h2>
            <div>
              <label className="text-sm font-medium text-slate-700">Tiêu đề tin *</label>
              <input
                placeholder="VD: Căn hộ 2PN view sông Vinhomes Central Park"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Loại BĐS *</label>
                <select className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm">
                  {Object.entries(propertyTypeLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Hình thức *</label>
                <select className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm">
                  {Object.entries(transactionLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Giá *</label>
                <input type="number" placeholder="25000000" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Diện tích (m²) *</label>
                <input type="number" placeholder="85" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-bold text-slate-900">Bước 2: Vị trí & Pháp lý</h2>
            <div>
              <label className="text-sm font-medium text-slate-700">Địa chỉ chi tiết *</label>
              <input placeholder="208 Nguyễn Hữu Cảnh, Bình Thạnh, TP.HCM" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
            </div>
            <div className="flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
              <div className="text-center text-slate-500">
                <MapPin className="mx-auto h-8 w-8 text-brand-600" />
                <p className="mt-2 text-sm">Chọn vị trí trên bản đồ (tích hợp sau)</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Tình trạng pháp lý *</label>
              <select className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm">
                <option>Sổ hồng</option>
                <option>Sổ đỏ</option>
                <option>Hợp đồng</option>
                <option>Chờ sổ</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Mô tả chi tiết</label>
              <textarea rows={4} placeholder="Mô tả BĐS, tiện ích nội/ngoại khu..." className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-bold text-slate-900">Bước 3: Hình ảnh & Gửi duyệt</h2>
            <div className="flex h-48 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
              <Upload className="h-10 w-10 text-slate-400" />
              <p className="mt-2 text-sm text-slate-500">Kéo thả ảnh hoặc click để upload (tối thiểu 3 ảnh)</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
              Tin sẽ chuyển sang trạng thái <strong>Chờ duyệt</strong> sau khi gửi. Admin sẽ kiểm duyệt trong 24h.
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          {step > 1 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50">
              Quay lại
            </button>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <button type="button" onClick={() => setStep(step + 1)} className="rounded-xl bg-brand-600 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-700">
              Tiếp tục
            </button>
          ) : (
            <div className="flex gap-2">
              <button type="button" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium">Lưu nháp</button>
              <button type="button" className="rounded-xl bg-brand-600 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-700">Gửi duyệt</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
