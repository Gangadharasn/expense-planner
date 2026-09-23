import type { AppData, AppSettings, Expense } from '../types'

export const STORAGE_KEY = 'expense-planner-v2'

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

export function defaultAppData(): AppData {
  return {
    expenses: [],
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
    const migrated = migrateV1()
    if (migrated) {
      saveAppData(migrated)
      return migrated
    }
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultAppData()
    const parsed = JSON.parse(raw) as AppData
    return {
      expenses: Array.isArray(parsed.expenses)
        ? parsed.expenses.map(normalizeExpense)
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
    fixedOutgoings: Array.isArray(parsed.fixedOutgoings)
      ? parsed.fixedOutgoings
      : [],
    stickyNotes: Array.isArray(parsed.stickyNotes) ? parsed.stickyNotes : [],
    settings: { ...defaultSettings, ...parsed.settings },
  }
}
