import { addMonths, monthKey } from './dates'

export function resolvePlanDate(
  plan: 'this' | 'next' | 'pick',
  pickedDate: string,
  now: Date,
): string {
  if (plan === 'pick') return pickedDate
  const key = plan === 'next' ? addMonths(monthKey(now), 1) : monthKey(now)
  return `${key}-01`
}
