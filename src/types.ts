export const CATEGORIES = [
  'Food',
  'Rent',
  'Transport',
  'Bills',
  'Shopping',
  'Health',
  'Entertainment',
  'Savings',
  'Other',
] as const

export type Category = (typeof CATEGORIES)[number]

export type Recurrence = 'once' | 'monthly'

export type PaymentMethod = 'cash' | 'credit'

export type ExpenseKind = 'actual' | 'planned'

/** For planned one-time items: which month they apply to. */
export type PlanMonth = 'this' | 'next' | 'pick'

export type Expense = {
  id: string
  amount: number
  category: Category
  date: string
  note: string
  recurrence: Recurrence
  paymentMethod: PaymentMethod
  kind: ExpenseKind
}

export type FixedOutgoing = {
  id: string
  name: string
  category: Category
  amount: number
}

export type AppSettings = {
  currency: string
  monthlyIncome: number
  categoryBudgets: Partial<Record<Category, number>>
  creditCardLimit: number
}

export type StickyNoteColor = 'yellow' | 'pink' | 'blue' | 'green'

export type StickyNote = {
  id: string
  title: string
  body: string
  color: StickyNoteColor
  updatedAt: string
}

export type AppData = {
  expenses: Expense[]
  fixedOutgoings: FixedOutgoing[]
  stickyNotes: StickyNote[]
  settings: AppSettings
}

export type MonthForecast = {
  monthKey: string
  label: string
  projectedSpend: number
  projectedIncome: number
  projectedBalance: number
  byCategory: Record<Category, number>
  isFuture: boolean
}

export type MonthLogRow = {
  monthKey: string
  label: string
  income: number
  actualCash: number
  actualCredit: number
  actualTotal: number
  planned: number
  fixedOutgoing: number
  budgetOutgoing: number
  expectedOutgoing: number
  surplus: number
}
