export interface ProductSummary {
  balanceTypeCode?: string | null
  balanceTypeId?: string | null
  balanceTypeName?: string | null
  id: string
  hasDirectRechargeSku?: boolean
  categoryId: string
  name: string
  category: string
  subtitle: string | null
  summary: string
  price: number
  inventory: number
  monthlySales: number
  productType?: string | null
  priceText?: string | null
  tags: string[]
  coverImageUrl: string | null
  virtualAccountDescription?: string | null
  virtualAccountLabel?: string | null
}

export interface ProductAttribute {
  label: string
  value: string
}

export interface ProductDetail extends ProductSummary {
  detailDescription: string
  gallery: string[]
  sellingPoints: string[]
  attributes: ProductAttribute[]
  serviceLabels: string[]
}

export function isProductAvailable(product: Pick<ProductSummary, 'inventory'>) {
  return product.inventory > 0
}

export function isHighDemandProduct(product: Pick<ProductSummary, 'monthlySales'>) {
  return product.monthlySales >= 320
}

export function isDirectRechargeSku(
  sku: Pick<{ thirdPartyGoodsTypeLabel?: string | null }, 'thirdPartyGoodsTypeLabel'>,
) {
  return sku.thirdPartyGoodsTypeLabel?.trim() === '直充'
}

export function isDirectRechargeProduct(product: Pick<ProductSummary, 'hasDirectRechargeSku'>) {
  return product.hasDirectRechargeSku === true
}

export function isVirtualProduct(product: Pick<ProductSummary, 'productType'>) {
  return product.productType === 'virtual'
}
