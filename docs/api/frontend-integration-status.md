# 前端接入现状与后端 API 对照

基于：

- Swagger：[`openapi.json`](/root/shop/docs/api/openapi.json)
- 当前运行时装配：[`src/app/providers/backend/create-backend-runtime.ts`](/root/shop/src/app/providers/backend/create-backend-runtime.ts)
- 现有 `backend-a` 适配层与浏览器仓储实现

更新时间：`2026-04-10`

## 1. 先看结论

当前项目虽然已经有 `backend-a` 模式，但绝大多数业务还没有真正接到 Swagger 这套后端上。

现状更准确地说是：

- `backend-a` 已经开始接入真实 Swagger，目前已打通“公开商品域 + 登录资料地址域 + 交易主链路 + 会员资产主入口 + 商家页优惠券”
- 首页、分类、商品列表、商品详情已经改为真实 HTTP 读取
- 会员登录、资料刷新、昵称更新、地址 CRUD 已改为真实 HTTP
- 购物车、预结算、提交订单、订单列表、订单详情已改为真实 HTTP
- 会员中心已接平台配置、余额、余额流水、储值卡充值与付款码查询
- 售后目前仍主要落在浏览器本地仓储

## 2. 当前真实 HTTP 接入点

当前仓库里已经存在四组真实 HTTP 读取链路：

- 商品域公开接口：
  - [`src/shared/api/backend-a/backend-a-http-client.ts`](/root/shop/src/shared/api/backend-a/backend-a-http-client.ts)
  - [`src/entities/product/infrastructure/adapters/backend-a/backend-a-product-repository.ts`](/root/shop/src/entities/product/infrastructure/adapters/backend-a/backend-a-product-repository.ts)
  - [`src/processes/storefront/infrastructure/adapters/backend-a/backend-a-storefront-query.ts`](/root/shop/src/processes/storefront/infrastructure/adapters/backend-a/backend-a-storefront-query.ts)
- 会员登录 / 资料 / 地址：
  - [`src/entities/member-auth/infrastructure/adapters/backend-a/backend-a-member-auth-repository.ts`](/root/shop/src/entities/member-auth/infrastructure/adapters/backend-a/backend-a-member-auth-repository.ts)
  - [`src/entities/member-auth/infrastructure/adapters/backend-a/backend-a-member-auth-session.ts`](/root/shop/src/entities/member-auth/infrastructure/adapters/backend-a/backend-a-member-auth-session.ts)
  - [`src/entities/member-auth/infrastructure/adapters/backend-a/backend-a-member-profile-service.ts`](/root/shop/src/entities/member-auth/infrastructure/adapters/backend-a/backend-a-member-profile-service.ts)
  - [`src/entities/member-address/infrastructure/adapters/backend-a/backend-a-member-address-repository.ts`](/root/shop/src/entities/member-address/infrastructure/adapters/backend-a/backend-a-member-address-repository.ts)
- 交易主链路：
  - [`src/entities/cart/infrastructure/adapters/backend-a/backend-a-cart-repository.ts`](/root/shop/src/entities/cart/infrastructure/adapters/backend-a/backend-a-cart-repository.ts)
  - [`src/entities/order/infrastructure/adapters/backend-a/backend-a-order-repository.ts`](/root/shop/src/entities/order/infrastructure/adapters/backend-a/backend-a-order-repository.ts)
  - [`src/processes/trade/infrastructure/adapters/backend-a/backend-a-trade-readers.ts`](/root/shop/src/processes/trade/infrastructure/adapters/backend-a/backend-a-trade-readers.ts)
- 会员中心 / 会员资产：
  - [`src/processes/member-center/infrastructure/adapters/backend-a/backend-a-member-assets-service.ts`](/root/shop/src/processes/member-center/infrastructure/adapters/backend-a/backend-a-member-assets-service.ts)
  - [`src/processes/member-center/infrastructure/adapters/backend-a/backend-a-member-center-query.ts`](/root/shop/src/processes/member-center/infrastructure/adapters/backend-a/backend-a-member-center-query.ts)

商品域依赖的环境变量：

- `VITE_BACKEND_A_BASE_URL`
- `VITE_BACKEND_A_TIMEOUT_MS`
- `VITE_BACKEND_A_WECHAT_OAUTH_URL`（可选，仅用于跳转到微信静默授权入口）

商品域当前调用的 Swagger 路径：

- `GET /api/v1/home`
- `GET /api/v1/product-categories`
- `GET /api/v1/products`
- `GET /api/v1/products/{product}`

会员登录 / 资料 / 地址当前调用的 Swagger 路径：

