import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { useModuleAvailability } from '@/shared/lib/modules'
import {
  getFeaturedProductSummaries,
  type ProductSummary,
  useProductRepository,
} from '@/entities/product'
import {
  createCheckoutLine,
  createCheckoutPreviewUseCase,
  submitOrder,
  type CheckoutLine,
  type CreateCheckoutPreviewCommand,
  type CheckoutPreview,
  type OrderConfirmation,
  useOrderRepository,
} from '@/entities/order'
import { getCartSnapshot, type CartSnapshot, useCartRepository } from '@/entities/cart'

function mapCartToCheckoutLines(snapshot: CartSnapshot): CheckoutLine[] {
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

export const useCheckoutFlowStore = defineStore('checkout-flow', () => {
  const cartRepository = useCartRepository()
  const orderRepository = useOrderRepository()
  const productRepository = useProductRepository()
  const isCartEnabled = useModuleAvailability('cart')
  const isCheckoutEnabled = useModuleAvailability('checkout')

  const confirmation = ref<OrderConfirmation | null>(null)
  const errorMessage = ref<string | null>(null)
  const hasLoaded = ref(false)
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const preview = ref<CheckoutPreview | null>(null)
  const submissionMessage = ref<string | null>(null)
  const sourceLabel = computed(() =>
    preview.value?.source === 'cart' ? '从购物车进入' : '从立即购买进入',
  )

  async function resolveCheckoutCommand(): Promise<CreateCheckoutPreviewCommand> {
    if (isCartEnabled) {
      const cartSnapshot = await getCartSnapshot(cartRepository)

      if (cartSnapshot.itemCount > 0) {
        return {
          lines: mapCartToCheckoutLines(cartSnapshot),
          source: 'cart',
        }
      }
    }

    const products = await getFeaturedProductSummaries(productRepository)
    const instantProduct = products[0]

    if (!instantProduct) {
      throw new Error('没有可用于立即购买的商品')
    }

    return {
      lines: [mapProductToInstantLine(instantProduct)],
      source: 'instant',
    }
  }

  async function loadPreview() {
    if (!isCheckoutEnabled) {
      preview.value = null
      hasLoaded.value = true
      return
    }

    isLoading.value = true
    errorMessage.value = null

    try {
      const command = await resolveCheckoutCommand()
      preview.value = await createCheckoutPreviewUseCase(orderRepository, command)
      confirmation.value = null
      submissionMessage.value = null
      hasLoaded.value = true
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '结算预览加载失败'
    } finally {
      isLoading.value = false
    }
  }

  async function submitCurrentOrder() {
    if (!isCheckoutEnabled) {
      return
    }

    isSubmitting.value = true
    errorMessage.value = null

    try {
      const command = await resolveCheckoutCommand()
      const result = await submitOrder(orderRepository, command)
      confirmation.value = result
      submissionMessage.value = `订单 ${result.orderId} 已提交，应付 ${result.payableAmount}`
      preview.value = await createCheckoutPreviewUseCase(orderRepository, command)
      return result
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '提交订单失败'
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    confirmation,
    errorMessage,
    hasLoaded,
    isCheckoutEnabled,
    isLoading,
    isSubmitting,
    loadPreview,
    preview,
    sourceLabel,
    submissionMessage,
    submitCurrentOrder,
  }
})
