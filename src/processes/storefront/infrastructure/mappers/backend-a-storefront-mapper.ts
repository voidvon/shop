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
  HomePartnerStoreType,
  MerchantCoupon,
  PartnerStoreMerchant,
  PartnerStoreRegion,
  PageProductCard,
  PlatformSettingsData,
  ProductDetailPageData,
  StoreHomePageData,
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
  sales_count: number
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
    [key: string]: unknown
  }
  products?: BackendAStorefrontProductDto[] | null
  [key: string]: unknown
}

export interface BackendAPlatformSettingsDto {
  address: string | null
  business_phone: string | null
  company_name: string | null
  customer_service_phone: string | null
  customer_service_wechat: string | null
  domain: string | null
  icp_number: string | null
  logo: string | null
}

export interface BackendAPartnerMerchantDto {
  [key: string]: unknown
}

export interface BackendAPartnerStoreTypeDto {
  [key: string]: unknown
}

export interface BackendAPartnerRegionDto {
  [key: string]: unknown
}

export interface BackendAPartnerMerchantSummaryDto {
  [key: string]: unknown
}

export interface BackendAMerchantCouponDto {
  [key: string]: unknown
}

interface MapBackendAStoreHomePageDataInput {
  merchant: BackendAPartnerMerchantDto | null
  products: ProductSummary[]
  storeId: string
}

function ensureArray<T>(input: T[] | null | undefined): T[] {
  return Array.isArray(input) ? input : []
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function pickRecord(input: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = input[key]

    if (isRecord(value)) {
      return value
    }
  }

  return null
}

function pickStringFromSources(sources: Array<Record<string, unknown> | null>, keys: string[]) {
  for (const source of sources) {
    if (!source) {
      continue
    }

    for (const key of keys) {
      const value = source[key]

      if (typeof value === 'string' && value.trim()) {
        return value.trim()
      }
    }
  }

  return null
}

function pickStringLikeFromSources(sources: Array<Record<string, unknown> | null>, keys: string[]) {
  for (const source of sources) {
    if (!source) {
      continue
    }

    for (const key of keys) {
      const value = source[key]

      if (typeof value === 'string' && value.trim()) {
        return value.trim()
      }

      if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value)
      }
    }
  }

  return null
}

function pickNumberFromSources(sources: Array<Record<string, unknown> | null>, keys: string[]) {
  for (const source of sources) {
    if (!source) {
      continue
    }

    for (const key of keys) {
      const value = source[key]

      if (typeof value === 'number' && Number.isFinite(value)) {
        return value
      }

      if (typeof value === 'string' && value.trim()) {
        const parsedValue = Number.parseFloat(value)

        if (Number.isFinite(parsedValue)) {
          return parsedValue
        }
      }
    }
  }

  return null
}

function pickBooleanFromSources(sources: Array<Record<string, unknown> | null>, keys: string[]) {
  for (const source of sources) {
    if (!source) {
      continue
    }

    for (const key of keys) {
      const value = source[key]

      if (typeof value === 'boolean') {
        return value
      }

      if (typeof value === 'number') {
        return value > 0
      }

      if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase()

        if (['1', 'true', 'yes', 'y'].includes(normalized)) {
          return true
        }

        if (['0', 'false', 'no', 'n'].includes(normalized)) {
          return false
        }
      }
    }
  }

  return null
}

function pickStringArrayFromSources(sources: Array<Record<string, unknown> | null>, keys: string[]) {
  for (const source of sources) {
    if (!source) {
      continue
    }

    for (const key of keys) {
      const value = source[key]

      if (Array.isArray(value)) {
        const items = value
          .map((item) => (typeof item === 'string' ? item.trim() : ''))
          .filter(Boolean)

        if (items.length > 0) {
          return items
        }
      }

      if (typeof value === 'string' && value.trim()) {
        const items = value
          .split(/[、,，|]/)
          .map((item) => item.trim())
          .filter(Boolean)

        if (items.length > 0) {
          return items
        }
      }
    }
  }

  return []
}

