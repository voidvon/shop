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
  third_party_goods_type?: number | null
  third_party_goods_type_label?: string | null
  virtual_daily_purchase_limit?: number | null
  virtual_delivery_mode?: string | null
  virtual_order_quantity_limit?: number | null
  virtual_valid_until?: string | null
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
  product_type?: string | null
  sales_count: number
  skus: BackendAProductSkuDto[]
  sort: number
  status: number
  subtitle: string | null
  title: string
  virtual_account_description?: string | null
  virtual_account_label?: string | null
}

export interface BackendAProductDetailDto extends BackendAProductSummaryDto {}
