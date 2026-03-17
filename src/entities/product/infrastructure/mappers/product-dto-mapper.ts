import type { Product } from '../../domain/product'
import type { BackendAProductDto } from '../dto/backend-a-product.dto'

export function mapBackendAProductDto(dto: BackendAProductDto): Product {
  return {
    category: dto.groupName,
    description: dto.blurb,
    id: dto.sku,
    inventory: dto.stockQty,
    monthlySales: dto.sales30d,
    name: dto.title,
    price: dto.salePrice,
    tags: [...dto.badges],
  }
}
