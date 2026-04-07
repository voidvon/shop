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
  id: number
  main_images: string[]
  merchant?: BackendAMerchantSimpleDto
  title: string
}

export interface BackendACartItemDto {
  balance_type_id: number
  id: number
  merchant?: BackendAMerchantSimpleDto
  merchant_id: number
  product?: BackendAProductSummaryDto
  product_id: number
  product_sku_id: number
  quantity: number
  selected: number
  sku?: BackendAProductSkuDto
  user_id: number
}

export interface BackendACartItemPayloadDto {
  product_sku_id?: number
  quantity?: number
  selected?: boolean
}
