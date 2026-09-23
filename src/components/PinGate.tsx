import { useState, type FormEvent, type ReactNode } from 'react'
import { lockSession, unlockSession, verifyPin } from '../lib/auth'
import { formatFullDate } from '../lib/dates'

type PinGateProps = {
  unlocked: boolean
  onUnlockedChange: (value: boolean) => void
  children: ReactNode
}

export function PinGate({ unlocked, onUnlockedChange, children }: PinGateProps) {
  if (!unlocked) {
    return <PinScreen onSuccess={() => onUnlockedChange(true)} />
  }
  return <>{children}</>
}

export function PinScreen({ onSuccess }: { onSuccess: () => void }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const today = new Date()

  function submit(e: FormEvent) {
    e.preventDefault()
    if (verifyPin(pin)) {
      unlockSession()
      setError(false)
      onSuccess()
    } else {
      setError(true)
      setPin('')
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center bg-slate-100 px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
          Expense Planner
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Enter your PIN</h1>
        <p className="mt-2 text-sm text-slate-600">
          Today: {formatFullDate(today)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          This keeps your money data private on this device.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={8}
            autoComplete="off"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-2xl tracking-[0.3em] outline-none ring-emerald-500 focus:ring-2"
            placeholder="••••"
            aria-label="PIN"
          />
          {error && (
            <p className="text-center text-sm text-red-600">
              Wrong PIN. Try again.
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  )
}

export function lockApp(onLock: () => void) {
  lockSession()
  onLock()
}
