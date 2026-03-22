import { createCartLine, type CartSnapshot } from '../../domain/cart'
import type { BackendACartSnapshotDto } from '../dto/backend-a-cart.dto'

export function mapBackendACartSnapshotDto(dto: BackendACartSnapshotDto): CartSnapshot {
  const lines = dto.entries.map((entry) =>
    createCartLine({
      productId: entry.sku,
      productImageUrl: entry.imageUrl ?? null,
      productName: entry.title,
      quantity: entry.qty,
      unitPrice: entry.unitAmount,
    }),
  )

  return {
    itemCount: dto.totalUnits,
    lines,
    subtotal: dto.payableAmount,
  }
}
