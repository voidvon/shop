export interface CartLine {
  lineTotal: number
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

export interface CartSnapshot {
  itemCount: number
  lines: CartLine[]
  subtotal: number
}

export interface AddCartItemCommand {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

export interface SetCartItemQuantityCommand {
  productId: string
  quantity: number
}

export interface SetCartItemsSelectedCommand {
  productIds: string[]
  selected: boolean
}

function normalizeQuantity(quantity: number) {
  return Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1
}

export function createCartLine(input: AddCartItemCommand): CartLine {
  const quantity = normalizeQuantity(input.quantity)

  return {
    lineTotal: input.unitPrice * quantity,
    productId: input.productId,
    productName: input.productName,
    quantity,
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
