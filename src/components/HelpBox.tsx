import type { ReactNode } from 'react'

type HelpBoxProps = {
  title?: string
  children: ReactNode
}

export function HelpBox({ title = 'How this works', children }: HelpBoxProps) {
  return (
    <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
      <p className="font-semibold text-sky-900">{title}</p>
      <div className="mt-1.5 space-y-1 text-sky-900/90 leading-relaxed">{children}</div>
    </div>
  )
}
