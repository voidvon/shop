export interface BackendAProductCategoryDto {
  children: BackendAProductCategoryDto[]
  id: number
  logo: string | null
  name: string
  sort: number
}

export interface BackendAMerchantSimpleDto {
  id: number
  logo: string | null
  name: string
  short_name: string | null
}

export interface BackendABalanceTypeSimpleDto {
  code: string
  id: number
  name: string
}

export interface BackendAProductSkuDto {
  id: number
  image: string | null
  name: string
  price: string
  sales_count: number
  sku_code: string | null
  specs: Record<string, unknown> | null
  status: number
  stock: number
}

export interface BackendAProductSummaryDto {
  balanceType?: BackendABalanceTypeSimpleDto
  balance_type_id: number
  category?: BackendAProductCategoryDto
  detail: string | null
  id: number
  is_recommended: number
  main_images: string[]
  merchant?: BackendAMerchantSimpleDto
  merchant_id: number
  product_category_id: number
  sales_count: number
  skus: BackendAProductSkuDto[]
  sort: number
  status: number
  subtitle: string | null
  title: string
}

export interface BackendAProductDetailDto extends BackendAProductSummaryDto {}
