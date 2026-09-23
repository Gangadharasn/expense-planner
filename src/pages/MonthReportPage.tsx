import { useMemo, useState } from 'react'
import { HelpBox } from '../components/HelpBox'
import { FlowAmount, FlowBadge } from '../components/FlowBadge'
import { monthKey } from '../lib/dates'
import {
  exportMonthCsv,
  exportMonthJson,
  printMonthReport,
} from '../lib/exportMonth'
import { formatMoney } from '../lib/format'
import {
  buildPassbook,
  listMonthKeys,
  monthSummaryStats,
} from '../lib/ledger'
import { CATEGORIES, type AppData } from '../types'

type Props = {
  data: AppData
  now: Date
}

export function MonthReportPage({ data, now }: Props) {
  const months = useMemo(() => listMonthKeys(data, now), [data, now])
  const [selected, setSelected] = useState(() => monthKey(now))

  const stats = useMemo(
    () => monthSummaryStats(data, selected),
    [data, selected],
  )
  const passbook = useMemo(
    () => buildPassbook(data, selected),
    [data, selected],
  )
  const { currency } = data.settings

  return (
    <div className="space-y-4">
      <HelpBox title="Month report & passbook">
        <p>
          Choose a month — totals and categories update for that month only.
          Download CSV/JSON or print/save as PDF from your browser.
        </p>
      </HelpBox>

      <label className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <span className="text-sm font-medium text-slate-700">Select month</span>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-base font-semibold"
        >
          {months.map((k) => (
            <option key={k} value={k}>
              {monthSummaryStats(data, k).label}
            </option>
          ))}
        </select>
      </label>

      <section className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-xl bg-emerald-50 p-3">
          <p className="text-xs text-emerald-800">Added ◈</p>
          <p className="font-bold text-emerald-900">
            {formatMoney(currency, stats.totalIn)}
          </p>
        </div>
        <div className="rounded-xl bg-amber-50 p-3">
          <p className="text-xs text-amber-900">Paid ▷</p>
          <p className="font-bold text-amber-950">
            {formatMoney(currency, stats.totalOut)}
          </p>
        </div>
        <div className="rounded-xl bg-slate-100 p-3">
          <p className="text-xs text-slate-600">Left</p>
          <p className="font-bold text-slate-900">
            {formatMoney(currency, stats.closingBalance)}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold">Spent by category — {stats.label}</h2>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="py-2">Category</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((c) => {
              const v = stats.byCategory[c]
              if (!v) return null
              return (
                <tr key={c} className="border-b border-slate-50">
                  <td className="py-2">{c}</td>
                  <td className="py-2 text-right font-medium">
                    {formatMoney(currency, v)}
                  </td>
                </tr>
              )
            })}
            {stats.totalOut === 0 && (
              <tr>
                <td colSpan={2} className="py-4 text-center text-slate-500">
                  No payments this month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => exportMonthCsv(data, selected)}
          className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white"
        >
          Download CSV
        </button>
        <button
          type="button"
          onClick={() => exportMonthJson(data, selected)}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold"
        >
          Download JSON
        </button>
        <button
          type="button"
          onClick={() => printMonthReport(data, selected)}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Print / PDF
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold">Passbook — {stats.label}</h2>
        <p className="mt-1 text-xs text-slate-500">
          ◈ ADD = money in · ▷ PAY = bill/payment (not the same as +/− labels)
        </p>
        {passbook.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No entries this month.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {passbook.map((row) => (
              <li key={row.id} className="flex gap-2 py-3 text-sm">
                <div className="shrink-0 pt-0.5">
                  <FlowBadge flow={row.flow} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{row.title}</p>
                  <p className="text-xs text-slate-500">
                    {row.date}
                    {row.detail ? ` · ${row.detail}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <FlowAmount
                    flow={row.flow}
                    currency={currency}
                    amount={row.amount}
                  />
                  <p className="text-xs text-slate-400">
                    Bal {formatMoney(currency, row.balanceAfter)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
