import { useMemo, useState } from 'react'
import { monthKey, monthLabel, todayISO } from '../lib/dates'
import { adjacentMonth } from '../lib/ledger'
import { formatMoney } from '../lib/format'
import type { AppData } from '../types'

type Props = {
  data: AppData
  now: Date
  onAddForDate: (isoDate: string) => void
  onAddMoneyForDate: (isoDate: string) => void
}

function daysInMonth(key: string): number {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

function startWeekday(key: string): number {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).getDay()
}

export function CalendarPage({
  data,
  now,
  onAddForDate,
  onAddMoneyForDate,
}: Props) {
  const [viewKey, setViewKey] = useState(() => monthKey(now))
  const [picked, setPicked] = useState<string | null>(null)
  const { currency } = data.settings

  const dayMap = useMemo(() => {
    const map = new Map<string, { in: number; out: number }>()
    for (const m of data.moneyIns) {
      if (m.date.slice(0, 7) !== viewKey) continue
      const d = m.date
      const cur = map.get(d) ?? { in: 0, out: 0 }
      cur.in += m.amount
      map.set(d, cur)
    }
    for (const e of data.expenses) {
      if (e.kind !== 'actual') continue
      if (e.recurrence === 'once' && e.date.slice(0, 7) === viewKey) {
        const cur = map.get(e.date) ?? { in: 0, out: 0 }
        cur.out += e.amount
        map.set(e.date, cur)
      }
    }
    return map
  }, [data, viewKey])

  const pickedEntries = useMemo(() => {
    if (!picked) return { ins: [], outs: [] }
    const ins = data.moneyIns.filter((m) => m.date === picked)
    const outs = data.expenses.filter(
      (e) => e.kind === 'actual' && e.recurrence === 'once' && e.date === picked,
    )
    return { ins, outs }
  }, [data, picked])

  const totalDays = daysInMonth(viewKey)
  const pad = startWeekday(viewKey)
  const cells: (number | null)[] = [
    ...Array.from({ length: pad }, () => null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <button
          type="button"
          onClick={() => setViewKey(adjacentMonth(viewKey, -1))}
          className="rounded-lg px-3 py-1 text-sm font-medium text-slate-600"
        >
          ←
        </button>
        <h2 className="font-semibold">{monthLabel(viewKey)}</h2>
        <button
          type="button"
          onClick={() => setViewKey(adjacentMonth(viewKey, 1))}
          className="rounded-lg px-3 py-1 text-sm font-medium text-slate-600"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-slate-500">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`e-${i}`} className="aspect-square" />
          }
          const iso = `${viewKey}-${String(day).padStart(2, '0')}`
          const totals = dayMap.get(iso)
          const isToday = iso === todayISO(now)
          const isPicked = iso === picked
          return (
            <button
              key={iso}
              type="button"
              onClick={() => setPicked(iso)}
              className={`aspect-square rounded-xl border p-0.5 text-left text-[10px] ${
                isPicked
                  ? 'border-emerald-500 bg-emerald-50'
                  : isToday
                    ? 'border-sky-400 bg-sky-50'
                    : 'border-slate-100 bg-white'
              }`}
            >
              <span className="font-semibold text-slate-800">{day}</span>
              {totals?.in ? (
                <span className="block text-emerald-700">◈</span>
              ) : null}
              {totals?.out ? (
                <span className="block text-amber-800">▷</span>
              ) : null}
            </button>
          )
        })}
      </div>

      {picked && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="font-semibold">{picked}</h3>
          {pickedEntries.ins.length === 0 && pickedEntries.outs.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No entries this day.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {pickedEntries.ins.map((m) => (
                <li key={m.id} className="text-emerald-800">
                  ◈ ADD {formatMoney(currency, m.amount)} — {m.source}
                </li>
              ))}
              {pickedEntries.outs.map((e) => (
                <li key={e.id} className="text-amber-900">
                  ▷ PAY {formatMoney(currency, e.amount)} — {e.category}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => onAddMoneyForDate(picked)}
              className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white"
            >
              ADD ◈ money
            </button>
            <button
              type="button"
              onClick={() => onAddForDate(picked)}
              className="flex-1 rounded-xl bg-amber-600 py-2 text-xs font-semibold text-white"
            >
              PAY ▷ expense
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
