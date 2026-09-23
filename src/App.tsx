import { useEffect, useMemo, useState } from 'react'
import { HelpBox } from './components/HelpBox'
import { PinGate, lockApp } from './components/PinGate'
import { useToday } from './hooks/useToday'
import { isSessionUnlocked } from './lib/auth'
import { formatFullDate, formatMonthYear } from './lib/dates'
import { currentMonthSummary } from './lib/forecast'
import { formatMoney } from './lib/format'
import { loadAppData, saveAppData } from './lib/storage'
import { CATEGORIES } from './types'
import type { AppData } from './types'
import {
  AddExpensePage,
  type AddExpenseDefaults,
} from './pages/AddExpensePage'
import { CreditPage } from './pages/CreditPage'
import { DataPage } from './pages/DataPage'
import { NotesPage } from './pages/NotesPage'
import { OutgoingsPage } from './pages/OutgoingsPage'
import { PlanPage } from './pages/PlanPage'

type Tab = 'home' | 'add' | 'outgoings' | 'plan' | 'credit' | 'notes' | 'data'

const TAB_HINTS: Record<Tab, string> = {
  home: 'Summary for the current calendar month on your device.',
  add: 'Record money you already spent, or plan a future payment.',
  outgoings: 'Fixed bills and charts for every month you track.',
  plan: 'See planned costs for this month, next month, and ahead.',
  credit: 'Only credit card spending — separate from cash/UPI.',
  notes: 'Free-form sticky notes (not counted as expenses).',
  data: 'Backup, income, and where data is stored.',
}

