import { useMemo } from 'react'
import { monthKey } from '../lib/dates'
import { formatMoney } from '../lib/format'
import type { AppData } from '../types'

type Props = {
  data: AppData
  now: Date
  onAddCredit: () => void
  onRemove: (id: string) => void
}

export function CreditPage({ data, now, onAddCredit, onRemove }: Props) {
  const key = monthKey(now)
  const { currency, creditCardLimit } = data.settings

  const { thisMonth, allCredit } = useMemo(() => {
    let month = 0
    let all = 0
    const items = data.expenses.filter(
      (e) => e.paymentMethod === 'credit' && e.kind === 'actual',
    )
    for (const e of items) {
      all += e.amount
      if (e.recurrence === 'once' && e.date.slice(0, 7) === key) month += e.amount
      if (e.recurrence === 'monthly' && key >= e.date.slice(0, 7)) {
        month += e.amount
      }
    }
    return { thisMonth: month, allCredit: all, items }
  }, [data.expenses, key])

  const items = data.expenses.filter((e) => e.paymentMethod === 'credit')

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-5 text-white shadow-lg">
        <p className="text-sm text-indigo-100">Credit card this month</p>
        <p className="mt-1 text-3xl font-bold">{formatMoney(currency, thisMonth)}</p>
        {creditCardLimit > 0 && (
          <p className="mt-2 text-sm text-indigo-100">
            Used {Math.round((thisMonth / creditCardLimit) * 100)}% of limit ·
            Left {formatMoney(currency, Math.max(0, creditCardLimit - thisMonth))}
          </p>
        )}
        <p className="mt-1 text-xs text-indigo-200">
          All-time card spend logged: {formatMoney(currency, allCredit)}
        </p>
      </section>

      <button
        type="button"
        onClick={onAddCredit}
        className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white"
      >
        + Add credit card expense
      </button>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold">Card transactions</h2>
        {items.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No card expenses yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {items.map((e) => (
              <li
                key={e.id}
                className="flex items-start justify-between gap-2 py-3 first:pt-0"
              >
                <div>
                  <p className="text-sm font-medium">
                    {e.category}
                    {e.kind === 'planned' && (
                      <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                        Planned
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    {e.date}
                    {e.note ? ` · ${e.note}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    {formatMoney(currency, e.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(e.id)}
                    className="text-xs text-slate-400 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
