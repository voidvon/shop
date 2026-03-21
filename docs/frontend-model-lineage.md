# 前端模型字段血缘图

## 1. 先看结论

当前项目内存在两条并行的数据血缘：

```text
Backend A DTO -> entities/domain -> processes/domain page data -> page model / store -> UI
```

```text
shared/types/modules -> shared/mocks -> processes/infrastructure/mappers -> processes/domain page data -> page model -> UI
```

简化理解：

- `DTO` 负责贴近后端字段命名
- `entities/domain` 负责沉淀核心业务语义
- `processes/domain` 负责输出页面真正消费的聚合结构
- `pages/*/model` 与 `features/*/model` 负责保存运行时状态

## 2. 核心血缘总览

| 业务域 | 上游 | 中间映射 | 下游 |
| --- | --- | --- | --- |
| 商品 | `BackendAProductSummaryDto` / `BackendAProductDetailDto` | `mapBackendAProductSummaryDto` / `mapBackendAProductDetailDto` | `ProductSummary` / `ProductDetail` |
| 店铺首页与分类 | `ProductSummary[]` | `mapBackendAHomePageData` / `mapBackendACategoryPageData` / mock mappers | `HomePageData` / `CategoryPageData` |
| 商品详情页 | `ProductDetail` + `ProductSummary[]` | `mapBackendAProductDetailPageData` / mock mapper | `ProductDetailPageData` |
| 购物车实体 | `BackendACartSnapshotDto` | `mapBackendACartSnapshotDto` | `CartSnapshot` |
| 购物车页面 | `CartSnapshot` 或 mock trade data | `mapBackendACartPageData` / `mapMockCartPageData` | `CartPageData` |
| 订单列表页面 | 静态 backend-a 数据或 mock trade data | `mapBackendAOrderListPageData` / `mapMockOrderListPageData` | `OrderListPageData` |
| 会员中心 | `ProductSummary[]` 或 mock account data | `mapBackendAMemberCenterPageData` 等 / mock mappers | `MemberCenterPageData`、`MemberFavoritesPageData` 等 |
| 结算流程 | `CartSnapshot` + `OrderRepository` + `ProductRepository` | `createCheckoutFlowPort` | `CheckoutPreview`、`OrderConfirmation`、`SubmitCheckoutOrderResult` |

## 3. 商品域血缘

### 3.1 Backend A 商品 DTO -> 实体领域模型

来源文件：

- `src/entities/product/infrastructure/dto/backend-a-product.dto.ts`
- `src/entities/product/infrastructure/mappers/product-dto-mapper.ts`
- `src/entities/product/domain/product.ts`

主链路：

```text
BackendAProductSummaryDto
  -> mapBackendAProductSummaryDto
  -> ProductSummary

BackendAProductDetailDto
  -> mapBackendAProductDetailDto
  -> ProductDetail
```

字段映射：

| DTO 字段 | 领域字段 | 说明 |
| --- | --- | --- |
| `sku` | `id` | 商品主标识 |
| `title` | `name` | 商品名 |
| `groupName` | `category` | 类目名 |
| `blurb` | `summary` | 摘要文案 |
| `salePrice` | `price` | 售价 |
| `stockQty` | `inventory` | 库存 |
| `sales30d` | `monthlySales` | 近 30 天销量 |
| `badges` | `tags` | 标签数组 |
| `coverImage` | `coverImageUrl` | 封面图 |
| `detailCopy` | `detailDescription` | 详情描述 |
| `galleryImages` | `gallery` | 图集 |
| `highlights` | `sellingPoints` | 卖点 |
| `serviceTags` | `serviceLabels` | 服务标签 |
| `specs[].label/value` | `attributes[].label/value` | 规格转属性 |

补充：

- `backend-a-product-repository.ts` 会先过滤 `isListed === false` 的商品，再进入领域层。
- 因此“未上架”数据不会透出成 `ProductSummary` / `ProductDetail`。

### 3.2 实体领域模型 -> 页面聚合模型

来源文件：

- `src/processes/storefront/infrastructure/mappers/backend-a-storefront-mapper.ts`
- `src/processes/storefront/domain/storefront-page-data.ts`

链路 1：首页卡片

```text
ProductSummary
  -> mapBackendAProductCard
  -> PageProductCard
  -> HomePageData.featuredProducts
```

字段映射：

| 领域字段 | 页面字段 |
| --- | --- |
| `id` | `PageProductCard.id` |
| `coverImageUrl` | `PageProductCard.imageUrl` |
| `name` | `PageProductCard.name` |
| `price` | `PageProductCard.price` |
| 常量 `null` | `PageProductCard.marketPrice` |

链路 2：分类页

```text
ProductSummary[]
  -> mapBackendACategoryPageData
  -> CategoryPageData
```

映射特点：

- `product.category` 会被派生为二级类目 `backend-a-category-${product.category}`
- 分类页的 `primaryCategories` 当前被统一包装在一个“全部分类”一级节点下
- 商品卡片仍然复用 `id`、`coverImageUrl`、`name`、`price`

链路 3：商品详情页

