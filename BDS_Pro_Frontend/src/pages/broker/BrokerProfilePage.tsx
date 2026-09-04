import { MockPage } from '@/components/common/MockPage'
import { Package, User } from 'lucide-react'

export function BrokerProfilePage() {
  return (
    <MockPage title="Hồ sơ & Gói dịch vụ" description="Xác minh môi giới, gói đăng tin và thanh toán.">
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-4">
          <User className="h-6 w-6 text-emerald-600" />
          <p className="mt-2 font-semibold">Hồ sơ môi giới</p>
          <p className="text-sm text-slate-500">KYC, tải giấy phép, thông tin liên hệ công khai.</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <Package className="h-6 w-6 text-emerald-600" />
          <p className="mt-2 font-semibold">Gói đăng tin</p>
          <p className="text-sm text-slate-500">Miễn phí · Pro · VIP — tăng hiển thị và phân tích.</p>
        </div>
      </div>
    </MockPage>
  )
}
