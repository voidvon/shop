import type { ProductDetail } from '../domain/product'
import type { ProductRepository } from '../domain/product-repository'

export async function getProductDetail(
  repository: ProductRepository,
  productId: string,
): Promise<ProductDetail | null> {
  return repository.getProductDetail(productId)
}
