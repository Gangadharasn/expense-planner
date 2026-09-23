import type { AppData } from '../types'
import {
  STORAGE_KEY,
  exportAppDataJson,
  importAppDataJson,
} from '../lib/storage'
import { formatMoney } from '../lib/format'

type Props = {
  data: AppData
  setData: (fn: (d: AppData) => AppData) => void
  updateSettings: (p: Partial<AppData['settings']>) => void
  onLock: () => void
}

export function DataPage({ data, setData, updateSettings, onLock }: Props) {
  const { currency } = data.settings

  function onImport(file: File) {
    file.text().then((text) => {
      const imported = importAppDataJson(text)
      setData(() => imported)
    })
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <h2 className="font-semibold text-amber-900">Where is my data?</h2>
        <p className="mt-2 text-sm text-amber-950/80">
          Everything is saved in this browser only, under the key{' '}
          <code className="rounded bg-white/80 px-1 text-xs">{STORAGE_KEY}</code>{' '}
          (localStorage). It does not go to any server. Clearing site data or
          another device will not see your entries — use backup below.
        </p>
        <p className="mt-2 text-xs text-amber-900/70">
          {data.expenses.length} expenses · {data.moneyIns.length} wallet
          entries · {data.stickyNotes.length} notes
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Income & currency</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm text-slate-600">Monthly income</span>
            <input
              type="number"
              min="0"
              value={data.settings.monthlyIncome || ''}
              onChange={(e) =>
                updateSettings({ monthlyIncome: Number(e.target.value) || 0 })
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-emerald-500 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">Currency</span>
            <input
              type="text"
              maxLength={3}
              value={data.settings.currency}
              onChange={(e) =>
                updateSettings({ currency: e.target.value || '₹' })
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-emerald-500 focus:ring-2"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Backup</h2>
        <p className="mt-1 text-sm text-slate-500">
          Download a JSON file or restore from a previous backup.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={`data:application/json;charset=utf-8,${encodeURIComponent(
              exportAppDataJson(data),
            )}`}
            download="expense-planner-backup.json"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Download backup
          </a>
          <label className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
            Restore file
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) onImport(f)
              }}
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Credit card limit (optional)</h2>
        <input
          type="number"
          min="0"
          value={data.settings.creditCardLimit || ''}
          onChange={(e) =>
            updateSettings({ creditCardLimit: Number(e.target.value) || 0 })
          }
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-emerald-500 focus:ring-2"
          placeholder="e.g. 50000"
        />
        {data.settings.creditCardLimit > 0 && (
          <p className="mt-2 text-sm text-slate-600">
            Limit {formatMoney(currency, data.settings.creditCardLimit)}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Lock app</h2>
        <p className="mt-1 text-sm text-slate-500">
          Requires your PIN again. Stays unlocked until you close the browser tab.
        </p>
        <button
          type="button"
          onClick={onLock}
          className="mt-3 w-full rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-800"
        >
          Lock now
        </button>
      </section>
    </div>
  )
}
