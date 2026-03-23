import type { ReturnShipmentInfo } from '@/shared/types/modules'

import type {
  AfterSaleRecord,
  SaveReturnShipmentCommand,
  SubmitAfterSaleApplicationCommand,
} from '../domain/after-sale'
import type { AfterSaleRepository } from '../domain/after-sale-repository'

import {
  readBrowserAfterSaleSnapshot,
  writeBrowserAfterSaleSnapshot,
} from './browser-after-sale-storage'

interface CreateBrowserAfterSaleRepositoryOptions {
  getScopeKey: () => string
  getSeedRecordByRefundId?: (refundId: string) => AfterSaleRecord | null
  namespace: string
  resolveStorePhone?: (storeId: string) => string | null
}

function normalizeValue(value: string) {
  return value.trim()
}

function createScope(options: CreateBrowserAfterSaleRepositoryOptions) {
  return {
    namespace: options.namespace,
    scopeKey: options.getScopeKey(),
  }
}

function resolveInitialStatus(type: SubmitAfterSaleApplicationCommand['type']) {
  return type === 'refund'
    ? { status: 'processing', statusText: '退款处理中' }
    : { status: 'awaiting-shipment', statusText: '待退货发货' }
}

export function createBrowserAfterSaleRepository(
  options: CreateBrowserAfterSaleRepositoryOptions,
): AfterSaleRepository {
  function readSnapshot() {
    return readBrowserAfterSaleSnapshot(createScope(options))
  }

  function writeSnapshot(snapshot: ReturnType<typeof readSnapshot>) {
    writeBrowserAfterSaleSnapshot(createScope(options), snapshot)
  }

  return {
    async cancelApplication(refundId) {
      const normalizedRefundId = normalizeValue(refundId)

      if (!normalizedRefundId) {
        return null
      }

      const snapshot = readSnapshot()
      const existingRecord = snapshot.applications.find((item) => item.refundId === normalizedRefundId)
      const targetRecord = existingRecord ?? options.getSeedRecordByRefundId?.(normalizedRefundId) ?? null

      if (!targetRecord) {
        return null
      }

      const nextRecord: AfterSaleRecord = {
        ...targetRecord,
        status: 'cancelled',
        statusText: targetRecord.type === 'refund' ? '退款已取消' : '退货已取消',
      }

      writeSnapshot({
        ...snapshot,
        applications: existingRecord
          ? snapshot.applications.map((item) => (item.refundId === normalizedRefundId ? nextRecord : item))
          : [nextRecord, ...snapshot.applications],
      })

      return nextRecord
    },

    async getReturnShipment(refundId) {
      const normalizedRefundId = normalizeValue(refundId)

      if (!normalizedRefundId) {
        return null
      }

      return readSnapshot().returnShipments[normalizedRefundId] ?? null
    },

    async getSnapshot() {
      return readSnapshot()
    },

    async saveReturnShipment(command) {
      const normalizedRefundId = normalizeValue(command.refundId)

      if (!normalizedRefundId) {
        return null
      }

      const nextShipment: ReturnShipmentInfo = {
        company: normalizeValue(command.company),
        shippedAt: normalizeValue(command.shippedAt),
        trackingNo: normalizeValue(command.trackingNo),
      }

      const snapshot = readSnapshot()

      writeSnapshot({
        ...snapshot,
        returnShipments: {
          ...snapshot.returnShipments,
          [normalizedRefundId]: nextShipment,
        },
      })

      return nextShipment
    },

    async submitApplication(command) {
      const snapshot = readSnapshot()
      const existingRecord = snapshot.applications.find((item) =>
        item.orderId === command.orderId
        && item.orderItemId === command.orderItemId
        && item.type === command.type,
      )
      const statusInfo = resolveInitialStatus(command.type)
      const nextRecord: AfterSaleRecord = {
        ...command,
        appliedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        description: normalizeValue(command.description) || null,
        paymentMethod: normalizeValue(command.paymentMethod) || '账户余额',
        productImageUrl: normalizeValue(command.productImageUrl),
        productName: normalizeValue(command.productName),
        reason: normalizeValue(command.reason),
        refundId: existingRecord?.refundId ?? `${command.type}-${Date.now()}`,
        skuDescription: command.skuDescription ? normalizeValue(command.skuDescription) : null,
        status: statusInfo.status,
        statusText: statusInfo.statusText,
        storePhone: options.resolveStorePhone?.(command.storeId) ?? null,
        storeName: normalizeValue(command.storeName),
      }

      writeSnapshot({
        ...snapshot,
        applications: [
          nextRecord,
          ...snapshot.applications.filter((item) => item.refundId !== nextRecord.refundId),
        ],
      })

      return nextRecord
    },
  }
}
