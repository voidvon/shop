# 商家首页可对接能力与开发清单

基于：

- OpenAPI：[`openapi.json`](/root/shop/docs/api/openapi.json)
- 接口索引：[`endpoints.md`](/root/shop/docs/api/endpoints.md)
- 当前店铺页实现：[`src/pages/store/ui/StorePage.vue`](/root/shop/src/pages/store/ui/StorePage.vue)
- 当前店铺页模型：[`src/pages/store/model/useStorePageModel.ts`](/root/shop/src/pages/store/model/useStorePageModel.ts)
- 当前店铺 query：[`src/processes/storefront/infrastructure/adapters/backend-a/backend-a-storefront-query.ts`](/root/shop/src/processes/storefront/infrastructure/adapters/backend-a/backend-a-storefront-query.ts)

更新时间：`2026-03-24`

## 1. 当前已接入内容

当前商家首页已经接了两类数据：

- 商家详情：`GET /api/v1/partner-merchants/{partnerMerchant}`
- 商家商品：`GET /api/v1/products?merchant_id=...`

当前页面已展示：

- 店铺名称
- 店铺 logo
- 店铺权益首条文案
- 收藏按钮（仅前端切换）
- 店内搜索入口
- 店铺商品列表
- 店铺 tabs

## 2. 已拿到但还没完整展示的字段

`StoreHomePageData` 和 mapper 已经预留了以下字段，但 UI 还没有完整消费：

- `followerCount`
- `businessHours`
- `summary`
- `address`
- `phone`
- `benefitTips`

对应代码：

