import { addMonths, monthKey, monthLabel } from './dates'
import {
  CATEGORIES,
  type AppData,
  type Category,
  type Expense,
  type MonthForecast,
  type MonthLogRow,
} from '../types'

function emptyByCategory(): Record<Category, number> {
  return CATEGORIES.reduce(
    (acc, c) => {
      acc[c] = 0
      return acc
    },
    {} as Record<Category, number>,
  )
}

function isActual(e: Expense): boolean {
  return e.kind !== 'planned'
}

type SpendFilter = {
  paymentMethod?: Expense['paymentMethod']
  kind?: 'actual' | 'planned' | 'all'
}

export function spendInMonth(
  data: AppData,
  key: string,
  filter?: SpendFilter,
): { total: number; byCategory: Record<Category, number> } {
  const byCategory = emptyByCategory()
  let total = 0
  for (const e of data.expenses) {
    const kindFilter = filter?.kind ?? 'actual'
    if (kindFilter === 'actual' && !isActual(e)) continue
    if (kindFilter === 'planned' && e.kind !== 'planned') continue
    if (filter?.paymentMethod && e.paymentMethod !== filter.paymentMethod) continue

    if (e.recurrence === 'once' && e.date.slice(0, 7) === key) {
      byCategory[e.category] += e.amount
      total += e.amount
    }
  }
  return { total, byCategory }
}

function recurringForMonth(
  data: AppData,
  key: string,
  filter?: { paymentMethod?: Expense['paymentMethod']; actualOnly?: boolean },
): Record<Category, number> {
  const byCategory = emptyByCategory()
  for (const e of data.expenses) {
    if (filter?.actualOnly && !isActual(e)) continue
    if (e.recurrence !== 'monthly') continue
    if (filter?.paymentMethod && e.paymentMethod !== filter.paymentMethod) continue
    const start = e.date.slice(0, 7)
    if (key >= start) {
      byCategory[e.category] += e.amount
    }
  }
  return byCategory
}

function fixedOutgoingTotal(data: AppData): number {
  return data.fixedOutgoings.reduce((s, o) => s + o.amount, 0)
}

export function budgetTotal(data: AppData): number {
  return CATEGORIES.reduce(
    (sum, c) => sum + (data.settings.categoryBudgets[c] ?? 0),
    0,
  )
}

export function expectedMonthlyOutgoing(data: AppData): number {
  const budget = budgetTotal(data)
  const fixed = fixedOutgoingTotal(data)
  return budget > 0 ? budget : fixed
}

function averageOneTimeByCategory(
  data: AppData,
  fromKey: string,
  months: number,
): Record<Category, number> {
  const sums = emptyByCategory()
  for (let i = 0; i < months; i++) {
    const key = addMonths(fromKey, -i)
    const { byCategory } = spendInMonth(data, key, { kind: 'actual' })
    for (const c of CATEGORIES) sums[c] += byCategory[c]
  }
  const avg = emptyByCategory()
  for (const c of CATEGORIES) avg[c] = sums[c] / months
  return avg
}

export function forecastMonths(
  data: AppData,
  start: Date,
  count: number,
): MonthForecast[] {
  const startKey = monthKey(start)
  const hasBudget = budgetTotal(data) > 0
  const hasFixed = fixedOutgoingTotal(data) > 0
  const avgVariable = averageOneTimeByCategory(data, startKey, 3)

  const results: MonthForecast[] = []
  let runningBalance = 0

  for (let i = 0; i < count; i++) {
    const key = addMonths(startKey, i)
    const isFuture = key > startKey

    const actual = !isFuture
      ? spendInMonth(data, key, { kind: 'actual' })
      : null
    const recurring = recurringForMonth(data, key, { actualOnly: true })
    const plannedOnce = isFuture
      ? spendInMonth(data, key, { kind: 'planned' })
      : null

    const byCategory = emptyByCategory()
    for (const c of CATEGORIES) {
      if (actual) {
        byCategory[c] = actual.byCategory[c] + recurring[c]
      } else if (hasBudget) {
        byCategory[c] =
          (data.settings.categoryBudgets[c] ?? 0) + recurring[c]
      } else if (hasFixed) {
        const fixedCat = data.fixedOutgoings
          .filter((o) => o.category === c)
          .reduce((s, o) => s + o.amount, 0)
        byCategory[c] = fixedCat + recurring[c]
      } else {
        byCategory[c] = avgVariable[c] + recurring[c]
      }
      if (plannedOnce) {
        byCategory[c] += plannedOnce.byCategory[c]
      }
    }

    let projectedSpend = CATEGORIES.reduce((s, c) => s + byCategory[c], 0)
    if (isFuture) {
      for (const e of data.expenses) {
        if (e.kind === 'planned' && e.recurrence === 'monthly') {
          const start = e.date.slice(0, 7)
          if (key >= start) projectedSpend += e.amount
        }
      }
    }

    const projectedIncome = data.settings.monthlyIncome
    runningBalance += projectedIncome - projectedSpend

    results.push({
      monthKey: key,
      label: monthLabel(key),
      projectedSpend,
      projectedIncome,
      projectedBalance: runningBalance,
      byCategory,
      isFuture,
    })
  }

  return results
}

