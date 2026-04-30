import type { TradeOrderStatus } from '@/shared/types/modules'

export interface CheckoutLine {
  lineTotal: number
  lineId: string | null
  productId: string
  productImageUrl?: string | null
  productName: string
  quantity: number
  skuId: string | null
  specText: string | null
  unitPrice: number
}

export interface CreateCheckoutPreviewCommand {
  lines: CheckoutLine[]
  source: 'cart' | 'instant'
}

export interface CheckoutCouponUsage {
  balanceTypeId: number
  merchantId: number
  userCouponId: number
}

export interface CheckoutAvailableCoupon {
  discountAmount: number
  discountRate: number | null
  endsAt: string | null
  merchantId: number | null
  minimumAmount: number
  name: string
  startsAt: string | null
  type: string | null
  userCouponId: number
}

export interface CheckoutBalanceDeduction {
  availableAmount: number
  balanceTypeId: number
  balanceTypeName: string
  deductAmount: number
}

export interface CheckoutPreviewGroup {
  availableCoupons: CheckoutAvailableCoupon[]
  availableBalance: number
  balanceDeductions: CheckoutBalanceDeduction[]
  balanceTypeId: number
  balanceTypeName: string
  couponAmount: number
  couponError: string | null
  couponName: string | null
  merchantId: number
  merchantName: string
  payableAmount: number
  totalAmount: number
  userCouponId: number | null
}

export interface CheckoutPreview {
  couponUsages: CheckoutCouponUsage[]
  discountAmount: number
  groups: CheckoutPreviewGroup[]
  lines: CheckoutLine[]
  payableAmount: number
  source: 'cart' | 'instant'
  subtotalAmount: number
}

export interface SubmitOrderCommand extends CreateCheckoutPreviewCommand {
  addressId?: string | null
  couponUsages?: CheckoutCouponUsage[]
  remark?: string | null
}

export interface OrderConfirmation {
  orderId: string
  payableAmount: number
  paymentMethod: string
  source: 'cart' | 'instant'
  submittedAt: string
}

export interface OrderRecordItem {
  orderItemId: string
  productId: string
  productImageUrl: string | null
  productName: string
  quantity: number
  unitPrice: number
}

export interface OrderRecord {
  itemCount: number
  items: OrderRecordItem[]
  orderId: string
  orderNo: string
  paymentMethod: string | null
  shippingAmount: number
  status: TradeOrderStatus
  statusText: string
  storeName: string
  totalAmount: number
}

export type OrderAction = 'cancel' | 'confirm-receipt' | 'pay'

export interface TransitionOrderStatusCommand {
  action: OrderAction
  currentStatus: TradeOrderStatus
  orderId: string
}

export interface OrderStatusUpdate {
  action: OrderAction
  orderId: string
  status: TradeOrderStatus
  statusText: string
  updatedAt: string
}

export interface RequestOrderRefundCommand {
  currentStatus: TradeOrderStatus
  orderId: string
  reason: string
}

export interface OrderRefundRequestResult {
  orderId: string
  reason: string
  status: TradeOrderStatus
  statusText: string
  updatedAt: string
}

export function createCheckoutLine(input: Omit<CheckoutLine, 'lineTotal'> & { lineTotal?: number }): CheckoutLine {
  const quantity = Number.isFinite(input.quantity) && input.quantity > 0 ? Math.floor(input.quantity) : 1
  const lineTotal = input.lineTotal ?? input.unitPrice * quantity

  return {
    lineTotal,
    lineId: input.lineId ?? input.productId,
    productId: input.productId,
    productImageUrl: input.productImageUrl ?? null,
    productName: input.productName,
    quantity,
    skuId: input.skuId ?? null,
    specText: input.specText ?? null,
    unitPrice: input.unitPrice,
  }
}

export function createCheckoutPreview(
  command: CreateCheckoutPreviewCommand,
  discountAmount = 0,
): CheckoutPreview {
  const lines = command.lines.map((line) => createCheckoutLine(line))
  const subtotalAmount = lines.reduce((sum, line) => sum + line.lineTotal, 0)

  return {
    couponUsages: [],
    discountAmount,
    groups: [],
    lines,
    payableAmount: Math.max(subtotalAmount - discountAmount, 0),
    source: command.source,
    subtotalAmount,
  }
}

export function transitionOrderStatus(command: TransitionOrderStatusCommand): OrderStatusUpdate {
  return {
    action: command.action,
    orderId: command.orderId,
    status: resolveNextOrderStatus(command.action, command.currentStatus),
    statusText: resolveOrderStatusText(resolveNextOrderStatus(command.action, command.currentStatus)),
    updatedAt: new Date().toISOString(),
  }
}

export function isOrderRefundRequestable(status: TradeOrderStatus) {
  return status === 'pending-shipment' || status === 'pending-receipt'
}

export function requestOrderRefund(command: RequestOrderRefundCommand): OrderRefundRequestResult {
  const reason = command.reason.trim()

  if (!isOrderRefundRequestable(command.currentStatus)) {
    throw new Error('当前订单不可申请退款')
  }

  if (reason.length < 2) {
    throw new Error('请填写退款原因')
  }

  if (reason.length > 1000) {
    throw new Error('退款原因不能超过 1000 个字')
  }

  return {
    orderId: command.orderId,
    reason,
    status: 'refunding',
    statusText: '退款待审核',
    updatedAt: new Date().toISOString(),
  }
}

function resolveNextOrderStatus(action: OrderAction, currentStatus: TradeOrderStatus): TradeOrderStatus {
  switch (action) {
    case 'cancel':
      if (currentStatus !== 'pending-payment') {
        throw new Error('当前订单不可取消')
      }
      return 'cancelled'
    case 'pay':
      if (currentStatus !== 'pending-payment') {
        throw new Error('当前订单不可支付')
      }
      return 'pending-shipment'
    case 'confirm-receipt':
      if (currentStatus !== 'pending-receipt') {
        throw new Error('当前订单不可确认收货')
      }
      return 'pending-review'
    default:
      return currentStatus
  }
}

function resolveOrderStatusText(status: TradeOrderStatus) {
  switch (status) {
    case 'cancelled':
      return '已取消'
    case 'pending-payment':
      return '待付款'
    case 'pending-shipment':
      return '待发货'
    case 'pending-receipt':
      return '待收货'
    case 'pending-review':
      return '待评价'
    case 'refunding':
      return '退款中'
    case 'returning':
      return '退货中'
    case 'completed':
      return '已完成'
    default:
      return '处理中'
  }
}
