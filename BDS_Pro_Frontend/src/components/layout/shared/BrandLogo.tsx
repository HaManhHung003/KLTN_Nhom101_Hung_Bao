import { Link } from 'react-router-dom'

interface BrandLogoProps {
  to: string
  badge?: string
  title?: string
  subtitle?: string
  size?: 'sm' | 'md'
}

export function BrandLogo({ to, badge = 'BĐS', title = 'BDS Pro', subtitle, size = 'md' }: BrandLogoProps) {
  const box = size === 'sm' ? 'h-8 w-8 text-xs rounded-lg' : 'h-9 w-9 text-xs rounded-xl sm:text-sm'
  const titleCls = size === 'sm' ? 'text-base sm:text-lg' : 'text-lg'

  return (
    <Link to={to} className="flex min-w-0 items-center gap-2.5">
      <div className={`flex shrink-0 items-center justify-center bg-brand-600 font-bold text-white shadow-sm ${box}`}>
        {badge}
      </div>
      <div className="min-w-0">
        <p className={`truncate font-bold text-slate-900 ${titleCls}`}>{title}</p>
        {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
      </div>
    </Link>
  )
}
