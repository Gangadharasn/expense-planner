import { useMemo, useState } from 'react'
import { addMonths, monthKey, monthLabel } from '../lib/dates'
import { forecastMonths } from '../lib/forecast'
import { formatMoney } from '../lib/format'
import type { AppData } from '../types'

type Props = {
  data: AppData
  now: Date
  onAddPlanned: () => void
  onRemove: (id: string) => void
}

export function PlanPage({ data, now, onAddPlanned, onRemove }: Props) {
  const [monthsAhead, setMonthsAhead] = useState(12)
  const currentKey = monthKey(now)
  const nextKey = addMonths(currentKey, 1)
  const { currency } = data.settings

  const planned = useMemo(
    () => data.expenses.filter((e) => e.kind === 'planned'),
    [data.expenses],
  )

  const thisMonth = planned.filter((e) => e.date.slice(0, 7) === currentKey)
  const nextMonth = planned.filter((e) => e.date.slice(0, 7) === nextKey)

  const forecast = useMemo(
    () => forecastMonths(data, now, monthsAhead),
    [data, now, monthsAhead],
  )

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Plan one-off costs for this month or next. They show in the life log as
        planned until you record them as actual spend.
      </p>

      <button
        type="button"
        onClick={onAddPlanned}
        className="w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white"
      >
        + Plan an expense
      </button>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold">{monthLabel(currentKey)} (this month)</h2>
        <PlannedList
          items={thisMonth}
          currency={currency}
          onRemove={onRemove}
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold">{monthLabel(nextKey)} (next month)</h2>
        <PlannedList
          items={nextMonth}
          currency={currency}
          onRemove={onRemove}
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Forward view</h2>
          <select
            value={monthsAhead}
            onChange={(e) => setMonthsAhead(Number(e.target.value))}
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
          >
            <option value={6}>6 months</option>
            <option value={12}>12 months</option>
            <option value={24}>24 months</option>
          </select>
        </div>
        <ul className="mt-3 space-y-3">
          {forecast.map((m) => (
            <li
              key={m.monthKey}
              className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm"
            >
              <div className="flex justify-between font-medium">
                <span>
                  {m.label}
                  {m.isFuture && (
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      forecast
                    </span>
                  )}
                </span>
                <span>{formatMoney(currency, m.projectedSpend)}</span>
              </div>
              {m.projectedIncome > 0 && (
                <p
                  className={`mt-1 text-xs ${
                    m.projectedIncome - m.projectedSpend >= 0
                      ? 'text-emerald-700'
                      : 'text-red-600'
                  }`}
                >
                  After income:{' '}
                  {formatMoney(
                    currency,
                    m.projectedIncome - m.projectedSpend,
                  )}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function PlannedList({
  items,
  currency,
  onRemove,
}: {
  items: AppData['expenses']
  currency: string
  onRemove: (id: string) => void
}) {
  if (items.length === 0) {
    return <p className="mt-2 text-sm text-slate-500">Nothing planned yet.</p>
  }
  return (
    <ul className="mt-2 divide-y divide-slate-100">
      {items.map((e) => (
        <li key={e.id} className="flex justify-between py-2 text-sm">
          <span>
            {e.category} · {e.note || e.date}
            {e.paymentMethod === 'credit' && (
              <span className="ml-1 text-indigo-600">card</span>
            )}
          </span>
          <span className="flex gap-2">
            {formatMoney(currency, e.amount)}
            <button
              type="button"
              onClick={() => onRemove(e.id)}
              className="text-slate-400 hover:text-red-600"
            >
              ✕
            </button>
          </span>
        </li>
      ))}
    </ul>
  )
}
