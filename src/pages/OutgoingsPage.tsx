import { useMemo, useState } from 'react'
import { BarChart } from '../components/BarChart'
import { buildMonthLog, budgetTotal } from '../lib/forecast'
import { formatMoney, newId } from '../lib/format'
import { CATEGORIES, type AppData, type Category, type FixedOutgoing } from '../types'

type Props = {
  data: AppData
  now: Date
  setData: (fn: (d: AppData) => AppData) => void
}

export function OutgoingsPage({ data, now, setData }: Props) {
  const [horizon, setHorizon] = useState(12)
  const [outName, setOutName] = useState('')
  const [outAmount, setOutAmount] = useState('')
  const [outCat, setOutCat] = useState<Category>('Bills')

  const log = useMemo(
    () => buildMonthLog(data, now, horizon),
    [data, now, horizon],
  )
  const { currency } = data.settings

  const chartLabels = log.map((r) => r.label)
  const chartValues = log.map((r) => r.actualTotal)

  function addFixedOutgoing() {
    const amount = Number(outAmount)
    if (!outName.trim() || !amount) return
    const item: FixedOutgoing = {
      id: newId(),
      name: outName.trim(),
      category: outCat,
      amount,
    }
    setData((d) => ({
      ...d,
      fixedOutgoings: [...d.fixedOutgoings, item],
    }))
    setOutName('')
    setOutAmount('')
  }

  function removeFixed(id: string) {
    setData((d) => ({
      ...d,
      fixedOutgoings: d.fixedOutgoings.filter((o) => o.id !== id),
    }))
  }

  function setCategoryBudget(cat: Category, value: string) {
    const num = value === '' ? undefined : Number(value)
    setData((d) => ({
      ...d,
      settings: {
        ...d.settings,
        categoryBudgets: {
          ...d.settings.categoryBudgets,
          [cat]: num,
        },
      },
    }))
  }

  const budget = budgetTotal(data)
  const fixedSum = data.fixedOutgoings.reduce((s, o) => s + o.amount, 0)

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Set what you expect to spend each month. The life log below keeps every
        month you have recorded — not only 2–3 months.
      </p>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Fixed monthly outgoings</h2>
        <p className="mt-1 text-sm text-slate-500">
          Rent, EMI, subscriptions — repeat every month.
        </p>
        <ul className="mt-3 space-y-2">
          {data.fixedOutgoings.map((o) => (
            <li
              key={o.id}
              className="flex items-center justify-between text-sm"
            >
              <span>
                {o.name}{' '}
                <span className="text-slate-400">({o.category})</span>
              </span>
              <span className="flex items-center gap-2">
                {formatMoney(currency, o.amount)}
                <button
                  type="button"
                  onClick={() => removeFixed(o.id)}
                  className="text-slate-400 hover:text-red-600"
                >
                  ✕
                </button>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 grid gap-2">
          <input
            type="text"
            placeholder="Name e.g. Rent"
            value={outName}
            onChange={(e) => setOutName(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <select
              value={outCat}
              onChange={(e) => setOutCat(e.target.value as Category)}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Amount"
              value={outAmount}
              onChange={(e) => setOutAmount(e.target.value)}
              className="w-28 rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={addFixedOutgoing}
            className="rounded-xl bg-slate-800 py-2 text-sm font-medium text-white"
          >
            Add outgoing
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Fixed total: {formatMoney(currency, fixedSum)}
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Category budgets (optional)</h2>
        <p className="mt-1 text-sm text-slate-500">
          If set, these replace fixed totals for planning. Total:{' '}
          {formatMoney(currency, budget)}
        </p>
        <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto">
          {CATEGORIES.map((cat) => (
            <li key={cat} className="flex items-center justify-between gap-2">
              <span className="text-sm">{cat}</span>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={data.settings.categoryBudgets[cat] ?? ''}
                onChange={(e) => setCategoryBudget(cat, e.target.value)}
                className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-right text-sm"
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Life log chart</h2>
          <select
            value={horizon}
            onChange={(e) => setHorizon(Number(e.target.value))}
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
          >
            <option value={6}>+6 mo ahead</option>
            <option value={12}>+12 mo ahead</option>
            <option value={24}>+24 mo ahead</option>
          </select>
        </div>
        <BarChart labels={chartLabels} values={chartValues} />
        <p className="mt-2 text-xs text-slate-500">
          Bars = actual spend (cash + card) per month.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Month table</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-2">Month</th>
                <th className="py-2 pr-2">Actual</th>
                <th className="py-2 pr-2">Card</th>
                <th className="py-2 pr-2">Planned</th>
                <th className="py-2 pr-2">Expected</th>
                <th className="py-2">Left</th>
              </tr>
            </thead>
            <tbody>
              {log.map((row) => (
                <tr key={row.monthKey} className="border-b border-slate-50">
                  <td className="py-2 pr-2 font-medium">{row.label}</td>
                  <td className="py-2 pr-2">
                    {formatMoney(currency, row.actualTotal)}
                  </td>
                  <td className="py-2 pr-2 text-indigo-700">
                    {formatMoney(currency, row.actualCredit)}
                  </td>
                  <td className="py-2 pr-2 text-amber-700">
                    {formatMoney(currency, row.planned)}
                  </td>
                  <td className="py-2 pr-2">
                    {formatMoney(currency, row.expectedOutgoing)}
                  </td>
                  <td
                    className={`py-2 font-medium ${
                      row.surplus >= 0 ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {row.income > 0
                      ? formatMoney(currency, row.surplus)
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
