import type {
  CartPageData,
  CategoryPageData,
  HomePageData,
  MemberCardBindPageData,
  MemberCardsPageData,
  MemberCenterPageData,
  OrderListPageData,
  ProductDetailPageData,
} from './page-content'

export interface PageContentGateway {
  getCartPageData(): Promise<CartPageData>
  getCategoryPageData(): Promise<CategoryPageData>
  getHomePageData(): Promise<HomePageData>
  getMemberCardBindPageData(): Promise<MemberCardBindPageData>
  getMemberCardsPageData(): Promise<MemberCardsPageData>
  getMemberCenterPageData(): Promise<MemberCenterPageData>
  getOrderListPageData(): Promise<OrderListPageData>
  getProductDetailPageData(productId: string): Promise<ProductDetailPageData | null>
}
