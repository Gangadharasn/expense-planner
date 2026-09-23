import type { AppData, AppSettings, Expense, MoneyIn } from '../types'

export const STORAGE_KEY = 'expense-planner-v3'

const defaultSettings: AppSettings = {
  currency: '₹',
  monthlyIncome: 0,
  categoryBudgets: {},
  creditCardLimit: 0,
}

function normalizeExpense(raw: Partial<Expense>): Expense {
  return {
    id: raw.id ?? crypto.randomUUID(),
    amount: Number(raw.amount) || 0,
    category: (raw.category as Expense['category']) ?? 'Other',
    date: raw.date ?? new Date().toISOString().slice(0, 10),
    note: raw.note ?? '',
    recurrence: raw.recurrence === 'monthly' ? 'monthly' : 'once',
    paymentMethod: raw.paymentMethod === 'credit' ? 'credit' : 'cash',
    kind: raw.kind === 'planned' ? 'planned' : 'actual',
  }
}

function normalizeMoneyIn(raw: Partial<MoneyIn>): MoneyIn {
  return {
    id: raw.id ?? crypto.randomUUID(),
    amount: Number(raw.amount) || 0,
    date: raw.date ?? new Date().toISOString().slice(0, 10),
    note: raw.note ?? '',
    source: raw.source ?? 'Other',
  }
}

function migrateV2(): AppData | null {
  try {
    const raw = localStorage.getItem('expense-planner-v2')
    if (!raw) return null
    const parsed = JSON.parse(raw) as AppData
    const data: AppData = {
      expenses: (parsed.expenses ?? []).map(normalizeExpense),
      moneyIns: [],
      fixedOutgoings: Array.isArray(parsed.fixedOutgoings)
        ? parsed.fixedOutgoings
        : [],
      stickyNotes: Array.isArray(parsed.stickyNotes) ? parsed.stickyNotes : [],
      settings: { ...defaultSettings, ...parsed.settings },
    }
    return data
  } catch {
    return null
  }
}

export function defaultAppData(): AppData {
  return {
    expenses: [],
    moneyIns: [],
    fixedOutgoings: [],
    stickyNotes: [],
    settings: { ...defaultSettings },
  }
}

function migrateV1(): AppData | null {
  try {
    const raw = localStorage.getItem('expense-planner-v1')
    if (!raw) return null
    const parsed = JSON.parse(raw) as {
      expenses?: Partial<Expense>[]
      settings?: Partial<AppSettings>
    }
    const data: AppData = {
      expenses: (parsed.expenses ?? []).map(normalizeExpense),
      moneyIns: [],
      fixedOutgoings: [],
      stickyNotes: [],
      settings: { ...defaultSettings, ...parsed.settings },
    }
    localStorage.removeItem('expense-planner-v1')
    return data
  } catch {
    return null
  }
}

export function loadAppData(): AppData {
  try {
    const migratedV1 = migrateV1()
    if (migratedV1) {
      saveAppData(migratedV1)
      return migratedV1
    }
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const migratedV2 = migrateV2()
      if (migratedV2) {
        saveAppData(migratedV2)
        return migratedV2
      }
      return defaultAppData()
    }
    const parsed = JSON.parse(raw) as AppData
    return {
      expenses: Array.isArray(parsed.expenses)
        ? parsed.expenses.map(normalizeExpense)
        : [],
      moneyIns: Array.isArray(parsed.moneyIns)
        ? parsed.moneyIns.map(normalizeMoneyIn)
        : [],
      fixedOutgoings: Array.isArray(parsed.fixedOutgoings)
        ? parsed.fixedOutgoings
        : [],
      stickyNotes: Array.isArray(parsed.stickyNotes) ? parsed.stickyNotes : [],
      settings: { ...defaultSettings, ...parsed.settings },
    }
  } catch {
    return defaultAppData()
  }
}

export function saveAppData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function exportAppDataJson(data: AppData): string {
  return JSON.stringify(data, null, 2)
}

export function importAppDataJson(json: string): AppData {
  const parsed = JSON.parse(json) as AppData
  return {
    expenses: (parsed.expenses ?? []).map(normalizeExpense),
    moneyIns: Array.isArray(parsed.moneyIns)
      ? parsed.moneyIns.map(normalizeMoneyIn)
      : [],
    fixedOutgoings: Array.isArray(parsed.fixedOutgoings)
      ? parsed.fixedOutgoings
      : [],
    stickyNotes: Array.isArray(parsed.stickyNotes) ? parsed.stickyNotes : [],
    settings: { ...defaultSettings, ...parsed.settings },
  }
}
