/** Simple device PIN — not secure against someone reading the app code. */
export const APP_PIN = '8514'

const SESSION_KEY = 'expense-planner-session'

export function isSessionUnlocked(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === 'ok'
}

export function unlockSession(): void {
  sessionStorage.setItem(SESSION_KEY, 'ok')
}

export function lockSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

export function verifyPin(pin: string): boolean {
  return pin === APP_PIN
}
