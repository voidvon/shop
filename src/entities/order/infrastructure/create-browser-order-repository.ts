import {
  createCheckoutPreview,
  transitionOrderStatus,
  type CreateCheckoutPreviewCommand,
  type OrderConfirmation,
  type OrderRecord,
} from '../domain/order'
import type { OrderRepository } from '../domain/order-repository'

import {
  readBrowserOrderRecords,
  writeBrowserOrderRecords,
} from './browser-order-storage'

interface CreateBrowserOrderRepositoryOptions {
  defaultStoreName: string
  getScopeKey: () => string
  getSeedRecords: () => OrderRecord[]
  namespace: string
  resolveDiscount?: (command: CreateCheckoutPreviewCommand) => number
}

function createConfirmation(
  namespace: string,
  command: CreateCheckoutPreviewCommand,
  resolveDiscount?: (command: CreateCheckoutPreviewCommand) => number,
): OrderConfirmation {
  const preview = createCheckoutPreview(command, resolveDiscount?.(command) ?? 0)

  return {
    orderId: `${namespace}-${Date.now()}`,
    payableAmount: preview.payableAmount,
    paymentMethod: '账户余额',
    source: command.source,
    submittedAt: new Date().toISOString(),
  }
}

function createOrderRecord(
  confirmation: OrderConfirmation,
  command: CreateCheckoutPreviewCommand,
  defaultStoreName: string,
): OrderRecord {
  const itemCount = command.lines.reduce((sum, line) => sum + line.quantity, 0)

  return {
    itemCount,
    items: command.lines.map((line, index) => ({
      orderItemId: `${confirmation.orderId}-${index + 1}`,
      productId: line.productId,
      productImageUrl: line.productImageUrl ?? null,
      productName: line.productName,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
    })),
    orderId: confirmation.orderId,
    orderNo: confirmation.orderId.toUpperCase().replace(/[^A-Z0-9]/g, ''),
    paymentMethod: confirmation.paymentMethod,
    shippingAmount: 0,
    status: 'pending-shipment',
    statusText: '待发货',
    storeName: defaultStoreName,
    totalAmount: confirmation.payableAmount,
  }
}

export function createBrowserOrderRepository(options: CreateBrowserOrderRepositoryOptions): OrderRepository {
  function readRecords() {
    return readBrowserOrderRecords(
      options.namespace,
      options.getScopeKey(),
      options.getSeedRecords,
    )
  }

  function writeRecords(records: OrderRecord[]) {
    writeBrowserOrderRecords(
      options.namespace,
      options.getScopeKey(),
      records,
    )
  }

  return {
    async createPreview(command) {
      return Promise.resolve(createCheckoutPreview(command, options.resolveDiscount?.(command) ?? 0))
    },

    async submit(command) {
      const confirmation = createConfirmation(options.namespace, command, options.resolveDiscount)
      const nextRecord = createOrderRecord(confirmation, command, options.defaultStoreName)
      const records = readRecords()

      writeRecords([
        nextRecord,
        ...records.filter((record) => record.orderId !== nextRecord.orderId),
      ])

      return Promise.resolve(confirmation)
    },

    async transitionStatus(command) {
      const update = transitionOrderStatus(command)
      const records = readRecords()

      writeRecords(records.map((record) =>
        record.orderId === command.orderId
          ? {
              ...record,
              status: update.status,
              statusText: update.statusText,
            }
          : record,
      ))

      return Promise.resolve(update)
    },
  }
}
