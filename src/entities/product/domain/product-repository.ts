import type { ProductDetail, ProductSummary } from './product'

export interface ProductRepository {
  getFeaturedProductSummaries(): Promise<ProductSummary[]>
  getMerchantProductSummaries(merchantId: string): Promise<ProductSummary[]>
  getProductDetail(productId: string): Promise<ProductDetail | null>
}
