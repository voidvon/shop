import type { ProductDetail, ProductSummary } from './product'

export interface ProductSummaryPage {
  currentPage: number
  items: ProductSummary[]
  lastPage: number
  perPage: number
  total: number
}

export interface MerchantProductQuery {
  categoryId?: string
  keyword?: string
  maxPrice?: number
  minPrice?: number
  perPage?: number
  sortBy?: 'id' | 'price' | 'sales_count'
  sortDir?: 'asc' | 'desc'
}

export interface ProductRepository {
  getFeaturedProductSummaries(): Promise<ProductSummary[]>
  getMerchantProductSummaryPage(merchantId: string, query?: MerchantProductQuery): Promise<ProductSummaryPage>
  getMerchantProductSummaries(merchantId: string, query?: MerchantProductQuery): Promise<ProductSummary[]>
  getProductDetail(productId: string): Promise<ProductDetail | null>
}
