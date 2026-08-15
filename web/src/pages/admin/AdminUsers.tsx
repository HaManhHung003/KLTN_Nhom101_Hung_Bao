import { Ban, CheckCircle, MoreHorizontal, Shield } from 'lucide-react'
import { adminUsers } from '@/data/mockData'

const roleLabels: Record<string, string> = {
  buyer: 'Khách hàng',
  agent: 'Môi giới',
  admin: 'Admin',
}

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  blocked: 'bg-red-100 text-red-700',
  pending: 'bg-amber-100 text-amber-700',
}

export function AdminUsers({ embedded = false }: { embedded?: boolean }) {
  return (
    <div>
      {!embedded && (
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý người dùng</h1>
            <p className="text-slate-500">Phân quyền, khóa/mở tài khoản — FR-AD02</p>
          </div>
          <input type="search" placeholder="Tìm theo tên, email..." className="rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-brand-500" />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-slate-500">
              <th className="p-4 font-medium">Người dùng</th>
              <th className="p-4 font-medium">Vai trò</th>
              <th className="p-4 font-medium">Trạng thái</th>
              <th className="p-4 font-medium">Ngày tham gia</th>
              <th className="p-4 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {adminUsers.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="p-4">
                  <p className="font-medium text-slate-900">{u.name}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 text-slate-700">
                    {u.role === 'agent' && <Shield className="h-3.5 w-3.5 text-brand-600" />}
                    {roleLabels[u.role]}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[u.status]}`}>
                    {u.status === 'active' ? 'Hoạt động' : u.status === 'blocked' ? 'Đã khóa' : 'Chờ xác minh'}
                  </span>
                </td>
                <td className="p-4 text-slate-500">{new Date(u.joined).toLocaleDateString('vi-VN')}</td>
                <td className="p-4">
                  <div className="flex gap-1">
                    {u.status === 'blocked' ? (
                      <button type="button" className="rounded-lg p-2 hover:bg-emerald-50" title="Mở khóa">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      </button>
                    ) : (
                      <button type="button" className="rounded-lg p-2 hover:bg-red-50" title="Khóa">
                        <Ban className="h-4 w-4 text-red-500" />
                      </button>
                    )}
                    <button type="button" className="rounded-lg p-2 hover:bg-slate-100">
                      <MoreHorizontal className="h-4 w-4 text-slate-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
