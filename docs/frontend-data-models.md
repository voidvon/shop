# 前端数据模型总表

## 1. 统计口径

本文档统计的是项目内可复用、可命名、可被页面或适配层消费的前端数据模型，包含：

- `src/shared/types/modules/*` 下的共享业务契约模型
- `src/entities/*/domain` 下的实体领域模型
- `src/processes/*/domain` 下的流程页数据模型
- `src/entities/*/infrastructure/dto/*` 下的后端 DTO 模型

本文档不计入以下内容：

- 组件内部仅用于渲染的小型局部 `type` / `interface`
- `Repository` / `Query` / `Port` 这类行为接口
- `RouteMeta`、组件 props 这类非业务核心结构

## 2. 汇总

| 层级 | 数量 | 说明 |
| --- | ---: | --- |
| 共享业务契约层 | 122 | 面向业务模块的页面数据、列表项、查询参数、操作权限等 |
| 实体领域层 | 11 | `product` / `cart` / `order` 三个核心实体 |
| 流程页数据层 | 29 | `storefront` / `trade` / `member-center` / `checkout-flow` 聚合模型 |
| DTO 层 | 5 | 当前仅 `backend-a` 产品与购物车 DTO |
| 合计 | 167 | 以上四层相加 |

补充说明：

- 页面状态入口另外有 **13 个**，见本文第 7 节。
- 项目中同时存在一套较完整的 `shared/types/modules/*` 业务契约模型，以及一套正在实际驱动页面的 `entities + processes` 模型。

## 3. 共享业务契约层

### 3.1 通用基座

| 文件 | 数量 | 模型 |
| --- | ---: | --- |
| `src/shared/types/modules/base.ts` | 6 | `PageQuery`, `PageResult`, `CursorPageResult`, `AmountDetail`, `ActionPermission`, `OperationState` |

### 3.2 public 模块

| 文件 | 数量 | 模型 |
| --- | ---: | --- |
| `src/shared/types/modules/public/discovery.ts` | 8 | `PublicBannerItem`, `HomeCategoryEntry`, `PublicProductCard`, `HomePageData`, `SearchPageData`, `StoreAreaItem`, `StoreSummary`, `StoreAreaPageData` |
| `src/shared/types/modules/public/store.ts` | 3 | `StoreHomeTabKey`, `StoreRecommendProduct`, `StoreHomeData` |
| `src/shared/types/modules/public/special.ts` | 5 | `SpecialImageLinkItem`, `SpecialProductItem`, `SpecialCountdown`, `SpecialModule`, `SpecialPageData` |

### 3.3 catalog 模块

| 文件 | 数量 | 模型 |
| --- | ---: | --- |
| `src/shared/types/modules/catalog/category.ts` | 6 | `CatalogCategoryItem`, `BrandRecommendation`, `CategoryEntryPageData`, `CategoryGoodsItem`, `CategoryListQuery`, `CategoryListPageData` |
| `src/shared/types/modules/catalog/product.ts` | 19 | `ProductListSortKey`, `ProductListDisplayMode`, `ProductPurchaseAction`, `ProductListFilters`, `ProductListItem`, `ProductListQuery`, `ProductListPageData`, `ProductSpecValue`, `ProductSpecGroup`, `ProductSkuSnapshot`, `ProductReviewSnippet`, `ProductStoreScore`, `ProductStoreSummary`, `ProductCouponSummary`, `ProductRecommendation`, `ProductDetailPageData`, `ProductInfoPageData`, `ProductEvaluationItem`, `ProductEvaluationPageData` |

### 3.4 trade 模块

| 文件 | 数量 | 模型 |
| --- | ---: | --- |
| `src/shared/types/modules/trade/cart.ts` | 7 | `CartPromotionTag`, `CartAction`, `CartGiftItem`, `CartCouponItem`, `CartLineItem`, `CartStoreGroup`, `CartPageData` |
| `src/shared/types/modules/trade/checkout.ts` | 11 | `CheckoutAction`, `CheckoutSource`, `InstantPurchaseItem`, `CheckoutAddress`, `CheckoutCoupon`, `CheckoutLineItem`, `CheckoutStoreGroup`, `CheckoutPreview`, `SubmitOrderStoreSettlement`, `SubmitOrderCommand`, `SubmitOrderResult` |
| `src/shared/types/modules/trade/order.ts` | 17 | `TradeOrderStatus`, `TradeOrderType`, `TradeOrderAction`, `PaymentChannel`, `PaymentOption`, `PaymentSheetData`, `TradeOrderItem`, `OrderCard`, `OrderCenterQuery`, `OrderCenterPageData`, `VirtualOrderListPageData`, `LogisticsSummary`, `OrderAddress`, `OrderGiftItem`, `OrderPromotionInfo`, `OrderTimeline`, `OrderDetailPageData` |
| `src/shared/types/modules/trade/after-sale.ts` | 9 | `AfterSaleAction`, `RefundRecord`, `ReturnRecord`, `AfterSaleQuery`, `AfterSaleListPageData`, `RefundEvidenceImage`, `RefundProcessInfo`, `RefundAmountDetail`, `RefundDetailPageData` |

