import { Badge } from '@/components/common/Badge'
import type { RiskLevel } from '@/types/admin'

const RISK_CONFIG: Record<RiskLevel, { label: string; className: string }> = {
  low: { label: 'Thấp', className: 'bg-emerald-100 text-emerald-800' },
  medium: { label: 'Trung bình', className: 'bg-amber-100 text-amber-800' },
  high: { label: 'Cao', className: 'bg-red-100 text-red-800' },
}

export function RiskScoreBadge({ level }: { level: RiskLevel }) {
  const cfg = RISK_CONFIG[level]
  return <Badge className={cfg.className}>Rủi ro {cfg.label}</Badge>
}