- `POST /api/v1/auth/wechat`
- `GET /api/v1/auth/profile`
- `PATCH /api/v1/auth/profile`
- `GET /api/v1/user-addresses`
- `POST /api/v1/user-addresses`
- `DELETE /api/v1/user-addresses/{userAddress}`
- `PATCH /api/v1/user-addresses/{userAddress}`

交易主链路当前调用的 Swagger 路径：

- `GET /api/v1/cart-items`
- `POST /api/v1/cart-items`
- `PATCH /api/v1/cart-items/{cartItem}`
- `DELETE /api/v1/cart-items/{cartItem}`
- `POST /api/v1/checkout/preview`
- `POST /api/v1/checkout/submit`
- `GET /api/v1/orders`
- `GET /api/v1/orders/{order}`

会员中心 / 会员资产当前调用的 Swagger 路径：

- `GET /api/v1/platform/settings`
- `GET /api/v1/balance-accounts`
- `GET /api/v1/balance-accounts/logs`
- `POST /api/v1/stored-value-cards/recharge`
- `GET /api/v1/offline-payments/payment-code`

这说明当前仓库里的会员中心主入口与商家页优惠券都已经改为直接消费 Swagger，剩余未接的主要是储值卡二维码和商户端线下核销链路。

## 3. Swagger 能力 vs 当前前端现状

| 业务域 | Swagger 中是否存在 | 当前前端是否有页面/流程 | 当前接入状态 | 现状说明 |
| --- | --- | --- | --- | --- |
| 首页 | 是 | 是 | 已直连 | `backendAStorefrontQuery` 已按最新 Swagger 调用 `/api/v1/home`，使用 `product_limit + category_limit` 并映射 `products` |
| 分类 | 是 | 是 | 已直连 | 已调用 `/api/v1/product-categories` 与 `/api/v1/products` |
| 商品列表/商品详情 | 是 | 是 | 已直连 | `backendAProductRepository` 已调用 `/api/v1/products` 与 `/api/v1/products/{product}` |
| 购物车 | 是 | 是 | 已直连 | runtime 已装配真实 `createBackendACartRepository(...)` |
| 结算 | 是 | 是 | 已直连 | 已调用 `/api/v1/checkout/preview` 与 `/api/v1/checkout/submit` |
| 订单 | 是 | 是 | 已直连 | 订单列表、详情与提交结果均改为真实 HTTP |
| 用户资料 | 是 | 是 | 部分直连 | 微信登录、资料刷新、昵称更新已直连，密码/手机号绑定仍未接 Swagger |
| 地址管理 | 是 | 是 | 已直连 | runtime 已装配真实 `backend-a` 地址仓储 |
| 余额/储值卡 | 是 | 是 | 部分直连 | 已接 `/api/v1/balance-accounts`、`/api/v1/balance-accounts/logs`、`/api/v1/stored-value-cards/recharge`、`/api/v1/stored-value-cards/recharge-logs`、`/api/v1/stored-value-cards/lookup`；二维码仍未接 |
| 优惠券 | 是 | 页面能力弱 | 部分直连 | 商家页已接 `/api/v1/merchant-coupons` 与 `/api/v1/coupons/{couponTemplate}/claim`；“我的优惠券”仍未直连 |
| 合作商家 | 是 | 否 | 未接入 | 当前没有对应页面或 query |
| 客服 | 是 | 否 | 未接入 | 当前没有客服会话页面和消息数据层 |
| 线下付款 | 是 | 部分有 | 部分直连 | 用户付款码页已接 `/api/v1/offline-payments/payment-code`，商户扫码/核销仍未接入 |
| 上传 | 是 | 间接可能需要 | 未接入 | 当前没有统一上传 gateway |
| 员工邀请 | 是 | 否 | 未接入 | 当前没有邀请查看/绑定页面流程 |
| 平台配置 | 是 | 弱依赖 | 部分直连 | 会员中心客服热线与关于我们文案已接 `/api/v1/platform/settings` |

## 4. 关键代码落点

### 4.1 商品与店铺首页

- [`src/entities/product/infrastructure/adapters/backend-a/backend-a-product-repository.ts`](/root/shop/src/entities/product/infrastructure/adapters/backend-a/backend-a-product-repository.ts)
- [`src/processes/storefront/infrastructure/adapters/backend-a/backend-a-storefront-query.ts`](/root/shop/src/processes/storefront/infrastructure/adapters/backend-a/backend-a-storefront-query.ts)

现状：