### 3.5 account 模块

| 文件 | 数量 | 模型 |
| --- | ---: | --- |
| `src/shared/types/modules/account/member.ts` | 12 | `MemberProfileSummary`, `MemberCountSummary`, `MemberOrderSummary`, `MemberShortcutItem`, `MemberCenterPageData`, `MemberSettingItem`, `MemberSettingsPageData`, `ProfileNamePageData`, `ProfileNameResult`, `AboutPageData`, `AddressItem`, `AddressBookPageData` |
| `src/shared/types/modules/account/member-assets.ts` | 6 | `MemberAssetCard`, `AccountBalanceLog`, `PaymentCodeInfo`, `MemberAssetsPageData`, `CardBindingPageData`, `CardBindingResult` |
| `src/shared/types/modules/account/member-interactions.ts` | 6 | `FavoriteProduct`, `FavoriteStore`, `BrowsingProduct`, `MemberCollectionsPageData`, `FeedbackPageData`, `FeedbackResult` |
| `src/shared/types/modules/account/auth.ts` | 7 | `AuthUserInfo`, `AccountCapability`, `AccountSecurityState`, `AuthSession`, `AuthResult`, `PasswordResetPageData`, `PasswordResetVerificationResult` |

## 4. 实体领域层

| 文件 | 数量 | 模型 |
| --- | ---: | --- |
| `src/entities/product/domain/product.ts` | 3 | `ProductSummary`, `ProductAttribute`, `ProductDetail` |
| `src/entities/cart/domain/cart.ts` | 3 | `CartLine`, `CartSnapshot`, `AddCartItemCommand` |
| `src/entities/order/domain/order.ts` | 5 | `CheckoutLine`, `CreateCheckoutPreviewCommand`, `CheckoutPreview`, `SubmitOrderCommand`, `OrderConfirmation` |

这层的特征是：

- 字段更少，偏核心业务语义，不直接复刻页面结构
- 适合作为仓储、应用服务、流程聚合层之间的稳定边界

## 5. 流程页数据层

| 文件 | 数量 | 模型 |
| --- | ---: | --- |
| `src/processes/storefront/domain/storefront-page-data.ts` | 12 | `PageProductCard`, `CategoryPageCategory`, `CategoryPageProductCard`, `CategoryPageData`, `HomeQuickCategory`, `HomeBanner`, `HomePageData`, `ProductSkuOption`, `ProductStoreScore`, `ProductStoreInfo`, `ProductReviewSummary`, `ProductDetailPageData` |
| `src/processes/trade/domain/trade-page-data.ts` | 6 | `CartPageItem`, `CartPageGroup`, `CartPageData`, `OrderListItem`, `OrderListEntry`, `OrderListPageData` |
| `src/processes/member-center/domain/member-center-page-data.ts` | 10 | `MemberCenterCountSummary`, `MemberOrderSummary`, `MemberProfileInfo`, `MemberShortcut`, `MemberCenterPageData`, `MemberCardsPageData`, `MemberCardBindPageData`, `MemberProductListItem`, `MemberFavoritesPageData`, `MemberHistoryPageData` |
| `src/processes/checkout-flow/domain/checkout-flow-port.ts` | 1 | `SubmitCheckoutOrderResult` |

说明：

- `CheckoutFlowPort` 本身是行为接口，不纳入数据模型计数。
- 这层是“页面真正消费的数据结构”，通常由 `infrastructure/mappers/*` 从实体或 mock 数据装配而来。

## 6. DTO 层

| 文件 | 数量 | 模型 |
| --- | ---: | --- |
| `src/entities/product/infrastructure/dto/backend-a-product.dto.ts` | 3 | `BackendAProductSpecDto`, `BackendAProductSummaryDto`, `BackendAProductDetailDto` |
| `src/entities/cart/infrastructure/dto/backend-a-cart.dto.ts` | 2 | `BackendACartLineDto`, `BackendACartSnapshotDto` |

说明：

- 当前只有 `product` 和 `cart` 建了显式 DTO。
- `trade`、`member-center`、`storefront` 的 `backend-a` 适配目前更多是基于实体模型或静态数据再次聚合。

## 7. 页面状态入口

以下 13 个入口不是“数据结构定义文件”，但它们是当前页面状态的真实承载点：

