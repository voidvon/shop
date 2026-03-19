export interface SpecialImageLinkItem {
  title: string | null
  imageUrl: string
  linkUrl: string
}

export interface SpecialProductItem {
  productId: string
  productName: string
  productImageUrl: string
  promotionPrice: number
  originalPrice: number | null
}

export interface SpecialCountdown {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export type SpecialModule =
  | {
      type: 'carousel'
      title: string | null
      items: SpecialImageLinkItem[]
    }
  | {
      type: 'single-image'
      title: string | null
      item: SpecialImageLinkItem
    }
  | {
      type: 'triple-image'
      title: string | null
      items: SpecialImageLinkItem[]
    }
  | {
      type: 'image-list'
      title: string | null
      items: SpecialImageLinkItem[]
    }
  | {
      type: 'product-list'
      title: string | null
      items: SpecialProductItem[]
    }
  | {
      type: 'countdown'
      title: string | null
      countdown: SpecialCountdown
    }

export interface SpecialPageData {
  modules: SpecialModule[]
}