- `backendAProductRepository` 已切到真实 `/api/v1/products` 与 `/api/v1/products/{product}`
- `backendAStorefrontQuery` 已切到真实 `/api/v1/home` 与 `/api/v1/product-categories`
- 最新 Swagger 中 `/api/v1/home` 只返回 `products`，并使用 `product_limit` 控制数量；当前前端已完成适配
- 当前仍保留了前端自己的页面模型，后端 DTO 没有直接泄漏到页面层
- 商品详情页中的评分、店铺分数、默认规格文案仍有少量前端兜底展示，不是 Swagger 原样透传

### 4.2 购物车、结算、订单

- [`src/app/providers/backend/create-backend-runtime.ts`](/root/shop/src/app/providers/backend/create-backend-runtime.ts)
- [`src/entities/cart/infrastructure/adapters/backend-a/backend-a-cart-repository.ts`](/root/shop/src/entities/cart/infrastructure/adapters/backend-a/backend-a-cart-repository.ts)
- [`src/processes/checkout-flow/infrastructure/adapters/backend-a/backend-a-checkout-flow-port.ts`](/root/shop/src/processes/checkout-flow/infrastructure/adapters/backend-a/backend-a-checkout-flow-port.ts)

现状：

- runtime 已对 `backend-a` 装配真实购物车仓储、真实订单仓储与真实交易 reader
- 商品详情页 SKU 选择已改为使用真实后端 SKU，而不是前端伪造默认规格
- checkout 提交时会把已选 cart item、收货地址、买家备注提交给真实后端
- 下单成功后，订单列表、订单详情和会员中心订单角标都会从真实 `/api/v1/orders` 刷新
- 当前仍保留显式能力裁剪：Swagger 中没有订单取消、支付、确认收货接口，因此 `backend-a` 不再继续伪造这些动作

对应 Swagger：

- `GET/POST/DELETE/PATCH /api/v1/cart-items`
- `POST /api/v1/checkout/preview`
- `POST /api/v1/checkout/submit`
- `GET /api/v1/orders`
- `GET /api/v1/orders/{order}`

### 4.3 会员登录、资料、地址

- [`src/entities/member-auth/infrastructure/adapters/backend-a/backend-a-member-auth-repository.ts`](/root/shop/src/entities/member-auth/infrastructure/adapters/backend-a/backend-a-member-auth-repository.ts)
- [`src/entities/member-auth/infrastructure/adapters/backend-a/backend-a-member-auth-session.ts`](/root/shop/src/entities/member-auth/infrastructure/adapters/backend-a/backend-a-member-auth-session.ts)
- [`src/entities/member-auth/infrastructure/adapters/backend-a/backend-a-member-profile-service.ts`](/root/shop/src/entities/member-auth/infrastructure/adapters/backend-a/backend-a-member-profile-service.ts)
- [`src/entities/member-auth/infrastructure/adapters/backend-a/backend-a-member-security-service.ts`](/root/shop/src/entities/member-auth/infrastructure/adapters/backend-a/backend-a-member-security-service.ts)

现状：

- `backendAMemberAuthRepository` 已通过 `POST /api/v1/auth/wechat` 获取真实 Bearer token
- 登录页支持在 URL 携带 `code` 时自动完成微信登录；后端会用该 `code` 换取 `openid` 并自动注册或登录用户，也可通过 `VITE_BACKEND_A_WECHAT_OAUTH_URL` 跳到静默授权入口
- 绑定卡券扫码流程已接入微信 JS-SDK；前端会直接请求 `backend-a` 的 `GET /api/v1/wechat/jssdk-signature`，并携带 `url` 查询参数，后端会自动去掉 hash 后参与签名
- runtime 启动后如果本地已有 token，会后台调用 `GET /api/v1/auth/profile` 刷新资料；如果返回 `401`，则自动清空 session
- `updateNickname` 已调用 `PATCH /api/v1/auth/profile`，并把资料同步回本地 session
- 地址管理 runtime 已装配真实 `createBackendAMemberAddressRepository(...)`
- 登录密码、支付密码、微信绑定手机号由于 Swagger 中没有对应接口，当前改为显式提示不支持

对应 Swagger：

- `POST /api/v1/auth/wechat`
- `GET /api/v1/wechat/jssdk-signature`
- `GET /api/v1/auth/profile`
- `PATCH /api/v1/auth/profile`
- `GET/POST/DELETE/PATCH /api/v1/user-addresses`

### 4.4 会员资产

- [`src/processes/member-center/infrastructure/adapters/backend-a/backend-a-member-assets-service.ts`](/root/shop/src/processes/member-center/infrastructure/adapters/backend-a/backend-a-member-assets-service.ts)
- [`src/processes/member-center/infrastructure/adapters/backend-a/backend-a-member-center-query.ts`](/root/shop/src/processes/member-center/infrastructure/adapters/backend-a/backend-a-member-center-query.ts)
- [`src/pages/member-payment-code/ui/MemberPaymentCodePage.vue`](/root/shop/src/pages/member-payment-code/ui/MemberPaymentCodePage.vue)

