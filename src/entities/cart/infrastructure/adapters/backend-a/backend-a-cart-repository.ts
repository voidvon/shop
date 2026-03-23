import { createBackendAHttpClient } from '@/shared/api/backend-a/backend-a-http-client'
import type { MemberAuthSession } from '@/entities/member-auth'

import type { CartRepository } from '../../../domain/cart-repository'
import type {
  BackendACartItemDto,
  BackendACartItemPayloadDto,
} from '../../dto/backend-a-cart.dto'
import { mapBackendACartSnapshotDto } from '../../mappers/cart-dto-mapper'

interface BackendAProductDetailDto {
  id: number
  skus: Array<{
    id: number
    status: number
  }>
}

function createBackendACartHttpClient(memberAuthSession: MemberAuthSession) {
  return createBackendAHttpClient({
    getAccessToken: () => memberAuthSession.getSnapshot().authResult?.session.accessToken ?? null,
  })
}

function normalizeSkuId(value: string) {
  const parsedValue = Number.parseInt(value, 10)

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    throw new Error('购物车 SKU 标识无效')
  }

  return parsedValue
}

function resolvePrimarySkuId(product: BackendAProductDetailDto) {
  const activeSku = product.skus.find((sku) => sku.status === 1) ?? product.skus[0]

  if (!activeSku) {
    throw new Error('当前商品暂无可用规格')
  }

  return activeSku.id
}

async function resolveCartSkuId(
  httpClient: ReturnType<typeof createBackendAHttpClient>,
  command: Parameters<CartRepository['addItem']>[0],
) {
  if (command.skuId) {
    return normalizeSkuId(command.skuId)
  }

  const productId = encodeURIComponent(command.productId)
  const product = await httpClient.get<BackendAProductDetailDto>(`/api/v1/products/${productId}`)
  return resolvePrimarySkuId(product)
}

async function fetchCartItems(
  httpClient: ReturnType<typeof createBackendAHttpClient>,
) {
  return httpClient.get<BackendACartItemDto[]>('/api/v1/cart-items')
}

function createUpdateCartPayload(input: { quantity?: number; selected?: boolean }) {
  const payload: Record<string, unknown> = {}

  if (input.quantity !== undefined) {
    payload.quantity = Math.max(1, Math.floor(input.quantity))
  }

  if (input.selected !== undefined) {
    payload.selected = input.selected
  }

  return payload
}

export function createBackendACartRepository(
  memberAuthSession: MemberAuthSession,
): CartRepository {
  const httpClient = createBackendACartHttpClient(memberAuthSession)

  async function getSnapshotItems() {
    const items = await fetchCartItems(httpClient)
    return items
  }

  return {
    async addItem(command) {
      const productSkuId = await resolveCartSkuId(httpClient, command)

      await httpClient.post<BackendACartItemDto>('/api/v1/cart-items', {
        product_sku_id: productSkuId,
        quantity: Math.max(1, Math.floor(command.quantity)),
        selected: true,
      })

      return mapBackendACartSnapshotDto(await getSnapshotItems())
    },

    async getSnapshot() {
      return mapBackendACartSnapshotDto(await getSnapshotItems())
    },

    async getSelectedSnapshot() {
      const items = await getSnapshotItems()
      return mapBackendACartSnapshotDto(items.filter((item) => item.selected === 1))
    },

    async removeItem(lineId) {
      await httpClient.delete<null>(`/api/v1/cart-items/${encodeURIComponent(lineId)}`)
      return mapBackendACartSnapshotDto(await getSnapshotItems())
    },

    async setItemQuantity({ lineId, quantity }) {
      await httpClient.patch<BackendACartItemDto>(
        `/api/v1/cart-items/${encodeURIComponent(lineId)}`,
        createUpdateCartPayload({ quantity }),
      )

      return mapBackendACartSnapshotDto(await getSnapshotItems())
    },

    async setItemsSelected({ lineIds, selected }) {
      await Promise.all(lineIds.map((lineId) =>
        httpClient.patch<BackendACartItemDto>(
          `/api/v1/cart-items/${encodeURIComponent(lineId)}`,
          createUpdateCartPayload({ selected }),
        )))

      const items = await getSnapshotItems()
      return mapBackendACartSnapshotDto(items.filter((item) => item.selected === 1))
    },
  }
}