```text
ProductDetail + recommended ProductSummary[]
  -> mapBackendAProductDetailPageData
  -> ProductDetailPageData
```

映射特点：

- `product` 原样挂入页面模型
- `product.inventory` 派生到 `skuList[0].stock`
- `product.price` 派生到 `skuList[0].price`
- `product.id` 派生出 `defaultSkuId` / `selectedSkuId`
- 店铺信息、评价汇总目前是适配层生成的前端常量

### 3.3 商品领域模型 -> 其他流程

`ProductSummary` 还会流向以下场景：

- `useProductCatalogStore` 直接消费 `ProductSummary[]` 做筛选和统计
- `useCartStore.addProduct(product: ProductSummary)` 从 `ProductSummary` 派生 `AddCartItemCommand`
- `mapBackendAMemberCenterPageData`
- `mapBackendAMemberFavoritesPageData`
- `mapBackendAMemberHistoryPageData`

也就是说，`ProductSummary` 是当前项目复用最广的中间核心模型。

## 4. 购物车血缘

### 4.1 Backend A 购物车 DTO -> 购物车实体

来源文件：

- `src/entities/cart/infrastructure/dto/backend-a-cart.dto.ts`
- `src/entities/cart/infrastructure/mappers/cart-dto-mapper.ts`
- `src/entities/cart/domain/cart.ts`

主链路：

```text
BackendACartSnapshotDto
  -> mapBackendACartSnapshotDto
  -> CartSnapshot
```

字段映射：

| DTO 字段 | 领域字段 | 说明 |
| --- | --- | --- |
| `entries[].sku` | `lines[].productId` | 商品标识 |
| `entries[].title` | `lines[].productName` | 商品名称 |
| `entries[].qty` | `lines[].quantity` | 数量 |
| `entries[].unitAmount` | `lines[].unitPrice` | 单价 |
| `entries[].qty * unitAmount` | `lines[].lineTotal` | 行总价，由 `createCartLine` 计算 |
| `totalUnits` | `itemCount` | 总件数 |
| `payableAmount` | `subtotal` | 小计金额 |

### 4.2 购物车实体 -> 页面模型

来源文件：

- `src/processes/trade/infrastructure/mappers/backend-a-trade-mapper.ts`
- `src/processes/trade/domain/trade-page-data.ts`

主链路：

```text
CartSnapshot
  -> mapBackendACartPageData
  -> CartPageData
  -> useCartPageModel
```

字段映射：

| 领域字段 | 页面字段 |
| --- | --- |
| `snapshot.lines[].productId` | `groups[0].items[].productId` |
| `snapshot.lines[].productName` | `groups[0].items[].productName` |
| `snapshot.lines[].quantity` | `groups[0].items[].quantity` |
| `snapshot.lines[].unitPrice` | `groups[0].items[].unitPrice` |
| `snapshot.subtotal` | `totalAmount` |
| 前端生成 | `lineId`, `storeId`, `storeName`, `productImageUrl` |

补充：

- `useCartStore` 保留的是实体级 `CartSnapshot`
- `useCartPageModel` 保留的是流程页 `CartPageData`
- 两者名字相近，但用途不同

## 5. 订单与结算血缘

### 5.1 订单实体模型

来源文件：

- `src/entities/order/domain/order.ts`

核心模型：

- `CheckoutLine`
- `CreateCheckoutPreviewCommand`
- `CheckoutPreview`
- `SubmitOrderCommand`
- `OrderConfirmation`

当前特点：

- 这套模型偏“最小可用结算域”
- 当前没有显式 DTO 文件
- `OrderRepository` 的 mock / backend-a 实现直接围绕这套模型工作

### 5.2 结算流程聚合

来源文件：

- `src/processes/checkout-flow/domain/checkout-flow-port.ts`
- `src/processes/checkout-flow/model/useCheckoutFlowStore.ts`
- `src/processes/checkout-flow/infrastructure/create-checkout-flow-port.ts`

主链路：

```text
CartRepository + ProductRepository + OrderRepository
  -> createCheckoutFlowPort
  -> CheckoutFlowPort.getPreview()
  -> CheckoutPreview
  -> useCheckoutFlowStore.preview

CheckoutFlowPort.submit()
  -> SubmitCheckoutOrderResult
  -> OrderConfirmation
  -> useCheckoutFlowStore.confirmation
```

说明：

- `SubmitCheckoutOrderResult` 是流程层附加模型，用于一次性把 `confirmation` 和 `preview` 返回给 store
- 这层模型与 `src/shared/types/modules/trade/checkout.ts` 的完整交易契约不是同一套

### 5.3 订单列表页

来源文件：

- `src/processes/trade/infrastructure/mappers/backend-a-trade-mapper.ts`
- `src/processes/trade/infrastructure/mappers/mock-trade-mapper.ts`
- `src/processes/trade/domain/trade-page-data.ts`

主链路：

```text
backend-a 静态数据 或 mockTradeData.orderCenterPageData
  -> mapBackendAOrderListPageData / mapMockOrderListPageData
  -> OrderListPageData
  -> useOrderListPageModel
```

