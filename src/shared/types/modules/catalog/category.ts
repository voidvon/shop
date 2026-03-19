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
  productImageUrl: string
  productName: string
  price: number
  marketPrice: number | null
  storeName: string
  isOwnShop: boolean
}

export interface CategoryListPageData {
  primaryCategories: CatalogCategoryItem[]
  secondaryCategories: CatalogCategoryItem[]
  products: CategoryGoodsItem[]
}
