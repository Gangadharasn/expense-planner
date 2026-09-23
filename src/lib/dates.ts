export function monthKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function parseMonthKey(key: string): Date {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1)
}

export function monthLabel(key: string): string {
  const d = parseMonthKey(key)
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

export function addMonths(key: string, count: number): string {
  const d = parseMonthKey(key)
  d.setMonth(d.getMonth() + count)
  return monthKey(d)
}

export function todayISO(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** e.g. "Wednesday, 24 September 2026" — from device clock & locale. */
export function formatFullDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
}
