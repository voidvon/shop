import type { ReturnShipmentInfo } from '@/shared/types/modules'

import type { AfterSaleRecord, AfterSaleSnapshot } from '../domain/after-sale'

interface BrowserAfterSaleStorageScope {
  namespace: string
  scopeKey: string
}

function canUseStorage() {
  return typeof window !== 'undefined'
}

function createStorageKey(scope: BrowserAfterSaleStorageScope) {
  return `shop.after-sales.${scope.namespace}.${scope.scopeKey}`
}

function isAfterSaleRecord(value: unknown): value is AfterSaleRecord {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const target = value as Partial<AfterSaleRecord>

  return typeof target.refundId === 'string'
    && (target.type === 'refund' || target.type === 'return')
    && typeof target.orderId === 'string'
    && typeof target.orderItemId === 'string'
}

function isReturnShipmentInfo(value: unknown): value is ReturnShipmentInfo {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const target = value as Partial<ReturnShipmentInfo>
  return typeof target.company === 'string'
    && typeof target.trackingNo === 'string'
    && (typeof target.shippedAt === 'string' || target.shippedAt === null)
}

function createEmptySnapshot(): AfterSaleSnapshot {
  return {
    applications: [],
    returnShipments: {},
  }
}

function normalizeSnapshot(value: unknown): AfterSaleSnapshot {
  if (typeof value !== 'object' || value === null) {
    return createEmptySnapshot()
  }

  const target = value as Partial<AfterSaleSnapshot>
  const applications = Array.isArray(target.applications)
    ? target.applications.filter(isAfterSaleRecord)
    : []

  const returnShipments = typeof target.returnShipments === 'object' && target.returnShipments !== null
    ? Object.fromEntries(
        Object.entries(target.returnShipments).filter((entry): entry is [string, ReturnShipmentInfo] => {
          return typeof entry[0] === 'string' && isReturnShipmentInfo(entry[1])
        }),
      )
    : {}

  return {
    applications,
    returnShipments,
  }
}

export function readBrowserAfterSaleSnapshot(scope: BrowserAfterSaleStorageScope) {
  if (!canUseStorage()) {
    return createEmptySnapshot()
  }

  const storedValue = window.localStorage.getItem(createStorageKey(scope))

  if (!storedValue) {
    return createEmptySnapshot()
  }

  try {
    return normalizeSnapshot(JSON.parse(storedValue) as unknown)
  } catch {
    window.localStorage.removeItem(createStorageKey(scope))
    return createEmptySnapshot()
  }
}

export function writeBrowserAfterSaleSnapshot(scope: BrowserAfterSaleStorageScope, snapshot: AfterSaleSnapshot) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(createStorageKey(scope), JSON.stringify(snapshot))
}
