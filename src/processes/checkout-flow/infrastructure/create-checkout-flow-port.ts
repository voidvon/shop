import {
  getCartSnapshot,
  getSelectedCartSnapshot,
  type CartRepository,
} from '@/entities/cart'
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
  getProductDetail,
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

async function clearSubmittedCartLines(
  repository: CartRepository,
  command: CreateCheckoutPreviewCommand,
) {
  if (command.source !== 'cart') {
    return
  }

  for (const line of command.lines) {
    await repository.removeItem(line.productId)
  }
}

async function mapCartToCheckoutLines(
  snapshot: Awaited<ReturnType<typeof getCartSnapshot>>,
  productRepository: ProductRepository,
): Promise<CheckoutLine[]> {
  return Promise.all(snapshot.lines.map(async (line) => {
    const productDetail = line.productImageUrl
      ? null
      : await getProductDetail(productRepository, line.productId)

    return createCheckoutLine({
      productId: line.productId,
      productImageUrl: line.productImageUrl ?? productDetail?.coverImageUrl ?? null,
      productName: line.productName,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
    })
  }))
}

function mapProductToInstantLine(product: ProductSummary): CheckoutLine {
  return createCheckoutLine({
    productId: product.id,
    productImageUrl: product.coverImageUrl,
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
      const selectedCartSnapshot = await getSelectedCartSnapshot(options.cartRepository)

      if (selectedCartSnapshot.itemCount === 0) {
        throw new Error('请先选择要结算的商品')
      }

      return {
        lines: await mapCartToCheckoutLines(selectedCartSnapshot, options.productRepository),
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
      await clearSubmittedCartLines(options.cartRepository, command)

      return {
        confirmation,
        preview,
      }
    },
  }
}
