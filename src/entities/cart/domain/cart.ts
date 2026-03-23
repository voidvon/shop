export interface CartLine {
  lineTotal: number
  lineId: string
  productId: string
  productImageUrl?: string | null
  productName: string
  quantity: number
  skuId: string | null
  specText: string | null
  unitPrice: number
}

export interface CartSnapshot {
  itemCount: number
  lines: CartLine[]
  subtotal: number
}

export interface AddCartItemCommand {
  productId: string
  productImageUrl?: string | null
  productName: string
  quantity: number
  skuId?: string | null
  specText?: string | null
  unitPrice: number
}

export interface SetCartItemQuantityCommand {
  lineId: string
  quantity: number
}

export interface SetCartItemsSelectedCommand {
  lineIds: string[]
  selected: boolean
}

function normalizeQuantity(quantity: number) {
  return Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1
}

export function createCartLine(input: AddCartItemCommand): CartLine {
  const quantity = normalizeQuantity(input.quantity)

  return {
    lineTotal: input.unitPrice * quantity,
    lineId: input.skuId ?? input.productId,
    productId: input.productId,
    productImageUrl: input.productImageUrl ?? null,
    productName: input.productName,
    quantity,
    skuId: input.skuId ?? null,
    specText: input.specText ?? null,
    unitPrice: input.unitPrice,
  }
}

export function createCartSnapshot(lines: CartLine[]): CartSnapshot {
  const normalizedLines = lines.map((line) => createCartLine(line))

  return {
    itemCount: normalizedLines.reduce((sum, line) => sum + line.quantity, 0),
    lines: normalizedLines,
    subtotal: normalizedLines.reduce((sum, line) => sum + line.lineTotal, 0),
  }
}

export function createEmptyCartSnapshot(): CartSnapshot {
  return {
    itemCount: 0,
    lines: [],
    subtotal: 0,
  }
}
