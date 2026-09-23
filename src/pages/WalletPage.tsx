import { useEffect, useState } from 'react'
import { HelpBox } from '../components/HelpBox'
import { FlowAmount, FlowBadge } from '../components/FlowBadge'
import { todayISO } from '../lib/dates'
import { newId } from '../lib/format'
import type { AppData, MoneyIn } from '../types'

const SOURCES = ['Salary', 'Business', 'Gift', 'Refund', 'Cash deposit', 'Other']

type Props = {
  data: AppData
  now: Date
  setData: (fn: (d: AppData) => AppData) => void
  initialDate?: string
}

export function WalletPage({ data, now, setData, initialDate }: Props) {
  const [amount, setAmount] = useState('')
  const [source, setSource] = useState(SOURCES[0])
  const [date, setDate] = useState(() => initialDate ?? todayISO(now))

  useEffect(() => {
    if (initialDate) setDate(initialDate)
  }, [initialDate])
  const [note, setNote] = useState('')
  const { currency } = data.settings

  const sorted = [...data.moneyIns].sort((a, b) =>
    b.date.localeCompare(a.date),
  )

  function addMoney() {
    const value = Number(amount)
    if (!value || value <= 0) return
    const entry: MoneyIn = {
      id: newId(),
      amount: value,
      date,
      source,
      note: note.trim(),
    }
    setData((d) => ({ ...d, moneyIns: [entry, ...d.moneyIns] }))
    setAmount('')
    setNote('')
    setDate(todayISO(now))
  }

  function remove(id: string) {
    setData((d) => ({
      ...d,
      moneyIns: d.moneyIns.filter((m) => m.id !== id),
    }))
  }

  return (
    <div className="space-y-4">
      <HelpBox title="Add money to wallet">
        <p>
          When you receive money, log it here with <strong>ADD ◈</strong>. It
          increases your balance. Paying bills uses <strong>PAY ▷</strong> on
          the Spend tab — that reduces balance. We do not use + or − signs in
          the app labels.
        </p>
      </HelpBox>

      <section className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-4">
        <div className="flex items-center gap-2">
          <FlowBadge flow="in" />
          <h2 className="text-lg font-semibold text-emerald-950">Add money</h2>
        </div>
        <input
          type="number"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="mt-3 w-full rounded-xl border border-emerald-200 bg-white px-3 py-3 text-xl font-bold"
        />
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="mt-2 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2"
        >
          {SOURCES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-2 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2"
        />
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)"
          className="mt-2 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={addMoney}
          className="mt-3 w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white"
        >
          Save — ADD ◈ to wallet
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold">Money added (history)</h2>
        {sorted.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No deposits yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {sorted.slice(0, 20).map((m) => (
              <li key={m.id} className="flex items-center gap-2 py-3">
                <FlowBadge flow="in" />
                <div className="flex-1 text-sm">
                  <p className="font-medium">{m.source}</p>
                  <p className="text-xs text-slate-500">
                    {m.date}
                    {m.note ? ` · ${m.note}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <FlowAmount flow="in" currency={currency} amount={m.amount} />
                  <button
                    type="button"
                    onClick={() => remove(m.id)}
                    className="text-slate-400 hover:text-red-600"
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
