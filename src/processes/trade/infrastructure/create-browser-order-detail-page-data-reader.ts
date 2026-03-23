import type { OrderRecord } from '@/entities/order'
import { allowActions } from '@/shared/mocks/modules'
import type {
  OrderDetailPageData,
  TradeOrderAction,
  TradeOrderItem,
  TradeOrderStatus,
} from '@/shared/types/modules'

interface CreateBrowserOrderDetailPageDataReaderOptions {
  defaultStoreId: string
  getSeedDetailPageData?: (orderId: string) => OrderDetailPageData | null
  getAfterSaleStatusMap?: (orderId: string) => Promise<Record<string, string | null>> | Record<string, string | null>
  readOrders: () => OrderRecord[]
}

function createAmountDetails(totalAmount: number, shippingAmount: number) {
  return [
    {
      amount: Math.max(totalAmount - shippingAmount, 0),
      code: 'goods',
      direction: 'increase' as const,
      label: '商品金额',
    },
    {
      amount: shippingAmount,
      code: 'shipping',
      direction: 'increase' as const,
      label: '运费',
    },
  ]
}

function resolveOrderActions(status: TradeOrderStatus) {
  switch (status) {
    case 'pending-payment':
      return allowActions<TradeOrderAction>(['pay', 'cancel', 'copy-order-no'])
    case 'pending-receipt':
      return allowActions<TradeOrderAction>(['view-logistics', 'confirm-receipt', 'copy-order-no'])
    case 'pending-review':
      return allowActions<TradeOrderAction>(['review', 'copy-order-no'])
    default:
      return allowActions<TradeOrderAction>(['copy-order-no'])
  }
}

function resolveStatusHint(status: TradeOrderStatus) {
  switch (status) {
    case 'pending-payment':
      return '订单已提交，请尽快完成支付。'
    case 'pending-shipment':
      return '商家正在备货，请耐心等待发货。'
    case 'pending-receipt':
      return '商品已发出，请注意查收。'
    case 'pending-review':
      return '订单已签收，欢迎评价商品。'
    case 'cancelled':
      return '订单已取消。'
    case 'completed':
      return '订单已完成。'
    default:
      return '订单处理中。'
  }
}

function resolveTimeline(status: TradeOrderStatus) {
  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ')

  return {
    completedAt: status === 'completed' ? createdAt : null,
    createdAt,
    paidAt: status === 'pending-payment' || status === 'cancelled' ? null : createdAt,
    shippedAt:
      status === 'pending-receipt' || status === 'pending-review' || status === 'completed'
        ? createdAt
        : null,
  }
}

function createFallbackOrderItem(
  orderId: string,
  storeId: string,
  item: OrderRecord['items'][number],
  afterSaleStatus: string | null,
): TradeOrderItem {
  return {
    actions: [],
    afterSaleStatus,
    orderItemId: item.orderItemId,
    productId: `${orderId}-${item.orderItemId}`,
    productImageUrl: item.productImageUrl ?? '',
    productName: item.productName,
    quantity: item.quantity,
    skuDescription: null,
    skuId: null,
    storeId,
    subtotalAmount: item.unitPrice * item.quantity,
    unitPrice: item.unitPrice,
  }
}

function mergeOrderItems(
  record: OrderRecord,
  detail: OrderDetailPageData | null,
  defaultStoreId: string,
  afterSaleStatusMap: Record<string, string | null>,
) {
  const seedItemsById = new Map(detail?.items.map((item) => [item.orderItemId, item]) ?? [])

  return record.items.map((item) => {
    const seedItem = seedItemsById.get(item.orderItemId)

    if (!seedItem) {
      return createFallbackOrderItem(
        record.orderId,
        defaultStoreId,
        item,
        afterSaleStatusMap[item.orderItemId] ?? null,
      )
    }

    return {
      ...seedItem,
      afterSaleStatus: afterSaleStatusMap[item.orderItemId] ?? seedItem.afterSaleStatus,
      productImageUrl: item.productImageUrl ?? '',
      productName: item.productName,
      quantity: item.quantity,
      subtotalAmount: item.unitPrice * item.quantity,
      unitPrice: item.unitPrice,
    }
  })
}

function synthesizeOrderDetailPageData(
  record: OrderRecord,
  defaultStoreId: string,
  afterSaleStatusMap: Record<string, string | null>,
): OrderDetailPageData {
  return {
    actions: resolveOrderActions(record.status),
    address: {
      address: '待同步收货地址',
      recipientName: '收货人',
      recipientPhone: '暂无',
    },
    amountDetails: createAmountDetails(record.totalAmount, record.shippingAmount),
    buyerMessage: null,
    deliveryRemark: null,
    gifts: [],
    invoiceInfo: null,
    items: record.items.map((item) =>
      createFallbackOrderItem(
        record.orderId,
        defaultStoreId,
        item,
        afterSaleStatusMap[item.orderItemId] ?? null,
      )),
    logistics: null,
    orderId: record.orderId,
    orderNo: record.orderNo,
    orderType: 'physical',
    payableAmount: record.totalAmount,
    paymentMethod: record.status === 'pending-payment' || record.status === 'cancelled' ? null : (record.paymentMethod ?? '账户余额'),
    promotions: [],
    shippingAmount: record.shippingAmount,
    status: record.status === 'all' ? 'pending-payment' : record.status,
    statusHint: resolveStatusHint(record.status),
    statusText: record.statusText,
    storeId: defaultStoreId,
    storeName: record.storeName,
    timeline: resolveTimeline(record.status),
  }
}

export function createBrowserOrderDetailPageDataReader(
  options: CreateBrowserOrderDetailPageDataReaderOptions,
) {
  return async function getOrderDetailPageData(orderId: string): Promise<OrderDetailPageData | null> {
    const record = options.readOrders().find((item) => item.orderId === orderId) ?? null
    const seedDetail = options.getSeedDetailPageData?.(orderId) ?? null
    const afterSaleStatusMap = await options.getAfterSaleStatusMap?.(orderId) ?? {}

    if (!record) {
      return seedDetail
    }

    if (!seedDetail) {
      return synthesizeOrderDetailPageData(record, options.defaultStoreId, afterSaleStatusMap)
    }

    return {
      ...seedDetail,
      actions: resolveOrderActions(record.status),
      amountDetails: seedDetail.amountDetails.length > 0
        ? seedDetail.amountDetails
        : createAmountDetails(record.totalAmount, record.shippingAmount),
      items: mergeOrderItems(record, seedDetail, options.defaultStoreId, afterSaleStatusMap),
      logistics: record.status === 'pending-payment' || record.status === 'cancelled' ? null : seedDetail.logistics,
      orderNo: record.orderNo,
      payableAmount: record.totalAmount,
      paymentMethod:
        record.status === 'pending-payment' || record.status === 'cancelled'
          ? null
          : record.paymentMethod ?? seedDetail.paymentMethod ?? '账户余额',
      shippingAmount: record.shippingAmount,
      status: record.status === 'all' ? seedDetail.status : record.status,
      statusHint: seedDetail.status === record.status ? seedDetail.statusHint : resolveStatusHint(record.status),
      statusText: record.statusText,
      storeId: seedDetail.storeId || options.defaultStoreId,
      storeName: record.storeName,
      timeline: seedDetail.timeline ?? resolveTimeline(record.status),
    }
  }
}
