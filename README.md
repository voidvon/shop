# shop

当前项目已从 Vue 模板工程重构为一个可运行的 `FSD + DDD` 前端骨架，保留了两个路由页面，并用“商品目录”示例展示切片边界与分层方式。

当前版本进一步引入了“前端商城壳 + 多后端适配”的最小实现：`app/providers/backend` 负责运行时装配，`entities/product/infrastructure/adapters` 按后端拆实现，`mappers` 负责 DTO 到领域模型的转换。

商品实体当前进一步拆成 `ProductSummary` 与 `ProductDetail` 两套前端标准模型：列表、加购、立即购买默认只消费摘要模型；详情页和详情组件只消费详情模型。这样后端字段变化时，影响被限制在 entity 内部 mapper，不会扩散到 feature/store/UI。

除后端适配外，当前还引入了通用“模块注册表”机制：前端可以通过环境配置决定启用哪些模块，runtime 再与后端支持矩阵求交集，得到当前租户真正可用的能力集合。模块的标签、摘要、依赖和入口层级统一写在 manifest 中，供壳层和首页装配复用。

当前还新增了一个最小 `checkout-flow` process，用来演示跨实体流程如何编排 `product/cart/order`：有购物车时从购物车进入，没有购物车时退化为“立即购买”。

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
- `entities/product`、`entities/cart`、`entities/order` 定义实体规则、仓储契约、用例以及 `mock/backend-a` 适配示例；其中购物车当前默认装配为浏览器本地仓储。
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

只启用部分前端模块：

```sh
VITE_ENABLED_MODULES=catalog npm run dev
```

校验命令：

```sh
npm run build
```
