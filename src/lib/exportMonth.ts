import type { AppData } from '../types'
import { buildPassbook, monthSummaryStats } from './ledger'
import { CATEGORIES } from '../types'
import { formatMoney } from './format'

export function downloadTextFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportMonthCsv(data: AppData, monthKey: string): void {
  const stats = monthSummaryStats(data, monthKey)
  const lines = [
    `Month,${stats.label}`,
    `Money added,${stats.totalIn}`,
    `Payments,${stats.totalOut}`,
    `Left,${stats.closingBalance}`,
    '',
    'Category,Amount',
  ]
  for (const c of CATEGORIES) {
    if (stats.byCategory[c] > 0) {
      lines.push(`${c},${stats.byCategory[c]}`)
    }
  }
  lines.push('', 'Date,Type,Title,Amount,Balance')
  for (const row of buildPassbook(data, monthKey)) {
    lines.push(
      `${row.date},${row.flow === 'in' ? 'ADD' : 'PAY'},${row.title},${row.amount},${row.balanceAfter}`,
    )
  }
  downloadTextFile(
    `expenses-${monthKey}.csv`,
    lines.join('\n'),
    'text/csv;charset=utf-8',
  )
}

export function exportMonthJson(data: AppData, monthKey: string): void {
  const stats = monthSummaryStats(data, monthKey)
  const payload = {
    month: monthKey,
    label: stats.label,
    summary: {
      moneyAdded: stats.totalIn,
      payments: stats.totalOut,
      left: stats.closingBalance,
      byCategory: stats.byCategory,
    },
    passbook: buildPassbook(data, monthKey),
  }
  downloadTextFile(
    `expenses-${monthKey}.json`,
    JSON.stringify(payload, null, 2),
    'application/json',
  )
}

export function printMonthReport(data: AppData, monthKey: string): void {
  const stats = monthSummaryStats(data, monthKey)
  const currency = data.settings.currency
  const passbook = buildPassbook(data, monthKey)

  const categoryRows = CATEGORIES
    .filter((c) => stats.byCategory[c] > 0)
    .map(
      (c) =>
        `<tr><td>${c}</td><td style="text-align:right">${formatMoney(currency, stats.byCategory[c])}</td></tr>`,
    )
    .join('')

  const passbookRows = passbook
    .map(
      (r) =>
        `<tr>
          <td>${r.date}</td>
          <td>${r.flow === 'in' ? 'ADD ◈' : 'PAY ▷'}</td>
          <td>${r.title}</td>
          <td style="text-align:right;color:${r.flow === 'in' ? 'green' : '#b45309'}">${r.flow === 'in' ? '' : '−'}${formatMoney(currency, r.amount)}</td>
          <td style="text-align:right">${formatMoney(currency, r.balanceAfter)}</td>
        </tr>`,
    )
    .join('')

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${stats.label}</title>
    <style>
      body{font-family:system-ui,sans-serif;padding:24px;color:#111}
      h1{font-size:20px} table{width:100%;border-collapse:collapse;margin-top:12px;font-size:13px}
      th,td{border:1px solid #ddd;padding:8px} th{background:#f4f4f5;text-align:left}
      .sum{margin:8px 0}
    </style></head><body>
    <h1>Expense report — ${stats.label}</h1>
    <p class="sum">Money added: <strong>${formatMoney(currency, stats.totalIn)}</strong></p>
    <p class="sum">Payments: <strong>${formatMoney(currency, stats.totalOut)}</strong></p>
    <p class="sum">Left this month: <strong>${formatMoney(currency, stats.closingBalance)}</strong></p>
    <h2>By category</h2>
    <table><thead><tr><th>Category</th><th>Spent</th></tr></thead><tbody>${categoryRows || '<tr><td colspan="2">No spending</td></tr>'}</tbody></table>
    <h2>Passbook</h2>
    <table><thead><tr><th>Date</th><th>Type</th><th>Details</th><th>Amount</th><th>Balance</th></tr></thead><tbody>${passbookRows || '<tr><td colspan="5">No entries</td></tr>'}</tbody></table>
    <script>window.onload=()=>{window.print()}</script>
    </body></html>`

  const w = window.open('', '_blank')
  if (w) {
    w.document.write(html)
    w.document.close()
  }
}
