import { getCartSnapshot, type CartRepository } from '@/entities/cart'
import {
  createCheckoutPreviewUseCase,
  createCheckoutLine,
  submitOrder,
  type CheckoutLine,
  type CreateCheckoutPreviewCommand,
  type OrderRepository,
} from '@/entities/order'
import {
  getFeaturedProductSummaries,
  type ProductRepository,
  type ProductSummary,
} from '@/entities/product'

import type { CheckoutFlowPort, SubmitCheckoutOrderResult } from '../domain/checkout-flow-port'

interface CreateCheckoutFlowPortOptions {
  cartRepository: CartRepository
  isCartEnabled: boolean
  orderRepository: OrderRepository
  productRepository: ProductRepository
}

function mapCartToCheckoutLines(snapshot: Awaited<ReturnType<typeof getCartSnapshot>>): CheckoutLine[] {
  return snapshot.lines.map((line) =>
    createCheckoutLine({
      productId: line.productId,
      productName: line.productName,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
    }),
  )
}

function mapProductToInstantLine(product: ProductSummary): CheckoutLine {
  return createCheckoutLine({
    productId: product.id,
    productName: product.name,
    quantity: 1,
    unitPrice: product.price,
  })
}

async function resolveCheckoutCommand(
  options: CreateCheckoutFlowPortOptions,
): Promise<CreateCheckoutPreviewCommand> {
  if (options.isCartEnabled) {
    const cartSnapshot = await getCartSnapshot(options.cartRepository)

    if (cartSnapshot.itemCount > 0) {
      return {
        lines: mapCartToCheckoutLines(cartSnapshot),
        source: 'cart',
      }
    }
  }

  const products = await getFeaturedProductSummaries(options.productRepository)
  const instantProduct = products[0]

  if (!instantProduct) {
    throw new Error('没有可用于立即购买的商品')
  }

  return {
    lines: [mapProductToInstantLine(instantProduct)],
    source: 'instant',
  }
}

export function createCheckoutFlowPort(options: CreateCheckoutFlowPortOptions): CheckoutFlowPort {
  return {
    async getPreview() {
      const command = await resolveCheckoutCommand(options)
      return createCheckoutPreviewUseCase(options.orderRepository, command)
    },

    async submit(): Promise<SubmitCheckoutOrderResult> {
      const command = await resolveCheckoutCommand(options)
      const confirmation = await submitOrder(options.orderRepository, command)
      const preview = await createCheckoutPreviewUseCase(options.orderRepository, command)

      return {
        confirmation,
        preview,
      }
    },
  }
}
