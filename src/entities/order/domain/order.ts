export interface CheckoutLine {
  lineTotal: number
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

export interface CreateCheckoutPreviewCommand {
  lines: CheckoutLine[]
  source: 'cart' | 'instant'
}

export interface CheckoutPreview {
  discountAmount: number
  lines: CheckoutLine[]
  payableAmount: number
  source: 'cart' | 'instant'
  subtotalAmount: number
}

export interface SubmitOrderCommand extends CreateCheckoutPreviewCommand {}

export interface OrderConfirmation {
  orderId: string
  payableAmount: number
  source: 'cart' | 'instant'
  submittedAt: string
}

export function createCheckoutLine(input: Omit<CheckoutLine, 'lineTotal'> & { lineTotal?: number }): CheckoutLine {
  const quantity = Number.isFinite(input.quantity) && input.quantity > 0 ? Math.floor(input.quantity) : 1
  const lineTotal = input.lineTotal ?? input.unitPrice * quantity

  return {
    lineTotal,
    productId: input.productId,
    productName: input.productName,
    quantity,
    unitPrice: input.unitPrice,
  }
}

export function createCheckoutPreview(
  command: CreateCheckoutPreviewCommand,
  discountAmount = 0,
): CheckoutPreview {
  const lines = command.lines.map((line) => createCheckoutLine(line))
  const subtotalAmount = lines.reduce((sum, line) => sum + line.lineTotal, 0)

  return {
    discountAmount,
    lines,
    payableAmount: Math.max(subtotalAmount - discountAmount, 0),
    source: command.source,
    subtotalAmount,
  }
}
