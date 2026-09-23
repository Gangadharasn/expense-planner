export function newId(): string {
  return crypto.randomUUID()
}

export function formatMoney(currency: string, amount: number): string {
  return `${currency}${amount.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`
}
