import type { ReactNode } from 'react'

interface MockPageProps {
  title: string
  description?: string
  children?: ReactNode
}

export function MockPage({ title, description, children }: MockPageProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {description && <p className="mt-2 text-slate-500">{description}</p>}
      {children ?? (
        <p className="mt-6 text-sm text-slate-400">
          Mock page — connect API & business logic in a later sprint.
        </p>
      )}
    </div>
  )
}
