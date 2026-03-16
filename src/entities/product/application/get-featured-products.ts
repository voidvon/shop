import { isProductAvailable, type Product } from '../domain/product'
import type { ProductRepository } from '../domain/product-repository'

export async function getFeaturedProducts(repository: ProductRepository): Promise<Product[]> {
  const products = await repository.getFeaturedProducts()

  return products
    .filter(isProductAvailable)
    .sort((left, right) => right.monthlySales - left.monthlySales)
}
