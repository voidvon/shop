import type {
  CategoryPageCategory,
  CategoryPageProductCard,
  HomePageData,
  ProductDetailPageData,
} from './storefront-page-data'

export interface CategoryProductsQuery {
  categoryId?: string
  keyword?: string
}

export interface StorefrontQuery {
  getCategoryProducts(query?: CategoryProductsQuery): Promise<CategoryPageProductCard[]>
  getCategoryTree(): Promise<CategoryPageCategory[]>
  getHomePageData(): Promise<HomePageData>
  getProductDetailPageData(productId: string): Promise<ProductDetailPageData | null>
}
