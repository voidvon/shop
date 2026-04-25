import {
  createCheckoutLine,
  type CheckoutBalanceDeduction,
  type CheckoutPreviewGroup,
  type CheckoutCouponUsage,
  type CreateCheckoutPreviewCommand,
  type OrderRecord,
} from '../../domain/order'
import type {
  BackendACheckoutBalanceDeductionDto,
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

function normalizeStatusText(value: string | null | undefined) {
  return value?.trim() ?? ''
}

function isReturnFlowStatusText(statusText: string) {
  return statusText.includes('退货')
}

function isRefundFlowStatusText(statusText: string) {
  return statusText.includes('退款') || isReturnFlowStatusText(statusText)
}

function resolveOrderStatus(dto: BackendAOrderDto): TradeOrderStatus {
  const statusText = normalizeStatusText(dto.status_text)

  if (dto.refunded_at || isRefundFlowStatusText(statusText)) {
    return isReturnFlowStatusText(statusText) ? 'returning' : 'refunding'
  }

  switch (dto.status) {
    case 0:
      return 'pending-payment'
    case 10:
      return 'pending-shipment'
    case 20:
      return 'pending-receipt'
    case 30:
      return 'completed'
    case 40:
      return 'cancelled'
    case 50:
      return dto.status_text?.includes('退货') ? 'returning' : 'refunding'
    default:
      if (dto.delivery_status === 1) {
        return 'pending-receipt'
      }

      if (dto.delivery_status === 2) {
        return 'completed'
      }

      return dto.payment_status === 1 ? 'pending-shipment' : 'cancelled'
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
    case 'refunding':
      return '退款完成'
    case 'returning':
      return '退货完成'
    case 'completed':
      return '已完成'
    default:
      return '处理中'
  }
}

function mapCheckoutBalanceDeduction(
  dto: BackendACheckoutBalanceDeductionDto,
): CheckoutBalanceDeduction {
  return {
    availableAmount: parseAmount(dto.available_amount),
    balanceTypeId: dto.balance_type_id,
    balanceTypeName: dto.balance_type_name,
    deductAmount: parseAmount(dto.deduct_amount),
  }
}

function mapCheckoutPreviewGroup(dto: BackendACheckoutPreviewGroupDto): CheckoutPreviewGroup {
  return {
    availableCoupons: [],
    availableBalance: parseAmount(dto.available_balance),
    balanceDeductions: (dto.balance_deductions ?? []).map(mapCheckoutBalanceDeduction),
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
  const statusText = normalizeStatusText(dto.status_text) || resolveOrderStatusText(status)

  return {
    itemCount: dto.item_count,
    items: dto.items.map((item) => ({
      orderItemId: String(item.id),
      productId: String(item.product_id),
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
    statusText,
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
