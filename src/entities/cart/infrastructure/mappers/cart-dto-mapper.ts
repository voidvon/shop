import { createCartLine, createCartSnapshot, createEmptyCartSnapshot, type CartSnapshot } from '../../domain/cart'
import type { BackendACartItemDto } from '../dto/backend-a-cart.dto'
import { resolveBackendAMediaUrl } from '@/shared/api/backend-a/backend-a-config'

function parseAmount(value: string | null | undefined) {
  const parsedValue = Number.parseFloat(value ?? '')
  return Number.isFinite(parsedValue) ? parsedValue : 0
}

function resolveCartImageUrl(dto: BackendACartItemDto) {
  return resolveBackendAMediaUrl(
    dto.sku?.image ?? dto.product?.main_images[0] ?? null,
  )
}

function mapSkuSpecText(dto: BackendACartItemDto) {
  return dto.sku?.name?.trim() || null
}

export function mapBackendACartItemDto(dto: BackendACartItemDto) {
  const merchantName = dto.merchant?.short_name?.trim() || dto.merchant?.name?.trim() || null

  return createCartLine({
    productId: String(dto.product_id),
    productImageUrl: resolveCartImageUrl(dto),
    productName: dto.product?.title ?? `商品#${dto.product_id}`,
    quantity: dto.quantity,
    selected: dto.selected === 1,
    skuId: String(dto.product_sku_id),
    specText: mapSkuSpecText(dto),
    storeId: dto.merchant_id ? String(dto.merchant_id) : null,
    storeName: merchantName,
    unitPrice: parseAmount(dto.sku?.price),
  })
}

export function mapBackendACartSnapshotDto(items: BackendACartItemDto[]): CartSnapshot {
  const lines = items.map((item) => ({
    ...mapBackendACartItemDto(item),
    lineId: String(item.id),
  }))

  return lines.length > 0 ? createCartSnapshot(lines) : createEmptyCartSnapshot()
}
