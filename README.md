# shop

当前项目已从 Vue 模板工程重构为一个可运行的 `FSD + DDD` 前端骨架，保留了两个路由页面，并用“商品目录”示例展示切片边界与分层方式。

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
  ui/
```

## 当前落地内容

- 首页使用 `widgets/shop-showcase` 组合商品目录 feature。
- 关于页使用 `widgets/architecture-overview` 展示职责边界、迁移步骤与验收标准。
- `features/product-catalog` 使用 Pinia 管理界面状态与用例编排。
- `entities/product` 定义商品实体规则、仓储契约、用例和 mock 基础设施实现。
- `shared/ui` 提供基础布局壳和通用卡片，不承载业务语义。

## 迁移约束

- `pages` 不直接发请求，不承载业务规则。
- `features` 负责用户动作和界面状态，不把 DTO 当领域对象。
- `entities` 负责业务实体与用例，不反向依赖 UI、路由或组件库。
- `shared` 不放商品、订单、用户等业务语义。
- 新增能力优先通过切片 `index.ts` 暴露 public API，避免跨目录穿透依赖。

## 运行

```sh
npm install
npm run dev
```

校验命令：

```sh
npm run build
```
