# shop

当前项目已从 Vue 模板工程重构为一个可运行的 `FSD + DDD` 前端骨架，保留了两个路由页面，并用“商品目录”示例展示切片边界与分层方式。

当前版本进一步引入了“前端商城壳 + 多后端适配”的最小实现：`app/providers/backend` 负责运行时装配，`entities/product/infrastructure/adapters` 按后端拆实现，`mappers` 负责 DTO 到领域模型的转换。

商品实体当前进一步拆成 `ProductSummary` 与 `ProductDetail` 两套前端标准模型：列表、加购、立即购买默认只消费摘要模型；详情页和详情组件只消费详情模型。这样后端字段变化时，影响被限制在 entity 内部 mapper，不会扩散到 feature/store/UI。

除后端适配外，当前还引入了通用“模块注册表”机制：前端可以通过环境配置决定启用哪些模块，runtime 再与后端支持矩阵求交集，得到当前租户真正可用的能力集合。模块的标签、摘要、依赖和入口层级统一写在 manifest 中，供壳层和首页装配复用。

当前还新增了一个最小 `checkout-flow` process，用来编排 `product/cart/order`：在 `backend-a` 下从真实购物车进入预结算与下单，在 `mock` 下仍保留“没有购物车时退化为立即购买”的演示路径。

首页和模块页面当前由 `app/composition/module-composition-registry.ts` 统一装配：`shared/config/modules.ts` 只描述模块元数据，具体哪些组件出现在首页主区/侧栏、哪些模块有独立页面入口，都由 app 层 composition registry 决定，避免 `shared` 反向依赖业务组件。

`AppShell` 直接从 router meta 生成导航，因此当模块路由启用时，导航会自动出现，无需再维护静态菜单配置。

## 目标结构

```text
src/
  app/         # 启动、provider、router、全局样式
  pages/       # 路由级页面装配
  widgets/     # 稳定页面区块
  features/    # 用户动作与界面状态编排
  entities/    # 实体规则、用例、仓储契约与适配
  shared/      # 纯通用配置、工具和基础 UI
```

`entities/product` 内部继续按 DDD 划分：

```text
entities/product/
  domain/
  application/
  infrastructure/
    adapters/
    mappers/
  ui/
```

## 当前落地内容

- 首页使用 `widgets/shop-showcase` 组合商品目录 feature。
- 关于页使用 `widgets/architecture-overview` 展示职责边界、迁移步骤与验收标准。
- `features/product-catalog` 与 `features/add-to-cart` 使用 Pinia 管理界面状态与用例编排。
- `pages/product-detail` 作为路由级页面，消费 `ProductDetail` 并通过 composition registry 挂到 `catalog` 模块路由下。
- `processes/checkout-flow` 作为 checkout 示例，编排 `product/cart/order` 三个实体。
- `entities/product`、`entities/cart`、`entities/order` 定义实体规则、仓储契约、用例以及 `mock/backend-a` 适配示例；其中 `backend-a` 已真实装配购物车、结算和订单链路。
- `entities/product` 额外演示了“字段表 + 通用 mapper helper”的做法：后端只需要提供 DTO 和字段映射配置，就能得到统一的前端商品模型。
- `shared/ui` 提供基础布局壳和通用卡片，不承载业务语义。
- `app/providers/backend` 根据环境变量选择当前后端实现，并注入实体仓储。

## 迁移约束

- `pages` 不直接发请求，不承载业务规则。
- `features` 负责用户动作和界面状态，不把 DTO 当领域对象。
- `entities` 负责业务实体与用例，不反向依赖 UI、路由或组件库。
- 商品列表与商品详情不要共用一个笼统 `Product`；列表链路优先使用 `ProductSummary`，详情链路使用 `ProductDetail`。
- 后端字段映射优先写在 `entities/*/infrastructure/mappers` 的字段表或 mapper helper 中，不要散落在 store、feature 或页面组件。
- `shared` 不放商品、订单、用户等业务语义。
- 新增能力优先通过切片 `index.ts` 暴露 public API，避免跨目录穿透依赖。