说明：

- 订单列表页面当前没有复用 `shared/types/modules/trade/order.ts` 的完整 `OrderCard`
- 页面真正消费的是更轻量的 `OrderListEntry`

## 6. 会员中心血缘

来源文件：

- `src/processes/member-center/infrastructure/mappers/backend-a-member-center-mapper.ts`
- `src/processes/member-center/infrastructure/mappers/mock-member-center-mapper.ts`
- `src/processes/member-center/domain/member-center-page-data.ts`

主链路：

```text
ProductSummary[]
  -> mapBackendAMemberProductListItem
  -> MemberProductListItem
  -> MemberFavoritesPageData / MemberHistoryPageData
```

```text
ProductSummary[]
  -> mapBackendAMemberCenterPageData
  -> MemberCenterPageData
  -> useMemberCenterPageModel
```

字段映射：

| 上游字段 | 下游字段 |
| --- | --- |
| `product.id` | `MemberProductListItem.productId` |
| `product.coverImageUrl` | `MemberProductListItem.productImageUrl` |
| `product.name` | `MemberProductListItem.productName` |
| `product.price` | `MemberProductListItem.productPrice` |
| 前端常量 `'Backend A 选品馆'` | `MemberProductListItem.storeName` |

补充：

- `MemberCenterPageData.counts` 由 `ProductSummary[]` 长度和前端常量共同拼装
- `shortcuts`、`servicePhone`、`tipText` 当前也是适配层生成
- mock 分支则来自 `shared/mocks/modules/account.ts`，再转换成流程页模型

## 7. Mock 数据血缘

mock 链路不是 DTO 驱动，而是“共享契约模型 -> mock 数据 -> 流程页模型”。

### 7.1 storefront mock

```text
shared/types/modules/public + shared/types/modules/catalog
  -> shared/mocks/modules/public.ts / catalog.ts
  -> mapMockHomePageData / mapMockCategoryPageData / mapMockProductDetailPageData
  -> processes/storefront/domain/*
  -> pages/*/model
```

关键点：

- mock 数据大多以 `shared/types/modules/*` 为源类型
- 流程层再把它们裁剪成页面更直接消费的结构

### 7.2 trade mock

```text
shared/types/modules/trade/*
  -> shared/mocks/modules/trade.ts
  -> mapMockCartPageData / mapMockOrderListPageData
  -> processes/trade/domain/*
  -> useCartPageModel / useOrderListPageModel
```

### 7.3 member mock

```text
shared/types/modules/account/*
  -> shared/mocks/modules/account.ts
  -> mapMockMemberCenterPageData 等
  -> processes/member-center/domain/*
  -> member pages models
```

这说明 `shared/types/modules/*` 在当前项目里更像“mock 与完整业务契约层”的上游。

## 8. 重名模型的语义差异

这些重名结构最容易造成误读：

| 名称 | 上层版本 | 下层版本 | 差异 |
| --- | --- | --- | --- |
| `HomePageData` | `shared/types/modules/public/discovery.ts` | `processes/storefront/domain/storefront-page-data.ts` | 前者含 `productFeed` 分页，后者是首页展示聚合 |
| `ProductDetailPageData` | `shared/types/modules/catalog/product.ts` | `processes/storefront/domain/storefront-page-data.ts` | 前者包含大量交易字段，后者围绕当前详情页展示 |
| `CartPageData` | `shared/types/modules/trade/cart.ts` | `processes/trade/domain/trade-page-data.ts` | 前者是完整购物车契约，后者是简化展示数据 |
| `MemberCenterPageData` | `shared/types/modules/account/member.ts` | `processes/member-center/domain/member-center-page-data.ts` | 前者偏业务模块定义，后者偏当前页面聚合 |
| `CheckoutPreview` | `shared/types/modules/trade/checkout.ts` | `entities/order/domain/order.ts` | 前者是完整结算上下文，后者是实体层最小预览 |
| `SubmitOrderCommand` | `shared/types/modules/trade/checkout.ts` | `entities/order/domain/order.ts` | 前者需要地址、结算、支付方式，后者仅沿用结算行信息 |

## 9. 建议的阅读顺序

如果后续要继续梳理或统一模型，建议按下面顺序看：

1. `src/entities/*/domain/*`
2. `src/processes/*/domain/*`
3. `src/processes/*/infrastructure/mappers/*`
4. `src/shared/types/modules/*`
5. `src/shared/mocks/*`

原因：

- 第 1、2 层是当前页面真实依赖的主路径
- 第 3 层决定字段怎样落到页面
- 第 4、5 层更多承担完整契约与 mock 数据源角色

## 10. 当前统一方向

如果后续要收敛模型，建议优先做这三件事：

1. 统一命名，先处理 `HomePageData`、`ProductDetailPageData`、`CartPageData` 等重名结构。
2. 明确 `shared/types/modules/*` 的角色，是保留为“完整业务契约层”，还是逐步并入 `entities/processes`。
3. 为 `trade`、`member-center`、`storefront` 补齐显式 DTO 或明确声明“不需要 DTO，只接领域模型”。
