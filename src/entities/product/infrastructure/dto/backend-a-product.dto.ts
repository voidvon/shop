export interface BackendAProductSpecDto {
  label: string
  value: string
}

export interface BackendAProductSummaryDto {
  badges: string[]
  blurb: string
  coverImage: string | null
  groupName: string
  isListed: boolean
  salePrice: number
  sales30d: number
  sku: string
  stockQty: number
  title: string
}

export interface BackendAProductDetailDto extends BackendAProductSummaryDto {
  detailCopy: string
  galleryImages: string[]
  highlights: string[]
  serviceTags: string[]
  specs: BackendAProductSpecDto[]
}