function App() {
  const [unlocked, setUnlocked] = useState(() => isSessionUnlocked())
  const [data, setData] = useState<AppData>(() => loadAppData())
  const [tab, setTab] = useState<Tab>('home')
  const [addDefaults, setAddDefaults] = useState<AddExpenseDefaults>({})

  const now = useToday()

  useEffect(() => {
    saveAppData(data)
  }, [data])

  const summary = useMemo(() => currentMonthSummary(data, now), [data, now])
  const recent = data.expenses.filter((e) => e.kind === 'actual').slice(0, 8)
  const { currency } = data.settings

  function updateSettings(partial: Partial<AppData['settings']>) {
    setData((d) => ({
      ...d,
      settings: { ...d.settings, ...partial },
    }))
  }

  function removeExpense(id: string) {
    setData((d) => ({
      ...d,
      expenses: d.expenses.filter((e) => e.id !== id),
    }))
  }

  function openAdd(defaults: AddExpenseDefaults = {}) {
    setAddDefaults(defaults)
    setTab('add')
  }

  const titles: Record<Tab, string> = {
    home: formatMonthYear(now),
    add: 'Add spending or plan',
    outgoings: 'Monthly bills & history',
    plan: 'Plan ahead',
    credit: 'Credit card',
    notes: 'Sticky notes',
    data: 'Settings & backup',
  }

  return (
    <PinGate unlocked={unlocked} onUnlockedChange={setUnlocked}>
      <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-slate-50 text-slate-900">
        <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
            Expense Planner
          </p>
          <h1 className="text-xl font-semibold">{titles[tab]}</h1>
          <p className="mt-1 text-sm text-slate-600">{formatFullDate(now)}</p>
          <p className="mt-0.5 text-xs text-slate-500">{TAB_HINTS[tab]}</p>
        </header>

        <main className="flex-1 px-4 py-4 pb-32">
          {tab === 'home' && (
            <div className="space-y-4">
              <HelpBox title="Quick guide">
                <p>
                  <strong>1.</strong> Tap <strong>Spend</strong> when you pay for
                  something.
                </p>
                <p>
                  <strong>2.</strong> Use <strong>Plan</strong> for costs you
                  expect this or next month.
                </p>
                <p>
                  <strong>3.</strong> Card purchases go under{' '}
                  <strong>Credit</strong>.
                </p>
                <p>
                  Month name above changes automatically with today&apos;s date.
                </p>
              </HelpBox>

              <section className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white shadow-lg">
                <p className="text-sm text-emerald-100">
                  Total spent in {formatMonthYear(now)} (real payments)
                </p>
                <p className="mt-1 text-3xl font-bold">
                  {formatMoney(currency, summary.spent)}
                </p>
                <p className="mt-2 text-sm text-emerald-100">
                  Cash / UPI: {formatMoney(currency, summary.cash)} · Credit
                  card: {formatMoney(currency, summary.credit)}
                </p>
                {summary.planned > 0 && (
                  <p className="mt-2 text-sm text-amber-100">
                    Still only planned (not paid):{' '}
                    {formatMoney(currency, summary.planned)}
                  </p>
                )}
                {summary.income > 0 && summary.remaining !== null && (
                  <p className="mt-2 text-sm text-emerald-100">
                    Money left after income:{' '}
                    <span className="font-semibold text-white">
                      {formatMoney(currency, Math.max(0, summary.remaining))}
                    </span>
                  </p>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold">Spending by category</h2>
                <ul className="mt-3 space-y-2">
                  {CATEGORIES.map((cat) => {
                    const spent = summary.byCategory[cat]
                    if (spent === 0) return null
                    return (
                      <li
                        key={cat}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-slate-600">{cat}</span>
                        <span className="font-medium">
                          {formatMoney(currency, spent)}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex justify-between">
                  <h2 className="text-sm font-semibold">Latest payments</h2>
                  <button
                    type="button"
                    onClick={() => openAdd()}
                    className="text-sm font-medium text-emerald-700"
                  >
                    + Add
                  </button>
                </div>
                {recent.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">
                    No payments logged yet. Tap Spend below to add one.
                  </p>
                ) : (
                  <ul className="mt-3 divide-y divide-slate-100">
                    {recent.map((e) => (
                      <li
                        key={e.id}
                        className="flex justify-between py-3 text-sm"
                      >
                        <span>
                          {e.category}
                          {e.paymentMethod === 'credit' && (
                            <span className="ml-1 text-indigo-600">(card)</span>
                          )}
                        </span>
                        <span className="flex gap-2">
                          {formatMoney(currency, e.amount)}
                          <button
                            type="button"
                            onClick={() => removeExpense(e.id)}
                            className="text-slate-400 hover:text-red-600"
                          >
                            ✕
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )}

          {tab === 'add' && (
            <AddExpensePage
              data={data}
              now={now}
              defaults={addDefaults}
              setData={setData}
              onSaved={() => setTab('home')}
            />
          )}

          {tab === 'outgoings' && (
            <OutgoingsPage data={data} now={now} setData={setData} />
          )}

          {tab === 'plan' && (
            <PlanPage
              data={data}
              now={now}
              onAddPlanned={() => openAdd({ kind: 'planned' })}
              onRemove={removeExpense}
            />
          )}

          {tab === 'credit' && (
            <CreditPage
              data={data}
              now={now}
              onAddCredit={() =>
                openAdd({ paymentMethod: 'credit', kind: 'actual' })
              }
              onRemove={removeExpense}
            />
          )}

          {tab === 'notes' && <NotesPage data={data} setData={setData} />}

          {tab === 'data' && (
            <DataPage
              data={data}
              setData={setData}
              updateSettings={updateSettings}
              onLock={() => lockApp(() => setUnlocked(false))}
            />
          )}
        </main>

        <nav
          className="fixed bottom-0 left-0 right-0 mx-auto max-w-lg border-t border-slate-200 bg-white px-1 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
          aria-label="Main"
        >
          <div className="flex gap-0.5 overflow-x-auto pb-1">
            {(
              [
                ['home', 'Today'],
                ['add', 'Spend'],
                ['outgoings', 'Bills'],
                ['plan', 'Plan'],
                ['credit', 'Credit'],
                ['notes', 'Notes'],
                ['data', 'Settings'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`min-w-[3.25rem] shrink-0 rounded-lg px-1.5 py-2 text-[10px] font-medium leading-tight ${
                  tab === id
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'text-slate-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </PinGate>
  )
}

export default App
