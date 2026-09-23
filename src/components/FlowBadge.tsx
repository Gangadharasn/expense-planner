type FlowBadgeProps = {
  flow: 'in' | 'out'
}

/** Distinct labels — not plain + / − symbols in the UI chrome. */
export function FlowBadge({ flow }: FlowBadgeProps) {
  if (flow === 'in') {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold tracking-wide text-emerald-800"
        title="Money added to your wallet"
      >
        <span aria-hidden>◈</span> ADD
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold tracking-wide text-amber-900"
      title="Bill or payment"
    >
      <span aria-hidden>▷</span> PAY
    </span>
  )
}

export function FlowAmount({
  flow,
  currency,
  amount,
}: {
  flow: 'in' | 'out'
  currency: string
  amount: number
}) {
  const formatted = amount.toLocaleString(undefined, { maximumFractionDigits: 0 })
  if (flow === 'in') {
    return (
      <span className="font-semibold text-emerald-700">
        {currency}{formatted}
      </span>
    )
  }
  return (
    <span className="font-semibold text-amber-800">
      {currency}{formatted}
    </span>
  )
}
