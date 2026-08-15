import { useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { ModerationDrawer } from '@/components/admin/ModerationDrawer'
import { RejectListingModal } from '@/components/admin/RejectListingModal'
import { RiskScoreBadge } from '@/components/admin/RiskScoreBadge'
import { moderationQueue as seedQueue } from '@/data/mockData'
import type { ModerationQueueItem, RejectionReason } from '@/types/admin'

export function AdminModerationCenterPage() {
  const [queue, setQueue] = useState<ModerationQueueItem[]>(seedQueue)
  const [selected, setSelected] = useState<ModerationQueueItem | null>(null)
  const [rejectTarget, setRejectTarget] = useState<ModerationQueueItem | null>(null)

  function removeFromQueue(id: string) {
    setQueue((prev) => prev.filter((item) => item.id !== id))
    setSelected(null)
    setRejectTarget(null)
  }

  function handleApprove(id: string) {
    removeFromQueue(id)
  }

  function openReject(id: string) {
    const item = queue.find((q) => q.id === id)
    if (item) setRejectTarget(item)
  }

  function handleRejectConfirm(_reason: RejectionReason, _note: string) {
    if (rejectTarget) removeFromQueue(rejectTarget.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trung tâm kiểm duyệt</h1>
          <p className="text-slate-500">Duyệt tin chờ đăng — kiểm tra tự động + quyết định thủ công</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800">
          <ShieldAlert className="h-4 w-4" />
          {queue.length} tin trong hàng chờ
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Ảnh</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Tiêu đề</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Môi giới</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Ngày gửi</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Mức rủi ro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queue.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-slate-500">
                    Hàng chờ trống — đã duyệt hết tin đăng
                  </td>
                </tr>
              ) : (
                queue.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className="cursor-pointer transition hover:bg-indigo-50/50"
                  >
                    <td className="px-4 py-3">
                      <img
                        src={item.thumbnail}
                        alt=""
                        className="h-14 w-20 rounded-lg object-cover ring-1 ring-slate-200"
                      />
                    </td>
                    <td className="max-w-xs px-4 py-3">
                      <p className="line-clamp-2 font-medium text-slate-900">{item.title}</p>
                      <p className="mt-0.5 text-xs text-slate-400">#{item.propertyId.toUpperCase()}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{item.brokerName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">{item.submittedAt}</td>
                    <td className="px-4 py-3">
                      <RiskScoreBadge level={item.riskScore} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModerationDrawer
        item={selected}
        onClose={() => setSelected(null)}
        onApprove={handleApprove}
        onReject={openReject}
      />

      {rejectTarget && (
        <RejectListingModal
          listingTitle={rejectTarget.title}
          onConfirm={handleRejectConfirm}
          onClose={() => setRejectTarget(null)}
        />
      )}
    </div>
  )
}
