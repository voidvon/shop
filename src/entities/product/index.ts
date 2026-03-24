export { getFeaturedProductSummaries } from './application/get-featured-products'
export { getProductDetail } from './application/get-product-detail'
export {
  isHighDemandProduct,
  isProductAvailable,
  type ProductAttribute,
  type ProductDetail,
  type ProductSummary,
} from './domain/product'
export type { MerchantProductQuery, ProductRepository, ProductSummaryPage } from './domain/product-repository'
export { backendAProductRepository } from './infrastructure/adapters/backend-a/backend-a-product-repository'
export { mockProductRepository } from './infrastructure/adapters/mock/mock-product-repository'
export { provideProductRepository, useProductRepository } from './infrastructure/product-repository-provider'
export { default as ProductCard } from './ui/ProductCard.vue'
export { default as ProductCompactCard } from './ui/ProductCompactCard.vue'
export { default as ProductDetailView } from './ui/ProductDetailView.vue'
