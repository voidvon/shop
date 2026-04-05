import {
  createCartSnapshot,
  getCartSnapshot,
  type CartRepository,
} from '@/entities/cart'
import {
  createCheckoutPreview,
  createCheckoutPreviewUseCase,
  createCheckoutLine,
  submitOrder,
  type CheckoutLine,
  type CreateCheckoutPreviewCommand,
  type OrderRepository,
  type SubmitOrderCommand,
} from '@/entities/order'
import {
  getFeaturedProductSummaries,
  getProductDetail,
  type ProductRepository,
  type ProductSummary,
} from '@/entities/product'

import type {
  CheckoutFlowPort,
  SubmitCheckoutOrderCommand,
  SubmitCheckoutOrderResult,
} from '../domain/checkout-flow-port'

interface CreateCheckoutFlowPortOptions {
  allowInstantFallback?: boolean
  cartRepository: CartRepository
  clearCartAfterSubmit?: boolean
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
    await repository.removeItem(line.lineId ?? line.productId)
  }
}

async function rebuildPostSubmitPreview(
  options: CreateCheckoutFlowPortOptions,
  command: CreateCheckoutPreviewCommand,
) {
  if (options.clearCartAfterSubmit === false) {
    const selectedLines = (await getCartSnapshot(options.cartRepository)).lines.filter((line) => line.selected)

    if (selectedLines.length === 0) {
      return createCheckoutPreview({
        lines: [],
        source: command.source,
      })
    }

    return createCheckoutPreviewUseCase(options.orderRepository, {
      lines: await mapCartToCheckoutLines(createCartSnapshot(selectedLines), options.productRepository),
      source: 'cart',
    })
  }

  return createCheckoutPreviewUseCase(options.orderRepository, command)
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
      lineId: line.lineId,
      productId: line.productId,
      productImageUrl: line.productImageUrl ?? productDetail?.coverImageUrl ?? null,
      productName: line.productName,
      quantity: line.quantity,
      skuId: line.skuId,
      specText: line.specText,
      unitPrice: line.unitPrice,
    })
  }))
}

function mapProductToInstantLine(product: ProductSummary): CheckoutLine {
  return createCheckoutLine({
    lineId: product.id,
    productId: product.id,
    productImageUrl: product.coverImageUrl,
    productName: product.name,
    quantity: 1,
    skuId: null,
    specText: null,
    unitPrice: product.price,
  })
}

async function resolveCheckoutCommand(
  options: CreateCheckoutFlowPortOptions,
): Promise<CreateCheckoutPreviewCommand> {
  if (options.isCartEnabled) {
    const cartSnapshot = await getCartSnapshot(options.cartRepository)

    if (cartSnapshot.itemCount > 0) {
      const selectedLines = cartSnapshot.lines.filter((line) => line.selected)

      if (selectedLines.length === 0) {
        throw new Error('请先选择要结算的商品')
      }

      return {
        lines: await mapCartToCheckoutLines(createCartSnapshot(selectedLines), options.productRepository),
        source: 'cart',
      }
    }
  }

  if (options.allowInstantFallback === false) {
    throw new Error('请先选择要结算的商品')
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

    async submit(submitCommand?: SubmitCheckoutOrderCommand): Promise<SubmitCheckoutOrderResult> {
      const command = await resolveCheckoutCommand(options)
      const orderCommand: SubmitOrderCommand = {
        ...command,
        addressId: submitCommand?.addressId ?? null,
        couponUsages: submitCommand?.couponUsages ?? [],
        remark: submitCommand?.remark ?? null,
      }
      const confirmation = await submitOrder(options.orderRepository, orderCommand)

      if (options.clearCartAfterSubmit !== false) {
        await clearSubmittedCartLines(options.cartRepository, command)
      }

      const preview = await rebuildPostSubmitPreview(options, command)

      return {
        confirmation,
        preview,
      }
    },
  }
}
