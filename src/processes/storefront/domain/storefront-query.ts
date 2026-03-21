import type {
  CategoryPageData,
  HomePageData,
  ProductDetailPageData,
} from './storefront-page-data'

export interface StorefrontQuery {
  getCategoryPageData(): Promise<CategoryPageData>
  getHomePageData(): Promise<HomePageData>
  getProductDetailPageData(productId: string): Promise<ProductDetailPageData | null>
}
