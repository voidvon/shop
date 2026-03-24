import type { ProductSummary } from '@/entities/product'
import type { BackendAProductDetailDto } from '@/entities/product/infrastructure/dto/backend-a-product.dto'
import {
  mapBackendAProductDetailDto,
} from '@/entities/product/infrastructure/mappers/product-dto-mapper'
import { resolveBackendAMediaUrl } from '@/shared/api/backend-a/backend-a-config'

import type {
  CategoryPageCategory,
  CategoryPageProductCard,
  HomePageData,
  PageProductCard,
  ProductDetailPageData,
} from '../../domain/storefront-page-data'

export interface BackendAStorefrontCategoryDto {
  children?: BackendAStorefrontCategoryDto[] | null
  id: number
  logo: string | null
  name: string
  sort: number
}

export interface BackendAStorefrontProductDto {
  category?: {
    id: number
    name: string
  }
  id: number
  main_images?: string[] | null
  skus: Array<{
    image: string | null
    price: string
    status: number
    stock: number
  }>
  status: number
  title: string
}

export interface BackendAStorefrontHomeDto {
  categories?: BackendAStorefrontCategoryDto[] | null
  platform: {
    address: string | null
    banners?: string[] | null
    company_name: string | null
    promo_video?: string | null
  }
  products?: BackendAStorefrontProductDto[] | null
}

function ensureArray<T>(input: T[] | null | undefined): T[] {
  return Array.isArray(input) ? input : []
}

function resolveActiveSkus(product: Pick<BackendAProductDetailDto, 'skus'>) {
  const activeSkus = product.skus.filter((sku) => sku.status === 1)
  return activeSkus.length > 0 ? activeSkus : product.skus
}

function resolveProductPrice(product: BackendAStorefrontProductDto) {
  const activeSkus = product.skus.filter((sku) => sku.status === 1)
  const prices = (activeSkus.length > 0 ? activeSkus : product.skus)
    .map((sku) => Number.parseFloat(sku.price))
    .filter((price) => Number.isFinite(price))

  return prices.length > 0 ? Math.min(...prices) : 0
}

function resolveProductImage(product: BackendAStorefrontProductDto) {
  const productImages = ensureArray(product.main_images)

  return resolveBackendAMediaUrl(
    productImages[0]
    ?? product.skus.find((sku) => sku.status === 1)?.image
    ?? product.skus[0]?.image
    ?? null,
  )
}

function mapBackendAStorefrontProductCard(product: BackendAStorefrontProductDto): PageProductCard {
  return {
    id: String(product.id),
    imageUrl: resolveProductImage(product),
    marketPrice: null,
    name: product.title,
    price: resolveProductPrice(product),
  }
}

function mapCategoryNode(category: BackendAStorefrontCategoryDto): CategoryPageCategory {
  return {
    children: [],
    id: String(category.id),
    imageUrl: resolveBackendAMediaUrl(category.logo),
    label: category.name,
  }
}

function collectLeafCategories(categories: BackendAStorefrontCategoryDto[]): CategoryPageCategory[] {
  return categories.flatMap((category) => {
    const children = ensureArray(category.children)

    if (children.length === 0) {
      return [mapCategoryNode(category)]
    }

    return collectLeafCategories(children)
  })
}

export function mapBackendAProductCard(product: ProductSummary): PageProductCard {
  return {
    id: product.id,
    imageUrl: product.coverImageUrl,
    marketPrice: null,
    name: product.name,
    price: product.price,
  }
}

export function mapBackendACategoryTree(
  categories: BackendAStorefrontCategoryDto[],
): CategoryPageCategory[] {
  return categories.map((category) => {
    const secondaryCategories = collectLeafCategories(ensureArray(category.children))

    return {
      children: secondaryCategories.length > 0 ? secondaryCategories : [mapCategoryNode(category)],
      id: String(category.id),
      imageUrl: resolveBackendAMediaUrl(category.logo),
      label: category.name,
    }
  })
}

export function mapBackendACategoryProducts(
  products: BackendAStorefrontProductDto[],
): CategoryPageProductCard[] {
  return products.map((product) => ({
    categoryId: String(product.category?.id ?? ''),
    categoryName: product.category?.name ?? '未分类',
    id: String(product.id),
    imageUrl: resolveProductImage(product),
    marketPrice: null,
    name: product.title,
    price: resolveProductPrice(product),
  }))
}

export function mapBackendAHomeBanners(data: BackendAStorefrontHomeDto): HomePageData['banners'] {
  const platformBanners = ensureArray(data.platform?.banners)
  const companyName = data.platform?.company_name?.trim() || '平台'
  const bannerDescription = data.platform?.address?.trim() || ''

  return platformBanners.map((banner, index) => ({
    description: bannerDescription,
    eyebrow: companyName,
    imageUrl: resolveBackendAMediaUrl(banner),
    linkUrl: '/',
    title: platformBanners.length > 1 ? `${companyName} ${index + 1}` : companyName,
  }))
}

export function mapBackendAHomePageData(
  data: BackendAStorefrontHomeDto,
): HomePageData {
  const categories = ensureArray(data.categories)
  const banners = mapBackendAHomeBanners(data)
  const promoVideo = resolveBackendAMediaUrl(data.platform?.promo_video)
  const featuredProducts = ensureArray(data.products).map(mapBackendAStorefrontProductCard)

  const quickCategories = categories.map((category) => ({
    id: String(category.id),
    imageUrl: resolveBackendAMediaUrl(category.logo),
    label: category.name,
  }))

  return {
    banners,
    featuredProducts,
    promo_video: promoVideo,
    quickCategories,
  }
}

export function mapBackendAProductDetailPageData(
  productDto: BackendAProductDetailDto,
  recommendedProducts: ProductSummary[],
): ProductDetailPageData {
  const product = mapBackendAProductDetailDto(productDto)
  const skuList = resolveActiveSkus(productDto).map((sku) => ({
    available: sku.stock > 0,
    marketPrice: null,
    price: Number.parseFloat(sku.price) || 0,
    skuId: String(sku.id),
    specText: sku.name?.trim() || '默认规格',
    stock: sku.stock,
  }))
  const defaultSkuId = skuList[0]?.skuId ?? null

  return {
    defaultSkuId,
    product,
    quantity: 1,
    recommendations: recommendedProducts.map(mapBackendAProductCard),
    review: {
      count: 18,
      rate: 0.96,
    },
    selectedSkuId: defaultSkuId,
    skuList,
    store: {
      score: {
        deliveryScore: 4.8,
        descriptionScore: 4.9,
        serviceScore: 4.8,
      },
      storeId: String(productDto.merchant?.id ?? productDto.merchant_id),
      storeName: productDto.merchant?.short_name ?? productDto.merchant?.name ?? 'Backend A 选品馆',
    },
  }
}