- 数据映射：[`src/processes/storefront/infrastructure/mappers/backend-a-storefront-mapper.ts`](/root/shop/src/processes/storefront/infrastructure/mappers/backend-a-storefront-mapper.ts#L327)
- 页面模型赋值：[`src/pages/store/model/useStorePageModel.ts`](/root/shop/src/pages/store/model/useStorePageModel.ts#L136)
- 页面展示仍较轻：[`src/pages/store/ui/StorePage.vue`](/root/shop/src/pages/store/ui/StorePage.vue#L159)

建议直接补成以下模块：

### 2.1 店铺头部信息补全

- 收藏人数
- 营业时间
- 店铺简介
- 联系电话
- 店铺完整地址
- 多条服务标签

建议落点：

- 模型扩展导出：[`src/pages/store/model/useStorePageModel.ts`](/root/shop/src/pages/store/model/useStorePageModel.ts)
- UI 展示补全：[`src/pages/store/ui/StorePage.vue`](/root/shop/src/pages/store/ui/StorePage.vue)

### 2.2 底部快捷入口真实化

当前底部入口存在但仍是占位：

- `奖励领券`
- `联系客服`
- `关于我们`

当前行为仅 `toast`：

- [`src/pages/store/ui/StorePage.vue`](/root/shop/src/pages/store/ui/StorePage.vue#L98)

建议改造：

- `店铺信息`：滚动到店铺介绍区
- `奖励领券`：进入领券弹层或店铺优惠权益区
- `联系客服`：进入客服会话页或留言页
- `关于我们`：展示平台信息或店铺介绍详情

## 3. 可以新增的 API 对接能力

### 3.1 店内商品筛选与排序

接口基础：

- `GET /api/v1/products`

已支持参数：

- `merchant_id`
- `category_id`
- `keyword`
- `sort_by`
- `sort_dir`
- `min_price`
- `max_price`
- `per_page`

当前问题：

- 现在店铺商品请求固定按 `sales_count desc`
- 还没有分类、价格、排序、分页能力

代码落点：

- 当前请求封装：[`src/processes/storefront/infrastructure/adapters/backend-a/backend-a-storefront-query.ts`](/root/shop/src/processes/storefront/infrastructure/adapters/backend-a/backend-a-storefront-query.ts#L38)

建议拆分任务：

1. 为店铺页补 `StoreProductQuery`
2. 支持销量/价格排序
3. 支持价格区间筛选
4. 支持分页或下拉加载更多
5. 支持按分类筛选店内商品

### 3.2 店铺内分类导航

接口基础：

- `GET /api/v1/product-categories`
- `GET /api/v1/products?merchant_id=...&category_id=...`

建议做法：

- 店铺首页顶部增加横向分类条
- 店铺商品区增加“全部/分类”切换
- 店内搜索结果页共享同一筛选模型

### 3.3 客服会话

接口基础：

- `GET /api/v1/customer-service/conversations`
- `POST /api/v1/customer-service/conversations`
- `GET /api/v1/customer-service/unread-summary`
- `GET /api/v1/customer-service/conversations/{id}`
- `GET /api/v1/customer-service/conversations/{id}/messages`
- `POST /api/v1/customer-service/conversations/{id}/messages`
- `GET /api/v1/customer-service/conversations/{id}/increment`

适合商家首页的能力：

- 联系客服
- 创建留言
- 查看历史会话
- 会话内追加消息
- 首页显示未读数

建议模块边界：

- `entities/customer-service`
- `processes/customer-service`
- `pages/customer-service-conversation-list`
- `pages/customer-service-conversation-detail`

### 3.4 平台信息接入到店铺页

接口基础：

- `GET /api/v1/platform/settings`

可展示内容：

- 平台名称
- 平台 logo
- 客服电话
- 商务电话
- 客服微信
- 平台地址
- 平台域名
- ICP 备案号

相关现有映射：

- [`src/processes/member-center/infrastructure/mappers/backend-a-member-center-mapper.ts`](/root/shop/src/processes/member-center/infrastructure/mappers/backend-a-member-center-mapper.ts#L20)

适合商家首页的使用方式：

- “关于我们”弹层
- 底部公司信息
- 客服入口兜底联系方式

### 3.5 合作商家推荐

接口基础：

- `GET /api/v1/partner-regions`
- `GET /api/v1/partner-store-types`
- `GET /api/v1/partner-merchants`

适合新增的模块：

- 同城商家推荐
- 同类型商家推荐
- 更多门店入口
- 按地区/门店类型筛选的商家列表页

注意：

- 当前文档中“合作商家”域整体还没有前端页面落位
- 适合单独建列表页，不建议直接塞进现有店铺页模型

## 4. 当前不建议直接做重的部分

### 4.1 收藏店铺真实化

当前状态：

- 仅前端本地切换
- Swagger 中未见店铺收藏/取消收藏接口

影响：

- 可以保留 UI
- 不能宣称已和后端同步

### 4.2 领券能力

当前 Swagger 只有：

- `GET /api/v1/coupons`
- `POST /api/v1/coupons/{couponTemplate}/claim`

限制：

- 没有“店铺可领取优惠券列表”接口
- 没有“优惠券模板列表”公开入口

结论：

- 只能先做弱入口或与后端确认补接口
- 不适合直接做完整店铺领券中心

### 4.3 最新商品 / 促销活动语义

当前状态：

- `最新商品` 只是前端对数组做反转
- `促销活动` 只是从商品标签里找“推荐”

对应代码：

- [`src/pages/store/model/useStorePageModel.ts`](/root/shop/src/pages/store/model/useStorePageModel.ts#L57)

限制：

- 商品接口没有明确“上新时间”排序字段
- 没有独立“活动列表”接口

结论：

- 这两个 tab 暂时只能作为前端弱语义展示
- 如要做真活动页，需要后端补活动域接口

## 5. 建议开发顺序

### 第一阶段：低风险直接增量

1. 补全店铺头部信息展示
2. 补全店铺介绍区
3. 接入平台设置到“关于我们”

### 第二阶段：提升可用性

1. 店内商品排序
2. 店内价格筛选
3. 店内分类筛选
4. 列表分页或加载更多

### 第三阶段：新能力扩展

1. 客服会话页
2. 合作商家推荐区
3. 更多合作商家列表页

## 6. 建议拆给前端的具体任务

### UI 与页面层

- 调整店铺头部布局，展示收藏人数、营业时间、地址、电话
- 新增店铺介绍区和快捷操作区
- 新增关于我们弹层或详情面板
- 新增店内筛选条和排序面板

### 数据层

- 扩展店铺商品查询参数模型
- 为 `products` 增加分页/筛选 query
- 为 `platform/settings` 增加店铺页复用入口
- 新增客服 query / mapper / page data

### 需求确认

- 后端是否有“店铺优惠券模板列表”接口但未入 Swagger
- 后端是否有“店铺收藏/取消收藏”接口
- 商品是否存在“创建时间/上新时间”字段可用于真实最新排序
- 是否存在独立营销活动接口
