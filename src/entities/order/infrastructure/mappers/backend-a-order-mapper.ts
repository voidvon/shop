import {
  createCheckoutLine,
  type CheckoutPreviewGroup,
  type CheckoutCouponUsage,
  type CreateCheckoutPreviewCommand,
  type OrderRecord,
} from '../../domain/order'
import type {
  BackendACheckoutPreviewDto,
  BackendACheckoutPreviewGroupDto,
  BackendAOrderDto,
} from '../dto/backend-a-order.dto'
import { resolveBackendAMediaUrl } from '@/shared/api/backend-a/backend-a-config'
import type { TradeOrderStatus } from '@/shared/types/modules'

function parseAmount(value: string | null | undefined) {
  const parsedValue = Number.parseFloat(value ?? '')
  return Number.isFinite(parsedValue) ? parsedValue : 0
}

function resolveOrderStatus(dto: BackendAOrderDto): TradeOrderStatus {
  if (dto.status <= 0) {
    return 'cancelled'
  }

  if (dto.payment_status !== 1) {
    return 'pending-payment'
  }

  if (dto.delivery_status <= 0) {
    return 'pending-shipment'
  }

  if (dto.delivery_status === 1) {
    return 'pending-receipt'
  }

  return 'completed'
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
    case 'completed':
      return '已完成'
    default:
      return '处理中'
  }
}

function mapCheckoutPreviewGroup(dto: BackendACheckoutPreviewGroupDto): CheckoutPreviewGroup {
  return {
    availableCoupons: [],
    availableBalance: parseAmount(dto.available_balance),
    balanceTypeId: dto.balance_type_id,
    balanceTypeName: dto.balance_type_name,
    couponAmount: parseAmount(dto.coupon_amount),
    couponError: dto.coupon_error ?? null,
    couponName: dto.coupon_name ?? null,
    merchantId: dto.merchant_id,
    merchantName: dto.merchant_name,
    payableAmount: parseAmount(dto.payable_amount),
    totalAmount: parseAmount(dto.total_amount),
    userCouponId: dto.user_coupon_id,
  }
}

function mapCheckoutCouponUsages(groups: CheckoutPreviewGroup[]): CheckoutCouponUsage[] {
  return groups
    .filter((group) => Number.isInteger(group.userCouponId) && (group.userCouponId ?? 0) > 0)
    .map((group) => ({
      balanceTypeId: group.balanceTypeId,
      merchantId: group.merchantId,
      userCouponId: group.userCouponId as number,
    }))
}

export function mapBackendAOrderDto(dto: BackendAOrderDto): OrderRecord {
  const status = resolveOrderStatus(dto)

  return {
    itemCount: dto.item_count,
    items: dto.items.map((item) => ({
      orderItemId: String(item.id),
      productImageUrl: resolveBackendAMediaUrl(item.image),
      productName: item.product_title,
      quantity: item.quantity,
      unitPrice: parseAmount(item.price),
    })),
    orderId: String(dto.id),
    orderNo: dto.order_no,
    paymentMethod: dto.payment_status === 1 ? '账户余额' : null,
    shippingAmount: 0,
    status,
    statusText: resolveOrderStatusText(status),
    storeName: dto.merchant?.short_name ?? dto.merchant?.name ?? `商户#${dto.merchant_id}`,
    totalAmount: parseAmount(dto.payable_amount || dto.total_amount),
  }
}

export function mapBackendACheckoutPreviewDto(
  command: CreateCheckoutPreviewCommand,
  dto: BackendACheckoutPreviewDto,
) {
  const groups = dto.groups.map(mapCheckoutPreviewGroup)
  const subtotalAmount = parseAmount(dto.total_amount)
  const payableAmount = parseAmount(dto.payable_amount)
  const discountAmount = Math.max(subtotalAmount - payableAmount, 0)

  return {
    couponUsages: mapCheckoutCouponUsages(groups),
    discountAmount,
    groups,
    lines: command.lines.map((line) => createCheckoutLine(line)),
    payableAmount,
    source: command.source,
    subtotalAmount,
  }
}
