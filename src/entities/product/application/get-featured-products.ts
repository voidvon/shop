import { isProductAvailable, type ProductSummary } from '../domain/product'
import type { ProductRepository } from '../domain/product-repository'

export async function getFeaturedProductSummaries(
  repository: ProductRepository,
): Promise<ProductSummary[]> {
  const products = await repository.getFeaturedProductSummaries()

  return products
    .filter(isProductAvailable)
    .sort((left, right) => right.monthlySales - left.monthlySales)
}
