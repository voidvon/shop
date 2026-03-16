import type { Product } from './product'

export interface ProductRepository {
  getFeaturedProducts(): Promise<Product[]>
}
