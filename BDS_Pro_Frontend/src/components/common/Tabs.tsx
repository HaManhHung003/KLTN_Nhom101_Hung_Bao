import type { ReactNode } from 'react'

interface TabsProps {
  tabs: { id: string; label: string; badge?: number }[]
  active: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, active, onChange, className = '' }: TabsProps) {
  return (
    <div className={`flex gap-1 overflow-x-auto rounded-xl bg-slate-100/80 p-1 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`relative flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            active === tab.id
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {tab.label}
          {tab.badge !== undefined && tab.badge > 0 && (
            <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

interface TabPanelProps {
  active: string
  id: string
  children: ReactNode
}

export function TabPanel({ active, id, children }: TabPanelProps) {
  if (active !== id) return null
  return <div className="animate-fade-in">{children}</div>
}
