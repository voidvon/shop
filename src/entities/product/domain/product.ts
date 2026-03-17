export interface ProductSummary {
  id: string
  name: string
  category: string
  summary: string
  price: number
  inventory: number
  monthlySales: number
  tags: string[]
  coverImageUrl: string | null
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
