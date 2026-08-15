import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle, Send } from 'lucide-react'
import { MapPinPicker } from '@/components/broker/MapPinPicker'
import { MediaUploadZone } from '@/components/broker/MediaUploadZone'
import { PropertyWizardProgress } from '@/components/broker/PropertyWizardProgress'
import { Badge } from '@/components/common/Badge'
import { BROKER_ROUTES } from '@/config/routes'
import {
  DIRECTIONS,
  DISTRICTS,
  FURNITURE_OPTIONS,
  INITIAL_WIZARD_FORM,
  LEGAL_OPTIONS,
  PROVINCES,
  type ListingWizardForm,
} from '@/types/listingWizard'
import { formatPrice, legalLabels, propertyTypeLabels, transactionLabels } from '@/utils/format'
import type { PropertyType } from '@/types'

const CATEGORIES: PropertyType[] = ['apartment', 'house', 'land', 'villa']

export function BrokerCreatePropertyPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<ListingWizardForm>(INITIAL_WIZARD_FORM)
  const [submitted, setSubmitted] = useState(false)

  function patch(patch: Partial<ListingWizardForm>) {
    setForm((prev) => ({ ...prev, ...patch }))
  }

  function nextStep() {
    setStep((s) => Math.min(s + 1, 5))
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 1))
  }

  function handleSubmit() {
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle className="h-10 w-10 text-emerald-600" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Đã gửi kiểm duyệt</h1>
        <p className="mt-2 text-slate-500">
          Tin đăng &quot;{form.title || 'Bất động sản mới'}&quot; đang chờ admin duyệt. Bạn sẽ được thông báo trong vòng 24 giờ.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to={BROKER_ROUTES.properties} className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
            Tin đăng của tôi
          </Link>
          <button
            type="button"
            onClick={() => { setSubmitted(false); setStep(1); setForm(INITIAL_WIZARD_FORM) }}
            className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium hover:bg-slate-50"
          >
            Thêm tin khác
          </button>
        </div>
      </div>
    )
  }

  const districts = DISTRICTS[form.province] ?? []

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Đăng tin mới</h1>
        <p className="text-slate-500">Hoàn thành các bước — tin đăng sẽ được kiểm duyệt trước khi hiển thị</p>
      </div>

      <PropertyWizardProgress currentStep={step} />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Step 1 — General Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-bold text-slate-900">Bước 1: Thông tin chung</h2>
            <div>
              <label className="text-sm font-medium text-slate-700">Tiêu đề *</label>
              <input
                value={form.title}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder="VD: Căn hộ 2PN cao cấp view sông"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Mô tả *</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => patch({ description: e.target.value })}
                placeholder="Mô tả bất động sản, tiện ích và điểm nổi bật..."
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Loại tin *</label>
                <select
                  value={form.transactionType}
                  onChange={(e) => patch({ transactionType: e.target.value as ListingWizardForm['transactionType'] })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                >
                  <option value="sale">Bán</option>
                  <option value="rent">Cho thuê</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Loại hình *</label>
                <select
                  value={form.category}
                  onChange={(e) => patch({ category: e.target.value as PropertyType })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{propertyTypeLabels[c]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Giá (VND) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => patch({ price: e.target.value })}
                  placeholder={form.transactionType === 'rent' ? '25000000' : '5000000000'}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Diện tích (m²) *</label>
                <input
                  type="number"
                  value={form.area}
                  onChange={(e) => patch({ area: e.target.value })}
                  placeholder="85"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Location */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-bold text-slate-900">Bước 2: Vị trí</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-slate-700">Tỉnh/Thành phố *</label>
                <select
                  value={form.province}
                  onChange={(e) => patch({ province: e.target.value, district: '' })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                >
                  {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Quận/Huyện *</label>
                <select
                  value={form.district}
                  onChange={(e) => patch({ district: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                >
                  <option value="">Chọn quận/huyện</option>
                  {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Phường/Xã *</label>
                <input
                  value={form.ward}
                  onChange={(e) => patch({ ward: e.target.value })}
                  placeholder="Phường 22"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Địa chỉ đường *</label>
              <input
                value={form.street}
                onChange={(e) => patch({ street: e.target.value })}
                placeholder="208 Nguyễn Hữu Cảnh"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              />
            </div>
            <MapPinPicker
              latitude={form.latitude}
              longitude={form.longitude}
              onChange={(lat, lng) => patch({ latitude: lat, longitude: lng })}
            />
          </div>
        )}

        {/* Step 3 — Media */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-bold text-slate-900">Bước 3: Tải media</h2>
            <MediaUploadZone files={form.media} onChange={(media) => patch({ media })} />
          </div>
        )}

        {/* Step 4 — Legal & Details */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-bold text-slate-900">Bước 4: Pháp lý & Chi tiết</h2>
            <div>
              <label className="text-sm font-medium text-slate-700">Loại giấy tờ pháp lý *</label>
              <select
                value={form.legalStatus}
                onChange={(e) => patch({ legalStatus: e.target.value as ListingWizardForm['legalStatus'] })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              >
                {LEGAL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-slate-700">Số tầng</label>
                <input
                  type="number"
                  value={form.floors}
                  onChange={(e) => patch({ floors: e.target.value })}
                  placeholder="4"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Phòng ngủ</label>
                <input
                  type="number"
                  value={form.bedrooms}
                  onChange={(e) => patch({ bedrooms: e.target.value })}
                  placeholder="2"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Phòng tắm</label>
                <input
                  type="number"
                  value={form.bathrooms}
                  onChange={(e) => patch({ bathrooms: e.target.value })}
                  placeholder="2"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Hướng nhà</label>
                <select
                  value={form.direction}
                  onChange={(e) => patch({ direction: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                >
                  {DIRECTIONS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Tình trạng nội thất</label>
                <select
                  value={form.furniture}
                  onChange={(e) => patch({ furniture: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                >
                  {FURNITURE_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 5 — Review */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="font-bold text-slate-900">Bước 5: Xem lại & Gửi</h2>
            <article className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="aspect-[16/9] bg-slate-100">
                {form.media[0] ? (
                  form.media[0].type === 'video' ? (
                    <div className="flex h-full items-center justify-center bg-slate-800 text-white">Ảnh bìa video</div>
                  ) : (
                    <img src={form.media[0].url} alt="" className="h-full w-full object-cover" />
                  )
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">Chưa tải media</div>
                )}
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-emerald-100 text-emerald-700">{transactionLabels[form.transactionType]}</Badge>
                  <Badge className="bg-slate-100 text-slate-600">{propertyTypeLabels[form.category]}</Badge>
                  <Badge className="bg-slate-100 text-slate-600">{legalLabels[form.legalStatus]}</Badge>
                </div>
                <h3 className="mt-3 text-xl font-bold text-slate-900">{form.title || 'Tin đăng chưa đặt tên'}</h3>
                <p className="mt-1 text-lg font-bold text-emerald-700">
                  {form.price
                    ? formatPrice(Number(form.price), form.transactionType)
                    : '—'}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {[form.street, form.ward, form.district, form.province].filter(Boolean).join(', ') || 'Chưa nhập địa chỉ'}
                </p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                  {form.area && <span>{form.area} m²</span>}
                  {form.bedrooms && <span>{form.bedrooms} phòng ngủ</span>}
                  {form.bathrooms && <span>{form.bathrooms} phòng tắm</span>}
                  {form.floors && <span>{form.floors} tầng</span>}
                </div>
                {form.description && (
                  <p className="mt-3 line-clamp-3 text-sm text-slate-600">{form.description}</p>
                )}
                <p className="mt-2 text-xs text-slate-400">
                  GPS: {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)} · {form.media.length} tệp media
                </p>
              </div>
            </article>
            <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
              Sau khi gửi, tin đăng sẽ ở trạng thái <strong>Chờ kiểm duyệt</strong>. Admin thường duyệt trong vòng 24 giờ.
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex justify-between border-t border-slate-100 pt-6">
          {step > 1 ? (
            <button type="button" onClick={prevStep} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50">
              Quay lại
            </button>
          ) : (
            <button type="button" onClick={() => navigate(BROKER_ROUTES.properties)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50">
              Hủy
            </button>
          )}
          {step < 5 ? (
            <button type="button" onClick={nextStep} className="rounded-xl bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              Tiếp tục
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Send className="h-4 w-4" />
              Gửi kiểm duyệt
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