export function monthTotals(
  data: AppData,
  key: string,
): {
  cash: number
  credit: number
  planned: number
  byCategory: Record<Category, number>
} {
  const cashOnce = spendInMonth(data, key, {
    kind: 'actual',
    paymentMethod: 'cash',
  })
  const creditOnce = spendInMonth(data, key, {
    kind: 'actual',
    paymentMethod: 'credit',
  })
  const planned = spendInMonth(data, key, { kind: 'planned' })
  const cashRec = recurringForMonth(data, key, {
    paymentMethod: 'cash',
    actualOnly: true,
  })
  const creditRec = recurringForMonth(data, key, {
    paymentMethod: 'credit',
    actualOnly: true,
  })

  let cash = cashOnce.total
  let credit = creditOnce.total
  const byCategory = emptyByCategory()
  for (const c of CATEGORIES) {
    cash += cashRec[c]
    credit += creditRec[c]
    byCategory[c] =
      cashOnce.byCategory[c] +
      creditOnce.byCategory[c] +
      cashRec[c] +
      creditRec[c] +
      planned.byCategory[c]
  }
  let plannedTotal = planned.total
  for (const e of data.expenses) {
    if (e.kind === 'planned' && e.recurrence === 'monthly') {
      const start = e.date.slice(0, 7)
      if (key >= start) plannedTotal += e.amount
    }
  }

  return { cash, credit, planned: plannedTotal, byCategory }
}

export function collectMonthKeys(
  data: AppData,
  now: Date,
  futureMonths: number,
): string[] {
  const current = monthKey(now)
  const keys = new Set<string>()
  keys.add(current)
  for (let i = 0; i < futureMonths; i++) {
    keys.add(addMonths(current, i))
  }
  for (const e of data.expenses) {
    keys.add(e.date.slice(0, 7))
  }
  for (const e of data.expenses) {
    if (e.recurrence === 'monthly') {
      keys.add(e.date.slice(0, 7))
      keys.add(current)
    }
  }
  return [...keys].sort()
}

export function buildMonthLog(
  data: AppData,
  now: Date,
  futureMonths: number,
): MonthLogRow[] {
  const keys = collectMonthKeys(data, now, futureMonths)
  const budget = budgetTotal(data)
  const fixed = fixedOutgoingTotal(data)
  const expected = budget > 0 ? budget : fixed
  const income = data.settings.monthlyIncome

  return keys.map((key) => {
    const { cash, credit, planned } = monthTotals(data, key)
    const actualTotal = cash + credit
    const surplus = income - actualTotal
    return {
      monthKey: key,
      label: monthLabel(key),
      income,
      actualCash: cash,
      actualCredit: credit,
      actualTotal,
      planned,
      fixedOutgoing: fixed,
      budgetOutgoing: budget,
      expectedOutgoing: expected + planned,
      surplus,
    }
  })
}

export function currentMonthSummary(data: AppData, now: Date) {
  const key = monthKey(now)
  const { cash, credit, planned, byCategory } = monthTotals(data, key)
  const spent = cash + credit
  const budget = budgetTotal(data)
  const income = data.settings.monthlyIncome

  return {
    monthKey: key,
    label: monthLabel(key),
    spent,
    cash,
    credit,
    planned,
    byCategory,
    budget,
    income,
    remaining: income > 0 ? income - spent : budget > 0 ? budget - spent : null,
  }
}