## 运行

```sh
npm install
npm run dev
```

切换商品模块示例后端：

```sh
VITE_BACKEND_TARGET=backend-a npm run dev
```

指定真实后端基地址：

```sh
VITE_BACKEND_TARGET=backend-a \
VITE_BACKEND_A_BASE_URL=http://123.207.4.226:8080 \
npm run dev
```

如果已经有微信公众号静默授权跳转地址，也可以一起配置：

```sh
VITE_BACKEND_TARGET=backend-a \
VITE_BACKEND_A_BASE_URL=http://123.207.4.226:8080 \
VITE_BACKEND_A_WECHAT_OAUTH_URL="https://your-wechat-oauth-entry" \
npm run dev
```

如果后端当前只有一个可用 token，可在开发环境临时预置：

```sh
VITE_BACKEND_TARGET=backend-a \
VITE_BACKEND_A_BASE_URL=http://123.207.4.226:8080 \
VITE_DEV_MEMBER_ACCESS_TOKEN="your-access-token" \
npm run dev
```

启动后会把 token 写入 `localStorage.shop.member-auth.session`，再自动请求 `GET /api/v1/auth/profile` 补全用户资料。这个入口只在 `import.meta.env.DEV` 下生效。

如果要联调“我的卡券/储值卡绑定”，也可以给开发环境预置一组模拟扫码结果：

```sh
VITE_BACKEND_TARGET=backend-a \
VITE_BACKEND_A_BASE_URL=http://123.207.4.226:8080 \
VITE_DEV_MEMBER_ACCESS_TOKEN="your-access-token" \
VITE_DEV_MEMBER_CARD_NO="你的16位卡号" \
VITE_DEV_MEMBER_CARD_SECRET="你的卡密" \
npm run dev
```

这样“绑定卡券”页点击扫码按钮时，会模拟扫码成功，并直接调用 `POST /api/v1/stored-value-cards/recharge`。

当前 `backend-a` 已真实接入：

- `GET /api/v1/home`
- `GET /api/v1/product-categories`
- `GET /api/v1/products`
- `GET /api/v1/products/{product}`
- `POST /api/v1/auth/wechat`
- `GET /api/v1/auth/profile`
- `PATCH /api/v1/auth/profile`
- `GET/POST/DELETE/PATCH /api/v1/user-addresses`
- `GET/POST/PATCH/DELETE /api/v1/cart-items`
- `POST /api/v1/checkout/preview`
- `POST /api/v1/checkout/submit`
- `GET /api/v1/orders`
- `GET /api/v1/orders/{order}`
- `GET /api/v1/platform/settings`
- `GET /api/v1/balance-accounts`
- `GET /api/v1/balance-accounts/logs`
- `POST /api/v1/stored-value-cards/recharge`
- `GET /api/v1/offline-payments/payment-code`

其中会员中心相关页面已补到真实后端：

- 启动后若本地已有 token，会后台调用 `GET /api/v1/auth/profile` 刷新登录态
- “我的卡券”会真实调用储值卡充值接口
- “账户余额”会真实读取余额与流水
- “付款码”页面已落到 `/member/assets/payment-code`

当前 `backend-a` 仍未在 Swagger 中提供、前端会显式提示不支持的能力：

- 账号密码登录
- 普通注册
- 手机号注册
- 注册短信验证码
- 登录密码修改
- 支付密码修改
- 微信绑定手机号
- 订单取消
- 订单支付
- 确认收货

当前 Swagger 里仍未接完、或前端还没有完整页面承接的能力：

- 储值卡二维码 `GET /api/v1/stored-value-cards/{storedValueCard}/qr`
- 优惠券列表与领取
- 商户端线下扫码识别 / 核销支付
- 图片上传
- 员工邀请

只启用部分前端模块：

```sh
VITE_ENABLED_MODULES=catalog npm run dev
```

校验命令：

```sh
npm run build
```
