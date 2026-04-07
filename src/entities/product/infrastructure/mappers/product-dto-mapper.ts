import { resolveBackendAMediaUrl } from '@/shared/api/backend-a/backend-a-config'

import type {
  BackendAProductDetailDto,
  BackendAProductSkuDto,
  BackendAProductSummaryDto,
} from '../dto/backend-a-product.dto'
import {
  createProductDetailMapper,
  createProductSummaryMapper,
  type ProductDetailFieldMap,
  type ProductSummaryFieldMap,
} from './create-product-mapper'

function resolveActiveSkus(dto: Pick<BackendAProductSummaryDto, 'skus'>) {
  const activeSkus = dto.skus.filter((sku) => sku.status === 1)
  return activeSkus.length > 0 ? activeSkus : dto.skus
}

function parsePrice(price: string) {
  const parsedValue = Number.parseFloat(price)
  return Number.isFinite(parsedValue) ? parsedValue : 0
}

function resolveLowestSkuPrice(dto: BackendAProductSummaryDto) {
  const prices = resolveActiveSkus(dto).map((sku) => parsePrice(sku.price))
  return prices.length > 0 ? Math.min(...prices) : 0
}

function resolveTotalSkuStock(dto: BackendAProductSummaryDto) {
  return resolveActiveSkus(dto).reduce((sum, sku) => sum + sku.stock, 0)
}

function mapProductTags(dto: BackendAProductSummaryDto) {
  return [
    dto.is_recommended === 1 ? '推荐' : null,
    dto.balanceType?.name ?? null,
    dto.merchant?.short_name ?? dto.merchant?.name ?? null,
  ].filter((value): value is string => Boolean(value))
}

function mapProductAttributes(dto: BackendAProductDetailDto) {
  const firstSku = resolveActiveSkus(dto)[0]
  const specs = firstSku?.specs ?? {}

  return Object.entries(specs).map(([label, value]) => ({
    label,
    value: String(value),
  }))
}

function resolveProductGallery(dto: BackendAProductDetailDto) {
  const gallery = [
    ...dto.main_images,
    ...resolveActiveSkus(dto)
      .map((sku) => sku.image)
      .filter((image): image is string => Boolean(image)),
  ]

  return Array.from(
    new Set(
      gallery
        .map((image) => resolveBackendAMediaUrl(image))
        .filter((image): image is string => Boolean(image)),
    ),
  )
}

function mapProductSellingPoints(dto: BackendAProductDetailDto) {
  return [
    dto.subtitle,
    ...resolveActiveSkus(dto)
      .map((sku) => mapSkuSellingPoint(sku))
      .filter((value): value is string => Boolean(value)),
  ].filter((value): value is string => Boolean(value))
}

function mapSkuSellingPoint(sku: BackendAProductSkuDto) {
  const specEntries = Object.entries(sku.specs ?? {})

  if (specEntries.length === 0) {
    return null
  }

  return specEntries
    .map(([label, value]) => `${label}:${String(value)}`)
    .join(' / ')
}

const backendAProductSummaryFieldMap = {
  balanceTypeCode: (dto: BackendAProductSummaryDto) => dto.balanceType?.code ?? null,
  balanceTypeId: (dto: BackendAProductSummaryDto) => String(dto.balance_type_id),
  balanceTypeName: (dto: BackendAProductSummaryDto) => dto.balanceType?.name ?? null,
  category: (dto: BackendAProductSummaryDto) => dto.category?.name ?? '未分类',
  categoryId: (dto: BackendAProductSummaryDto) => String(dto.category?.id ?? dto.product_category_id),
  coverImageUrl: (dto: BackendAProductSummaryDto) =>
    resolveBackendAMediaUrl(dto.main_images[0] ?? resolveActiveSkus(dto)[0]?.image ?? null),
  id: (dto: BackendAProductSummaryDto) => String(dto.id),
  inventory: resolveTotalSkuStock,
  monthlySales: 'sales_count',
  name: 'title',
  price: resolveLowestSkuPrice,
  summary: (dto: BackendAProductSummaryDto) => dto.subtitle ?? dto.detail ?? '',
  tags: mapProductTags,
} satisfies ProductSummaryFieldMap<BackendAProductSummaryDto>

const backendAProductDetailFieldMap = {
  ...backendAProductSummaryFieldMap,
  attributes: mapProductAttributes,
  detailDescription: (dto: BackendAProductDetailDto) => dto.detail ?? dto.subtitle ?? '暂无详情',
  gallery: resolveProductGallery,
  sellingPoints: mapProductSellingPoints,
  serviceLabels: (dto: BackendAProductDetailDto) =>
    [
      dto.is_recommended === 1 ? '推荐商品' : null,
      dto.balanceType?.name ?? null,
    ].filter((value): value is string => Boolean(value)),
} satisfies ProductDetailFieldMap<BackendAProductDetailDto>

export const mapBackendAProductSummaryDto = createProductSummaryMapper(backendAProductSummaryFieldMap)
export const mapBackendAProductDetailDto = createProductDetailMapper(backendAProductDetailFieldMap)
