import { addMonths, monthKey, monthLabel } from './dates'
import { recurringForMonth, spendInMonth } from './forecast'
import { CATEGORIES, type AppData, type Category, type PassbookLine } from '../types'

export function listMonthKeys(data: AppData, now: Date): string[] {
  const keys = new Set<string>()
  keys.add(monthKey(now))
  for (const e of data.expenses) keys.add(e.date.slice(0, 7))
  for (const m of data.moneyIns) keys.add(m.date.slice(0, 7))
  return [...keys].sort().reverse()
}

function actualByCategory(
  data: AppData,
  key: string,
): Record<Category, number> {
  const once = spendInMonth(data, key, { kind: 'actual' })
  const cashRec = recurringForMonth(data, key, {
    paymentMethod: 'cash',
    actualOnly: true,
  })
  const creditRec = recurringForMonth(data, key, {
    paymentMethod: 'credit',
    actualOnly: true,
  })
  const byCategory = {} as Record<Category, number>
  for (const c of CATEGORIES) {
    byCategory[c] =
      once.byCategory[c] + cashRec[c] + creditRec[c]
  }
  return byCategory
}

export function categorySpendForMonth(
  data: AppData,
  key: string,
): { byCategory: Record<Category, number>; totalOut: number } {
  const byCategory = actualByCategory(data, key)
  let totalOut = 0
  for (const c of CATEGORIES) totalOut += byCategory[c]
  return { byCategory, totalOut }
}

export function moneyInForMonth(data: AppData, key: string): number {
  let sum = 0
  for (const m of data.moneyIns) {
    if (m.date.slice(0, 7) === key) sum += m.amount
  }
  return sum
}

type RawLine = Omit<PassbookLine, 'balanceAfter'>

function expenseLinesForMonth(data: AppData, key: string): RawLine[] {
  const lines: RawLine[] = []
  for (const e of data.expenses) {
    if (!isActualExpense(e)) continue
    if (e.recurrence === 'once' && e.date.slice(0, 7) === key) {
      lines.push({
        id: e.id,
        date: e.date,
        title: e.category,
        flow: 'out',
        amount: e.amount,
        detail: [e.note, e.paymentMethod === 'credit' ? 'card' : 'cash']
          .filter(Boolean)
          .join(' · '),
      })
    }
    if (e.recurrence === 'monthly' && key >= e.date.slice(0, 7)) {
      lines.push({
        id: `${e.id}-${key}`,
        date: `${key}-01`,
        title: `${e.category} (monthly)`,
        flow: 'out',
        amount: e.amount,
        detail: e.note,
      })
    }
  }
  return lines
}

function isActualExpense(e: AppData['expenses'][number]): boolean {
  return e.kind !== 'planned'
}

export function buildPassbook(
  data: AppData,
  filterMonthKey?: string,
): PassbookLine[] {
  const raw: RawLine[] = []

  for (const m of data.moneyIns) {
    if (filterMonthKey && m.date.slice(0, 7) !== filterMonthKey) continue
    raw.push({
      id: m.id,
      date: m.date,
      title: m.source || 'Money added',
      flow: 'in',
      amount: m.amount,
      detail: m.note,
    })
  }

  if (filterMonthKey) {
    raw.push(...expenseLinesForMonth(data, filterMonthKey))
  } else {
    const keys = new Set<string>()
    for (const e of data.expenses) {
      if (isActualExpense(e)) keys.add(e.date.slice(0, 7))
    }
    for (const k of [...keys].sort()) {
      raw.push(...expenseLinesForMonth(data, k))
    }
  }

  raw.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title))

  let balance = 0
  return raw.map((line) => {
    balance += line.flow === 'in' ? line.amount : -line.amount
    return { ...line, balanceAfter: balance }
  })
}

export function monthSummaryStats(data: AppData, key: string) {
  const totalIn = moneyInForMonth(data, key)
  const { totalOut, byCategory } = categorySpendForMonth(data, key)
  return {
    monthKey: key,
    label: monthLabel(key),
    totalIn,
    totalOut,
    byCategory,
    closingBalance: totalIn - totalOut,
  }
}

export function ensureMonthInList(keys: string[], key: string): string[] {
  if (keys.includes(key)) return keys
  return [key, ...keys].sort().reverse()
}

export function adjacentMonth(key: string, delta: number): string {
  return addMonths(key, delta)
}
