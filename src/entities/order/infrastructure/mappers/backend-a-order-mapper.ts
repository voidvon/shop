import { createCheckoutLine, type CreateCheckoutPreviewCommand, type OrderRecord } from '../../domain/order'
import type {
  BackendACheckoutPreviewDto,
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
  const subtotalAmount = parseAmount(dto.total_amount)
  const payableAmount = parseAmount(dto.payable_amount)
  const discountAmount = Math.max(subtotalAmount - payableAmount, 0)

  return {
    discountAmount,
    lines: command.lines.map((line) => createCheckoutLine(line)),
    payableAmount,
    source: command.source,
    subtotalAmount,
  }
}
