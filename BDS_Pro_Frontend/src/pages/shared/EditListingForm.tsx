import { useParams } from 'react-router-dom'
import { Upload, MapPin } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { properties } from '@/data/mockData'
import { formatPrice, propertyTypeLabels, transactionLabels } from '@/utils/format'

export function EditListingForm({ role }: { role: 'agent' | 'admin' }) {
  const { id } = useParams()
  const property = properties.find((p) => p.id === id) ?? properties[0]

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Sửa tin BĐS"
        description={`Cập nhật thông tin tin đăng · ${formatPrice(property.price, property.transactionType)}`}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Tiêu đề tin</label>
            <input defaultValue={property.title} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Loại BĐS</label>
              <select defaultValue={property.type} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm">
                {Object.entries(propertyTypeLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Hình thức</label>
              <select defaultValue={property.transactionType} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm">
                {Object.entries(transactionLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Giá</label>
              <input type="number" defaultValue={property.price} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Diện tích (m²)</label>
              <input type="number" defaultValue={property.area} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Địa chỉ</label>
            <input defaultValue={property.address} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
          </div>
          <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
            <div className="text-center text-slate-500">
              <MapPin className="mx-auto h-6 w-6 text-brand-600" />
              <p className="mt-1 text-xs">Tọa độ: {property.latitude}, {property.longitude}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Mô tả</label>
            <textarea rows={4} defaultValue={property.description} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
          </div>
          <div className="flex h-24 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
            <Upload className="h-6 w-6 text-slate-400" />
            <span className="ml-2 text-sm text-slate-500">Thay đổi ảnh ({property.images.length} ảnh hiện tại)</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50">
            Hủy
          </button>
          {role === 'agent' && (
            <button type="button" className="rounded-xl border border-amber-300 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50">
              Gửi duyệt lại
            </button>
          )}
          <button type="button" className="rounded-xl bg-brand-600 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  )
}