| 文件 | 入口 | 主要承载状态 |
| --- | --- | --- |
| `src/features/add-to-cart/model/useCartStore.ts` | `useCartStore` | `snapshot`, `itemCount`, `lines`, `subtotal`, `pendingProductId` |
| `src/features/product-catalog/model/useProductCatalogStore.ts` | `useProductCatalogStore` | `keyword`, `visibleProducts`, `availableCount`, `totalInventory` |
| `src/processes/checkout-flow/model/useCheckoutFlowStore.ts` | `useCheckoutFlowStore` | `preview`, `confirmation`, `submissionMessage`, `isSubmitting` |
| `src/pages/home/model/useHomePageModel.ts` | `useHomePageModel` | `homePageData`, `errorMessage`, `isLoading` |
| `src/pages/category/model/useCategoryPageModel.ts` | `useCategoryPageModel` | `categoryPageData`, `keyword`, `selectedPrimaryCategoryId`, `selectedSecondaryCategoryId`, `visibleProducts` |
| `src/pages/product-detail/model/useProductDetailPageModel.ts` | `useProductDetailPageModel` | `detailPage`, `product`, `hasLoaded`, `isNotFound` |
| `src/pages/cart/model/useCartPageModel.ts` | `useCartPageModel` | `cartPageData`, `errorMessage`, `isLoading` |
| `src/pages/order-list/model/useOrderListPageModel.ts` | `useOrderListPageModel` | `orderListPageData`, `errorMessage`, `isLoading` |
| `src/pages/member-center/model/useMemberCenterPageModel.ts` | `useMemberCenterPageModel` | `memberCenterPageData`, `errorMessage`, `isLoading` |
| `src/pages/member-cards/model/useMemberCardsPageModel.ts` | `useMemberCardsPageModel` | `memberCardsPageData`, `errorMessage`, `isLoading` |
| `src/pages/member-card-bind/model/useMemberCardBindPageModel.ts` | `useMemberCardBindPageModel` | `memberCardBindPageData`, `errorMessage`, `isLoading` |
| `src/pages/member-favorites/model/useMemberFavoritesPageModel.ts` | `useMemberFavoritesPageModel` | `memberFavoritesPageData`, `removeFavorite` |
| `src/pages/member-history/model/useMemberHistoryPageModel.ts` | `useMemberHistoryPageModel` | `memberHistoryPageData`, `removeHistoryItem` |

## 8. 重名模型清单

项目里有多组“同名但不同层”的模型，阅读和扩展时必须看文件路径，不能只看名字。

| 模型名 | 冲突位置 | 说明 |
| --- | --- | --- |
| `HomePageData` | `src/shared/types/modules/public/discovery.ts` / `src/processes/storefront/domain/storefront-page-data.ts` | 前者偏模块契约，后者偏当前首页页面聚合 |
| `ProductDetailPageData` | `src/shared/types/modules/catalog/product.ts` / `src/processes/storefront/domain/storefront-page-data.ts` | 前者字段更全，后者直接围绕当前页面展示 |
| `CartPageData` | `src/shared/types/modules/trade/cart.ts` / `src/processes/trade/domain/trade-page-data.ts` | 前者是完整交易购物车契约，后者是简化页面版 |
| `MemberCenterPageData` | `src/shared/types/modules/account/member.ts` / `src/processes/member-center/domain/member-center-page-data.ts` | 同名但字段边界不同 |
| `MemberOrderSummary` | `src/shared/types/modules/account/member.ts` / `src/processes/member-center/domain/member-center-page-data.ts` | 基本语义接近，但来源层不同 |
| `CheckoutPreview` | `src/shared/types/modules/trade/checkout.ts` / `src/entities/order/domain/order.ts` | 前者是交易模块契约，后者是实体级下单预览 |
| `SubmitOrderCommand` | `src/shared/types/modules/trade/checkout.ts` / `src/entities/order/domain/order.ts` | 前者字段更贴近完整结算，后者仅复用结算行项目 |
| `ProductStoreScore` | `src/shared/types/modules/catalog/product.ts` / `src/processes/storefront/domain/storefront-page-data.ts` | 名称一致，但承载对象不同 |

## 9. 当前建模结论

1. 项目当前不是单一模型体系，而是“共享契约模型 + 实体模型 + 流程页模型”并存。
2. 真正驱动页面的大多是 `src/processes/*/domain/*` 与 `src/entities/*/domain/*`。
3. `src/shared/types/modules/*` 更像一套更完整的业务契约库，当前主要被 mock 数据和部分交易/账号模型使用。
4. 后续如果要继续统一模型，优先要处理第 8 节中的重名结构。
