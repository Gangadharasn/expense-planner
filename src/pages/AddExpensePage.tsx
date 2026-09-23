import { useState } from 'react'
import { todayISO } from '../lib/dates'
import { resolvePlanDate } from '../lib/planDates'
import { newId } from '../lib/format'
import { HelpBox } from '../components/HelpBox'
import {
  CATEGORIES,
  type AppData,
  type Category,
  type Expense,
  type ExpenseKind,
  type PaymentMethod,
  type PlanMonth,
  type Recurrence,
} from '../types'

export type AddExpenseDefaults = {
  kind?: ExpenseKind
  paymentMethod?: PaymentMethod
}

type Props = {
  data: AppData
  now: Date
  defaults: AddExpenseDefaults
  onSaved: () => void
  setData: (fn: (d: AppData) => AppData) => void
}

export function AddExpensePage({
  now,
  defaults,
  onSaved,
  setData,
}: Props) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Category>('Food')
  const [date, setDate] = useState(() => todayISO(now))
  const [note, setNote] = useState('')
  const [recurrence, setRecurrence] = useState<Recurrence>('once')
  const [kind, setKind] = useState<ExpenseKind>(defaults.kind ?? 'actual')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    defaults.paymentMethod ?? 'cash',
  )
  const [planMonth, setPlanMonth] = useState<PlanMonth>(
    defaults.kind === 'planned' ? 'this' : 'pick',
  )

  function save() {
    const value = Number(amount)
    if (!value || value <= 0) return
    const resolvedDate =
      kind === 'planned' && recurrence === 'once'
        ? resolvePlanDate(planMonth, date, now)
        : date
    const expense: Expense = {
      id: newId(),
      amount: value,
      category,
      date: resolvedDate,
      note: note.trim(),
      recurrence,
      paymentMethod,
      kind,
    }
    setData((d) => ({ ...d, expenses: [expense, ...d.expenses] }))
    onSaved()
  }

  return (
    <div className="space-y-4">
      <HelpBox title="Spent vs planned">
        <p>
          <strong>Spent</strong> = you already paid. <strong>Planned</strong> =
          reminder for this or next month (not counted as paid yet).
        </p>
      </HelpBox>
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">
        {kind === 'planned' ? 'Plan a future cost' : 'Record a payment'}
      </h2>

      <div className="flex gap-2">
        {(['actual', 'planned'] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={`flex-1 rounded-xl border py-2 text-sm font-medium ${
              kind === k
                ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 text-slate-600'
            }`}
          >
            {k === 'actual' ? 'Spent (actual)' : 'Planned'}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {(['cash', 'credit'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPaymentMethod(p)}
            className={`flex-1 rounded-xl border py-2 text-sm font-medium ${
              paymentMethod === p
                ? p === 'credit'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-800'
                  : 'border-emerald-600 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 text-slate-600'
            }`}
          >
            {p === 'cash' ? 'Cash / UPI' : 'Credit card'}
          </button>
        ))}
      </div>

      <label className="block">
        <span className="text-sm text-slate-600">Amount</span>
        <input
          type="number"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-lg font-semibold outline-none ring-emerald-500 focus:ring-2"
        />
      </label>

      <label className="block">
        <span className="text-sm text-slate-600">Category</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>

      {kind === 'planned' && recurrence === 'once' ? (
        <fieldset className="space-y-2">
          <span className="text-sm text-slate-600">Plan for</span>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['this', 'This month'],
                ['next', 'Next month'],
                ['pick', 'Pick date'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPlanMonth(value)}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  planMonth === value
                    ? 'border-amber-500 bg-amber-50 text-amber-900'
                    : 'border-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      {(kind !== 'planned' || planMonth === 'pick' || recurrence === 'monthly') && (
        <label className="block">
          <span className="text-sm text-slate-600">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
          />
        </label>
      )}

      <label className="block">
        <span className="text-sm text-slate-600">Note</span>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
          placeholder="optional"
        />
      </label>

      <fieldset className="space-y-2">
        <span className="text-sm text-slate-600">Repeat</span>
        <div className="flex gap-2">
          {(['once', 'monthly'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRecurrence(value)}
              className={`flex-1 rounded-xl border py-2 text-sm ${
                recurrence === value
                  ? 'border-emerald-600 bg-emerald-50'
                  : 'border-slate-200'
              }`}
            >
              {value === 'once' ? 'One time' : 'Every month'}
            </button>
          ))}
        </div>
      </fieldset>

      <button
        type="button"
        onClick={save}
        className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white"
      >
        Save
      </button>
      </div>
    </div>
  )
}
