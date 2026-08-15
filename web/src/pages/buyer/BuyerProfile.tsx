import { Link } from 'react-router-dom'
import { buyerNotifications, currentUsers } from '@/data/mockData'

export function BuyerProfile() {
  const user = currentUsers.buyer

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Hồ sơ cá nhân</h1>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <img src={user.avatar} alt="" className="h-20 w-20 rounded-full ring-4 ring-brand-100" />
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            <p className="text-slate-500">{user.email}</p>
            <p className="text-sm text-slate-500">{user.phone}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-slate-500">Họ tên</label>
            <input defaultValue={user.name} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Số điện thoại</label>
            <input defaultValue={user.phone} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-500">Email</label>
            <input defaultValue={user.email} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
        </div>
        <button type="button" className="mt-4 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          Lưu thay đổi
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Thông báo</h3>
          <Link to="/client/ca-nhan" className="text-sm text-sky-600 hover:underline">Xem tất cả</Link>
        </div>
        <div className="mt-4 space-y-3">
          {buyerNotifications.map((n) => (
            <div key={n.id} className={`rounded-xl p-3 ${n.read ? 'bg-slate-50' : 'bg-brand-50'}`}>
              <p className="font-medium text-slate-900">{n.title}</p>
              <p className="text-sm text-slate-500">{n.message}</p>
              <p className="mt-1 text-xs text-slate-400">{n.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
