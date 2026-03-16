---
name: architect
description: "为采用 FSD + DDD 架构的 Vue3 + Vant 项目提供架构设计、模块拆分、目录规划、边界评审、重构方案和实施约束。用于用户提到架构师、架构设计、分层、领域建模、模块边界、技术方案、重构、FSD、DDD、Vue3、Vant，或需要把业务需求落到 app/pages/widgets/features/entities/shared 与 domain/application/infrastructure/presentation 等层级时。"
---

# Architect

## Overview

为 Vue3 + Vant 项目输出可落地的 FSD + DDD 架构方案，并在设计、评审、重构、任务拆解时保持边界清晰、依赖单向、UI 与领域隔离。

## Workflow

1. 先判断任务类型：新功能设计、现有代码评审、架构重构、目录治理、技术方案落地。
2. 先读取最小必要上下文：路由、页面、状态管理、API 层、核心业务模块、共享组件。
3. 先识别业务能力、领域对象、关键用例、外部依赖，再决定 FSD 切片和 DDD 分层。
4. 先给出目标结构与边界，再给出迁移步骤；不要只给抽象原则。
5. 输出内容始终包含职责划分、依赖方向、关键接口、风险、验收点。

## Architecture Baseline

- 使用 FSD 组织前端切片：`app`、`processes`、`pages`、`widgets`、`features`、`entities`、`shared`。
- 使用 DDD 组织业务语义：`domain`、`application`、`infrastructure`、`presentation`。
- 将 `presentation` 映射到 FSD 的 `pages/widgets/features/entities/shared/ui`，不要把 UI 细节带入 `domain`。
- 保持依赖方向单向：`app -> processes -> pages -> widgets -> features -> entities -> shared`。
- 在切片内部保持依赖方向单向：`presentation -> application -> domain`，`infrastructure` 通过接口或仓储适配 `application/domain`。
- 将 `Vant` 限制在 `presentation` 或 `shared/ui` 适配层；不要在 `domain`、`application` 中出现组件库实例、组件 props 语义或展示文案。
- 将接口请求、浏览器存储、路由跳转、副作用、设备能力封装在 `infrastructure` 或 `application` 协调层；不要散落在页面和通用组件中。
- 将 Pinia store 视为界面状态和用例编排层，不把 store 直接当作领域模型。

## Slicing Rules

- 将路由级页面放在 `pages`，只负责装配与编排，不承载核心业务规则。
- 将跨多个页面复用的稳定展示块放在 `widgets`。
- 将“用户可感知动作”放在 `features`，例如登录、下单、筛选、收藏、提交表单。
- 将业务实体及其展示语义放在 `entities`，例如用户、商品、订单、优惠券。
- 将真正通用且无业务语义的内容放在 `shared`，例如 `ui`、`lib`、`api`、`config`、`types`。
- 将多页面长链路流程放在 `processes`；如果没有跨页流程，就不要为了完整性硬建这一层。
- 当某个能力只服务于单一业务切片时，优先放在对应切片内部，不要过早提升到 `shared`。

## Layering Rules Inside A Slice

- 在 `domain` 放实体、值对象、领域服务、领域规则、不变量。
- 在 `application` 放 use case、命令/查询、DTO 映射、流程编排、权限判断。
- 在 `infrastructure` 放 repository 实现、HTTP adapter、本地缓存、序列化、第三方 SDK 封装。
- 在 `ui` 或 `presentation` 放页面组件、表单、列表、弹窗、Vant 组件装配。
- 只在复杂度需要时引入完整四层；简单切片可保留 `ui + model` 或 `ui + application`，但必须说明省略原因。

## Recommended Directory Shape

```text
src/
  app/
    providers/
    router/
    styles/
  pages/
    product-detail/
      ui/
      model/
  widgets/
    product-summary/
      ui/
  features/
    add-to-cart/
      ui/
      application/
      infrastructure/
  entities/
    product/
      domain/
      application/
      infrastructure/
      ui/
  shared/
    api/
    config/
    lib/
    types/
    ui/
```

按需裁剪目录，不强制每个切片都创建所有子目录。

## Decision Heuristics

- 如果逻辑表达的是业务规则、约束、状态转换，优先进入 `domain`。
- 如果逻辑表达的是“完成一个用户目标的编排流程”，优先进入 `application`。
- 如果逻辑依赖 HTTP、LocalStorage、路由、浏览器 API、第三方 SDK，优先进入 `infrastructure` 或应用协调层。
- 如果逻辑只是展示和交互反馈，留在 `ui/presentation`。
- 如果目录命名开始出现 `common`、`utils2`、`misc` 一类信号，回头检查是否把业务语义错误塞进了 `shared`。

## Vant Usage Constraints

- 优先在切片 `ui` 中直接组合 Vant 组件，不要把页面级复杂逻辑塞进 `shared/ui`。
- 只有在样式、交互、属性约束需要统一时，才对 Vant 组件做二次封装。
- 将业务表单校验拆成两层：输入格式校验留在 UI，业务规则校验放在 `application/domain`。
- 将 Toast、Dialog、Popup 之类反馈能力视为界面适配器，不让领域层直接调用。

## Output Template

输出方案时优先使用以下结构：

1. 背景与假设
2. 领域划分与核心用例
3. 目标目录结构
4. 每层职责与依赖方向
5. 关键数据流或调用链
6. 渐进迁移步骤
7. 风险、回归点、验收标准

## Review Checklist

- 检查页面是否承担了过多业务判断。
- 检查 `shared` 是否混入业务语义。
- 检查 DTO 是否被直接当作领域对象使用。
- 检查 store 是否同时承担远程请求、领域规则、UI 状态三类职责。
- 检查 feature 是否跨越多个不相关实体而缺少明确用例边界。
- 检查 Vant 是否泄漏到非展示层。
- 检查是否存在反向依赖或循环依赖。

## Delivery Rule

在回答中直接给出推荐目录、模块职责、边界规则、迁移步骤和风险。需要评审时，先指出具体问题，再给调整方案；需要设计时，先定义边界，再展开实现。
