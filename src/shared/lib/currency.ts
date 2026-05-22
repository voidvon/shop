const currencyFormatter = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

function formatRawCurrency(value: string) {
  const normalizedValue = value.trim()

  if (!normalizedValue) {
    return null
  }

  return normalizedValue.startsWith('¥') ? normalizedValue : `¥${normalizedValue}`
}

export function formatCurrency(value: number | string) {
  if (typeof value === 'string') {
    const rawCurrency = formatRawCurrency(value)

    if (rawCurrency) {
      return rawCurrency
    }
  }

  const numericValue = typeof value === 'number' ? value : Number(value)
  return currencyFormatter.format(Number.isFinite(numericValue) ? numericValue : 0)
}