function pickArrayFromSources(sources: Array<Record<string, unknown> | null>, keys: string[]) {
  for (const source of sources) {
    if (!source) {
      continue
    }

    for (const key of keys) {
      const value = source[key]

      if (Array.isArray(value)) {
        return value
      }
    }
  }

  return []
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
    monthlySales: product.sales_count,
    name: product.title,
    price: resolveProductPrice(product),
  }
}

function mapCategoryNode(category: BackendAStorefrontCategoryDto): CategoryPageCategory {
  return {
    children: ensureArray(category.children).map(mapCategoryNode),
    id: String(category.id),
    imageUrl: resolveBackendAMediaUrl(category.logo),
    label: category.name,
  }
}

export function mapBackendAProductCard(product: ProductSummary): PageProductCard {
  return {
    id: product.id,
    imageUrl: product.coverImageUrl,
    marketPrice: null,
    monthlySales: product.monthlySales,
    name: product.name,
    price: product.price,
  }
}

export function mapBackendACategoryTree(
  categories: BackendAStorefrontCategoryDto[],
): CategoryPageCategory[] {
  return categories.map(mapCategoryNode)
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
    monthlySales: product.sales_count,
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

function mapHomePartnerStoreType(item: unknown, index: number): HomePartnerStoreType | null {
  if (typeof item === 'string' && item.trim()) {
    const label = item.trim()

    return {
      id: label,
      imageUrl: null,
      label,
    }
  }

  if (!isRecord(item)) {
    return null
  }

  const sources = [item]
  const label = pickStringFromSources(sources, [
    'name',
    'label',
    'title',
    'type_name',
    'typeName',
    'store_type_name',
    'storeTypeName',
    'merchant_type_name',
    'merchantTypeName',
  ])

  if (!label) {
    return null
  }

  const id = pickStringLikeFromSources(sources, [
    'id',
    'code',
    'value',
    'slug',
    'key',
    'type_id',
    'typeId',
    'store_type_id',
    'storeTypeId',
    'merchant_type_id',
    'merchantTypeId',
  ]) ?? `${label}-${index}`
  const imageUrl = resolveBackendAMediaUrl(
    pickStringFromSources(sources, [
      'banner_image',
      'bannerImage',
      'promo_image',
      'promoImage',
      'cover',
      'cover_image',
      'coverImage',
      'image',
      'logo',
    ]),
  )

  return {
    id,
    imageUrl,
    label,
  }
}

function mapBackendAPartnerStoreTypeList(
  items: unknown[],
): HomePartnerStoreType[] {
  return items
    .map((item, index) => mapHomePartnerStoreType(item, index))
    .filter((item): item is HomePartnerStoreType => item !== null)
}

export function mapBackendAPartnerStoreTypes(
  data: BackendAStorefrontHomeDto | BackendAPartnerStoreTypeDto[],
): HomePartnerStoreType[] {
  if (Array.isArray(data)) {
    return mapBackendAPartnerStoreTypeList(data)
  }

  const rootSource = isRecord(data) ? data : null
  const platformSource = isRecord(data.platform) ? data.platform : null
  const sources = [rootSource, platformSource]
  const items = pickArrayFromSources(sources, [
    'partner_merchant_types',
    'partnerMerchantTypes',
    'merchant_types',
    'merchantTypes',
    'store_types',
    'storeTypes',
    'cooperative_store_types',
    'cooperativeStoreTypes',
  ])

  return mapBackendAPartnerStoreTypeList(items)
}

export function mapBackendAPartnerRegions(
  items: BackendAPartnerRegionDto[],
): PartnerStoreRegion[] {
  return items
    .map((item, index) => {
      const sources = [item]
      const label = pickStringFromSources(sources, ['name', 'label', 'title'])

      if (!label) {
        return null
      }

      const id = pickStringLikeFromSources(sources, ['id', 'code', 'value', 'key']) ?? `${label}-${index}`

      return {
        id,
        label,
      }
    })
    .filter((item): item is PartnerStoreRegion => item !== null)
}

export function mapBackendAPartnerMerchants(
  items: BackendAPartnerMerchantSummaryDto[],
): PartnerStoreMerchant[] {
  return items
    .map((item, index) => {
      const rootSource = isRecord(item) ? item : null
      const nestedMerchantSource = rootSource ? pickRecord(rootSource, ['merchant', 'partnerMerchant', 'store', 'detail']) : null
      const regionSource = rootSource
        ? pickRecord(rootSource, ['region', 'partner_region'])
          ?? (nestedMerchantSource ? pickRecord(nestedMerchantSource, ['region', 'partner_region']) : null)
        : null
      const sources = [nestedMerchantSource, rootSource]
      const storeTypes = pickArrayFromSources(sources, [
        'partner_merchant_types',
        'partnerMerchantTypes',
        'merchant_types',
        'merchantTypes',
        'store_types',
        'storeTypes',
        'cooperative_store_types',
        'cooperativeStoreTypes',
      ])
      const name = pickStringFromSources(
        sources,
        ['name', 'title', 'merchant_name', 'merchantName', 'store_name', 'storeName'],
      )

      if (!name) {
        return null
      }

      const imageUrl = resolveBackendAMediaUrl(
        pickStringFromSources(
          sources,
          ['logo', 'logo_url', 'logoUrl', 'image', 'cover', 'avatar'],
        ),
      )

      return {
        address:
          pickStringFromSources(
            [nestedMerchantSource, rootSource, regionSource],
            ['detailed_address', 'detailedAddress', 'address', 'detail_address', 'detailAddress', 'location'],
          )
          ?? '地址待补充',
        businessHours: pickStringFromSources(
          sources,
          ['business_hours', 'businessHours', 'opening_hours', 'openingHours'],
        ) ?? null,
        id: pickStringLikeFromSources(sources, ['id', 'merchant_id', 'merchantId', 'store_id', 'storeId']) ?? `${name}-${index}`,
        imageUrl,
        name,
        phone: pickStringFromSources(
          sources,
          ['contact_phone', 'contactPhone', 'phone', 'mobile', 'tel', 'telephone'],
        ) ?? null,
        regionName: pickStringFromSources([regionSource], ['name', 'label', 'title']) ?? null,
        shortName: pickStringFromSources(sources, ['short_name', 'shortName']) ?? null,
        storeTypeLabels: storeTypes
          .filter(isRecord)
          .map((storeType) => pickStringFromSources([storeType], ['name', 'label', 'title']))
          .filter((label): label is string => Boolean(label)),
      }
    })
    .filter((item): item is PartnerStoreMerchant => item !== null)
}

export function mapBackendAMerchantCoupons(
  items: BackendAMerchantCouponDto[],
): MerchantCoupon[] {
  return ensureArray(items)
    .map((item) => {
      const sources = [isRecord(item) ? item : null]
      const id = pickStringLikeFromSources(sources, ['id'])
      const name = pickStringFromSources(sources, ['name'])

      if (!id || !name) {
        return null
      }

      return {
        discountAmount: pickNumberFromSources(sources, ['discount_amount', 'discountAmount']),
        discountRate: pickNumberFromSources(sources, ['discount_rate', 'discountRate']),
        endsAt: pickStringFromSources(sources, ['ends_at', 'endsAt']),
        id,
        merchantId: pickStringLikeFromSources(sources, ['merchant_id', 'merchantId']) ?? '',
        minimumAmount: pickNumberFromSources(sources, ['minimum_amount', 'minimumAmount']) ?? 0,
        name,
        perUserLimit: Math.max(
          pickNumberFromSources(sources, ['per_user_limit', 'perUserLimit']) ?? 1,
          0,
        ),
        scopeType: pickStringFromSources(sources, ['scope_type', 'scopeType']) ?? 'all',
        startsAt: pickStringFromSources(sources, ['starts_at', 'startsAt']),
        totalQuantity: pickNumberFromSources(sources, ['total_quantity', 'totalQuantity']),
        type: pickStringFromSources(sources, ['type']) ?? 'full_reduction',
        userCouponsCount: Math.max(
          pickNumberFromSources(sources, ['user_coupons_count', 'userCouponsCount']) ?? 0,
          0,
        ),
      }
    })
    .filter((item): item is MerchantCoupon => item !== null)
}

export function mapBackendAHomePageData(
  data: BackendAStorefrontHomeDto,
): HomePageData {
  const categories = ensureArray(data.categories)
  const banners = mapBackendAHomeBanners(data)
  const promoVideo = resolveBackendAMediaUrl(data.platform?.promo_video)
  const featuredProducts = ensureArray(data.products).map(mapBackendAStorefrontProductCard)
  const partnerStoreTypes = mapBackendAPartnerStoreTypes(data)

  const quickCategories = categories.map((category) => ({
    id: String(category.id),
    imageUrl: resolveBackendAMediaUrl(category.logo),
    label: category.name,
  }))

  return {
    banners,
    featuredProducts,
    partnerStoreTypes,
    promo_video: promoVideo,
    quickCategories,
  }
}

export function mapBackendAPlatformSettingsData(
  data: BackendAPlatformSettingsDto,
): PlatformSettingsData {
  return {
    address: data.address?.trim() || null,
    businessPhone: data.business_phone?.trim() || null,
    companyName: data.company_name?.trim() || '平台信息待完善',
    customerServicePhone: data.customer_service_phone?.trim() || null,
    customerServiceWechat: data.customer_service_wechat?.trim() || null,
    domain: data.domain?.trim() || null,
    icpNumber: data.icp_number?.trim() || null,
    logoUrl: resolveBackendAMediaUrl(data.logo),
  }
}

export function mapBackendAStoreHomePageData(
  input: MapBackendAStoreHomePageDataInput,
): StoreHomePageData {
  const rootSource = input.merchant && isRecord(input.merchant) ? input.merchant : {}
  const nestedMerchantSource = pickRecord(rootSource, ['merchant', 'partnerMerchant', 'store', 'detail'])
  const sources = [rootSource, nestedMerchantSource]
  const storeName =
    pickStringFromSources(sources, ['short_name', 'shortName', 'store_name', 'storeName', 'name', 'title'])
    ?? input.products[0]?.tags.find((tag) => !tag.includes('推荐'))
    ?? `店铺 ${input.storeId}`
  const storeLogoUrl = resolveBackendAMediaUrl(
    pickStringFromSources(sources, ['logo', 'logo_url', 'logoUrl', 'image', 'cover', 'avatar']),
  )
  const followerCount = pickNumberFromSources(
    sources,
    ['follower_count', 'followerCount', 'fans_count', 'fansCount', 'favorite_count', 'favoriteCount'],
  ) ?? 0
  const businessHours = pickStringFromSources(
    sources,
    ['business_hours', 'businessHours', 'opening_hours', 'openingHours'],
  )
  const phone = pickStringFromSources(
    sources,
    ['phone', 'mobile', 'tel', 'telephone', 'contact_phone', 'customer_service_phone'],
  )
  const address = pickStringFromSources(
    sources,
    ['address', 'detail_address', 'detailAddress', 'location', 'merchant_address'],
  )
  const summary = pickStringFromSources(
    sources,
    ['summary', 'description', 'intro', 'introduction', 'content', 'remark'],
  )
  const benefitTips = pickStringArrayFromSources(
    sources,
    ['benefit_tips', 'benefitTips', 'service_tags', 'serviceTags', 'tags', 'advantages'],
  )

  return {
    address,
    benefitTips,
    businessHours,
    followerCount,
    isFavorited: pickBooleanFromSources(sources, ['is_favorited', 'isFavorited', 'favorited']) ?? false,
    phone,
    products: input.products,
    storeId:
      pickStringFromSources(sources, ['store_id', 'storeId', 'merchant_id', 'merchantId', 'id'])
      ?? input.storeId,
    storeLogoUrl,
    storeName,
    summary,
    tabs: ['home', 'all-products', 'new-products', 'promotions'],
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
