export interface Product {
  id: string
  name: string
  category: string
  description: string
  price: number
  inventory: number
  monthlySales: number
  tags: string[]
}

export function isProductAvailable(product: Product) {
  return product.inventory > 0
}

export function isHighDemandProduct(product: Product) {
  return product.monthlySales >= 320
}
