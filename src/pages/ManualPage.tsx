import { HelpBox } from '../components/HelpBox'

export function ManualPage() {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-slate-700">
      <HelpBox title="User manual">
        <p>Read this anytime from the Help tab. All dates use your phone/computer clock.</p>
      </HelpBox>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-slate-900">1. Today</h2>
        <p className="mt-2">
          Shows spending for the <strong>current calendar month</strong> only.
          Cash/UPI and credit card are shown separately.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold">2. Spend</h2>
        <p className="mt-2">
          <strong>PAY ▷</strong> — record a payment you already made.{' '}
          <strong>Planned</strong> — reminder for later (not counted as paid).
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold">3. Wallet</h2>
        <p className="mt-2">
          <strong>ADD ◈</strong> — money you received (salary, gift, etc.). This
          is not a minus sign; it adds to your month balance in Report.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold">4. Report</h2>
        <p className="mt-2">
          Pick any month from the dropdown. See category totals, passbook, and
          download <strong>CSV</strong>, <strong>JSON</strong>, or{' '}
          <strong>Print / PDF</strong> (use “Save as PDF” in the print dialog).
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold">5. Calendar</h2>
        <p className="mt-2">
          Tap a day to see entries. ◈ = money in, ▷ = payment. Add entries for
          that date from the buttons below.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold">6. Credit</h2>
        <p className="mt-2">Only credit card payments — separate from cash.</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold">7. Bills & Plan</h2>
        <p className="mt-2">
          Bills: fixed monthly costs and long-term charts. Plan: upcoming costs
          for this/next month.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold">8. Notes & Settings</h2>
        <p className="mt-2">
          Sticky notes for anything else. Settings: backup, PIN lock, income
          settings. Data stays on this browser unless you export a backup.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold">Symbols</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li><strong>◈ ADD</strong> — money coming in (wallet)</li>
          <li><strong>▷ PAY</strong> — bill or expense going out</li>
          <li>We avoid plain + and − in labels so ADD and PAY stay clear.</li>
        </ul>
      </section>
    </div>
  )
}
