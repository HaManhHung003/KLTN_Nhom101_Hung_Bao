import { MockPage } from '@/components/common/MockPage'

const logs = [
  { id: '1', time: '2026-08-15 17:45', level: 'INFO', msg: 'Tin p5 đã gửi kiểm duyệt' },
  { id: '2', time: '2026-08-15 17:30', level: 'WARN', msg: 'Mở tranh chấp đặt cọc — giao dịch t3' },
  { id: '3', time: '2026-08-15 16:12', level: 'INFO', msg: 'Người dùng u8 chờ xác minh môi giới' },
  { id: '4', time: '2026-08-15 15:00', level: 'ERROR', msg: 'Cổng thanh toán timeout (sandbox)' },
]

export function AdminLogsPage() {
  return (
    <MockPage title="Nhật ký hệ thống" description="Lịch sử kiểm duyệt, thanh toán và sự kiện xác thực.">
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-3 font-medium">Thời gian</th>
              <th className="p-3 font-medium">Mức</th>
              <th className="p-3 font-medium">Nội dung</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-slate-100">
                <td className="p-3 font-mono text-xs text-slate-500">{log.time}</td>
                <td className="p-3">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-bold ${
                      log.level === 'ERROR'
                        ? 'bg-red-100 text-red-700'
                        : log.level === 'WARN'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {log.level}
                  </span>
                </td>
                <td className="p-3 text-slate-700">{log.msg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MockPage>
  )
}
