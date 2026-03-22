import type { OrderRecord } from '../domain/order'

const browserOrderStoragePrefix = 'shop.order.records'

function canUseStorage() {
  return typeof window !== 'undefined'
}

function createBrowserOrderStorageKey(namespace: string, scopeKey: string) {
  return `${browserOrderStoragePrefix}.${namespace}.${scopeKey}`
}

export function readBrowserOrderRecords(
  namespace: string,
  scopeKey: string,
  getSeedRecords: () => OrderRecord[],
): OrderRecord[] {
  if (!canUseStorage()) {
    return []
  }

  const storageKey = createBrowserOrderStorageKey(namespace, scopeKey)
  const storedValue = window.localStorage.getItem(storageKey)

  if (!storedValue) {
    const seedRecords = getSeedRecords()
    writeBrowserOrderRecords(namespace, scopeKey, seedRecords)
    return seedRecords
  }

  try {
    const parsedValue = JSON.parse(storedValue) as OrderRecord[]
    return Array.isArray(parsedValue) ? parsedValue : []
  } catch {
    window.localStorage.removeItem(storageKey)
    const seedRecords = getSeedRecords()
    writeBrowserOrderRecords(namespace, scopeKey, seedRecords)
    return seedRecords
  }
}

export function writeBrowserOrderRecords(namespace: string, scopeKey: string, records: OrderRecord[]) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(
    createBrowserOrderStorageKey(namespace, scopeKey),
    JSON.stringify(records),
  )
}
