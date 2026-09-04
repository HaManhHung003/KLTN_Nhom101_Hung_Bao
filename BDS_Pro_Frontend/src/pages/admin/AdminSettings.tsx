export function AdminSettings({ embedded = false }: { embedded?: boolean }) {
  return (
    <div className={embedded ? '' : 'mx-auto max-w-2xl space-y-6'}>
      {!embedded && (
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cấu hình hệ thống</h1>
          <p className="text-slate-500">Phí, thời hạn tin, template thông báo — FR-AD04</p>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
        <section>
          <h2 className="font-bold text-slate-900">Chính sách tin đăng</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Thời hạn tin (ngày)</label>
              <input type="number" defaultValue={30} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Phí đăng tin VIP (VNĐ/tháng)</label>
              <input type="number" defaultValue={500000} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Phí giao dịch (%)</label>
              <input type="number" defaultValue={1.5} step={0.1} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-bold text-slate-900">Thông báo</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Template nhắc lịch xem nhà</label>
              <textarea
                rows={3}
                defaultValue="Nhắc lịch: Bạn có lịch xem {property_title} vào {date} lúc {time}."
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" defaultChecked id="push" className="rounded" />
              <label htmlFor="push" className="text-sm text-slate-700">Bật Push Notification</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" defaultChecked id="email" className="rounded" />
              <label htmlFor="email" className="text-sm text-slate-700">Gửi Email xác nhận lịch hẹn</label>
            </div>
          </div>
        </section>

        <button type="button" className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Lưu cấu hình
        </button>
      </div>
    </div>
  )
}
