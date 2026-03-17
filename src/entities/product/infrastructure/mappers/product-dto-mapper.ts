import type { BackendAProductDetailDto, BackendAProductSummaryDto } from '../dto/backend-a-product.dto'
import {
  createProductDetailMapper,
  createProductSummaryMapper,
  type ProductDetailFieldMap,
  type ProductSummaryFieldMap,
} from './create-product-mapper'

const backendAProductSummaryFieldMap = {
  category: 'groupName',
  coverImageUrl: 'coverImage',
  id: 'sku',
  inventory: 'stockQty',
  monthlySales: 'sales30d',
  name: 'title',
  price: 'salePrice',
  summary: 'blurb',
  tags: 'badges',
} satisfies ProductSummaryFieldMap<BackendAProductSummaryDto>

const backendAProductDetailFieldMap = {
  ...backendAProductSummaryFieldMap,
  attributes: (dto: BackendAProductDetailDto) =>
    dto.specs.map((spec) => ({
      label: spec.label,
      value: spec.value,
    })),
  detailDescription: 'detailCopy',
  gallery: 'galleryImages',
  sellingPoints: 'highlights',
  serviceLabels: 'serviceTags',
} satisfies ProductDetailFieldMap<BackendAProductDetailDto>

export const mapBackendAProductSummaryDto = createProductSummaryMapper(backendAProductSummaryFieldMap)
export const mapBackendAProductDetailDto = createProductDetailMapper(backendAProductDetailFieldMap)
