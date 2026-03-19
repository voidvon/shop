import type { PageQuery, PageResult } from '../base'

export interface CatalogCategoryItem {
  categoryId: string
  categoryName: string
  imageUrl: string | null
  children: CatalogCategoryItem[]
}

export interface BrandRecommendation {
  brandId: string
  brandName: string
  brandImageUrl: string | null
}

export interface CategoryEntryPageData {
  primaryCategories: CatalogCategoryItem[]
  brandRecommendations: BrandRecommendation[]
}

export interface CategoryGoodsItem {
  productId: string
  storeId: string
  productImageUrl: string
  productName: string
  price: number
  marketPrice: number | null
  storeName: string
  isOwnShop: boolean
}

export interface CategoryListQuery extends PageQuery {
  primaryCategoryId: string | null
  secondaryCategoryId: string | null
}

export interface CategoryListPageData {
  query: CategoryListQuery
  selectedPrimaryCategoryId: string | null
  selectedSecondaryCategoryId: string | null
  primaryCategories: CatalogCategoryItem[]
  secondaryCategories: CatalogCategoryItem[]
  productPage: PageResult<CategoryGoodsItem>
}