现状：

- 余额、余额流水与储值卡充值已经切到 Swagger 真实接口
- Swagger 文档中的 `POST /api/v1/stored-value-cards/recharge` 请求体现包含 `card_no + card_secret + mobile`，`request_no` 仍为可选幂等号
- 当前前端绑卡提交流程已经透传 `card_no + card_secret + mobile`，并继续支持可选 `request_no`
- 余额页读取 `GET /api/v1/balance-accounts` 与 `GET /api/v1/balance-accounts/logs`
- “我的卡券”页已接 `GET /api/v1/stored-value-cards/recharge-logs`
- 绑卡提交流程会先调用 `POST /api/v1/stored-value-cards/lookup` 做真实校验，再调用充值接口
- 付款码页面已落地到 `/member/assets/payment-code`，读取 `GET /api/v1/offline-payments/payment-code`
- 充值记录现在直接展示后端返回的真实历史，不再使用前端本地生成记录
- 真实订单扣减余额后，页面刷新会再次读取远端余额，不再伪造本地扣款

与 Swagger 的关系：

- 已直接消费的 Swagger 路径：
  - `GET /api/v1/balance-accounts`
  - `GET /api/v1/balance-accounts/logs`
  - `POST /api/v1/stored-value-cards/recharge`
  - `GET /api/v1/stored-value-cards/recharge-logs`
  - `POST /api/v1/stored-value-cards/lookup`
  - `GET /api/v1/offline-payments/payment-code`
  - `GET /api/v1/platform/settings`
- 仍未落位的 Swagger 资产相关路径：
  - `GET /api/v1/stored-value-cards/{storedValueCard}/qr`
  - 优惠券相关接口

## 5. 当前前端有，但 Swagger 里没有的能力

以下能力在当前前端代码里存在页面、模型或流程，但在这次拿到的 Swagger 中没有对应接口：

- 账号密码登录
- 普通注册
- 手机号注册
- 注册短信验证码
- 登录密码修改
- 支付密码修改
- 微信绑定手机号
- 收藏 / 取消收藏
- 浏览历史
- 售后申请 / 退款详情 / 退货详情 / 回寄物流
- 物流详情
- 订单取消
- 订单支付
- 确认收货

这意味着当前前端功能面大于这份 Swagger 的公开范围。后续接后端前，需要先确认这些能力是：

- 还没有后端接口
- 有接口但未纳入本次 Swagger
- 已废弃，但前端页面还保留

## 6. 当前 Swagger 有，但前端还没明显落位的能力

以下能力在 Swagger 中存在，但当前仓库里没有清晰的页面或数据接入层：

- 合作商家列表 / 详情 / 地区 / 门店类型
- 客服会话、消息、增量拉取
- 商户线下扫码识别、核销支付
- 图片上传
- 商户员工邀请查看与绑定

这些能力如果属于本期范围，建议单独建新的 `entities / processes / pages`，不要塞进现有商品或会员模块里混用。

## 7. 建议接入顺序

建议按下面顺序推进，风险最低：

1. 商品域：先接 `home / product-categories / products / products/{id}`  
   原因：当前页面链路完整、鉴权要求低、回归成本最小。

2. 登录态与用户资料：`auth/wechat`、`auth/profile`、`user-addresses` 已部分接通  
   当前已完成微信登录、昵称更新、地址 CRUD；如果要补全这一段，还需要后端补充密码修改、手机号绑定或更多登录方式接口。

3. 购物车与结算：接 `cart-items`、`checkout/preview`、`checkout/submit`  
   原因：这是交易主链路，能够打通下单闭环。

4. 订单与余额：`orders`、`balance-accounts`、`stored-value-cards` 主链已接；下一步补 `coupons` 与储值卡二维码  
   原因：订单、余额、充值和付款码已经打通，剩下是资产细分能力补全。

5. 新能力域：合作商家、客服、线下付款、员工邀请、上传  
   原因：这些在当前代码中基本没有成熟落位，需要新建模块而不是替换旧实现。

## 8. 当前最需要先确认的问题

建议先和后端确认这 4 件事：

1. `会员资产` 的真实接口到底以 Swagger 为准，还是以 `/member/assets/*` 为准。
2. 登录是否只保留 `微信公众号静默授权登录`，还是还存在账号登录、手机号注册、短信验证码等接口。
3. 售后、收藏、历史、物流这些当前前端已有能力，后端是否有对应文档。
4. Swagger 中 `servers.url=/`，前端正式基地址应配置成什么。
