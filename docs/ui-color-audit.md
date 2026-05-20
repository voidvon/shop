# UI 颜色审计

## 结论

- 项目已经具备全局主题能力，但页面层没有严格执行。
- 当前代码同时存在至少 3 套并行的配色实现：
  - 全局主题 token：`warm` / `ocean`
  - 业务主流暖橙系页面
  - 会员中心偏青绿色页面
  - 客服会话偏微信聊天绿色页面
- 结果不是“完全无规范”，而是“有基础规范，但未收敛到页面层”。

## 代码依据

- 全局主题定义在 [src/app/styles/index.css](../src/app/styles/index.css)
- 主题运行时在 [src/app/providers/theme/create-theme-runtime.ts](../src/app/providers/theme/create-theme-runtime.ts)
- 应用壳层挂载主题 class 在 [src/shared/ui/AppShell.vue](../src/shared/ui/AppShell.vue)

## 当前状态

### 1. 已有的主题能力

项目已经定义了两套全局主题：

- `theme-warm`
- `theme-ocean`

并且已经抽出了这些全局 token：

- 背景：`--color-bg` `--color-surface` `--color-surface-elevated`
- 文本：`--color-text` `--color-text-strong` `--color-text-soft` `--color-text-muted`
- 品牌：`--color-primary` `--color-primary-deep` `--color-accent`
- 结构：`--color-line` `--color-line-contrast`
- 状态：`--color-success` `--color-warning` `--color-danger`
- 阴影和圆角：`--shadow-*` `--radius-*`

同时这套 token 已映射到 Vant 变量，因此从架构上讲，项目具备“统一主题”的基础条件。

### 2. 页面落地情况

对 `src/pages/**/ui/*.vue` 的初始扫描结果：

- 页面文件总数：47
- 含硬编码颜色的页面：40
- 直接使用 `var(--color-*)` 或 `var(--van-*)` 的页面：4
- 同时存在 token 和硬编码颜色的页面：1

这说明在整改开始前，页面层大约 85% 仍以字面量颜色为主，主题系统没有真正成为页面规范。

本轮已完成首批收敛的页面：

- [src/pages/product-detail/ui/ProductDetailPage.vue](../src/pages/product-detail/ui/ProductDetailPage.vue)
- [src/pages/store/ui/StorePage.vue](../src/pages/store/ui/StorePage.vue)
- [src/pages/member-center/ui/MemberCenterPage.vue](../src/pages/member-center/ui/MemberCenterPage.vue)
- [src/processes/checkout-flow/ui/CheckoutFlowPanel.vue](../src/processes/checkout-flow/ui/CheckoutFlowPanel.vue)
- [src/pages/member-cards/ui/MemberCardsPage.vue](../src/pages/member-cards/ui/MemberCardsPage.vue)
- [src/pages/merchant-deduction/ui/MerchantDeductionPage.vue](../src/pages/merchant-deduction/ui/MerchantDeductionPage.vue)
- [src/pages/order-detail/ui/OrderDetailPage.vue](../src/pages/order-detail/ui/OrderDetailPage.vue)
- [src/pages/after-sale-apply/ui/AfterSaleApplyPage.vue](../src/pages/after-sale-apply/ui/AfterSaleApplyPage.vue)
- [src/pages/cart/ui/CartPage.vue](../src/pages/cart/ui/CartPage.vue)
- [src/pages/member-balance-query/ui/MemberBalanceQueryPage.vue](../src/pages/member-balance-query/ui/MemberBalanceQueryPage.vue)
- [src/pages/order-list/ui/OrderListPage.vue](../src/pages/order-list/ui/OrderListPage.vue)
- [src/pages/after-sale-list/ui/AfterSaleListPage.vue](../src/pages/after-sale-list/ui/AfterSaleListPage.vue)
- [src/pages/member-balance/ui/MemberBalancePage.vue](../src/pages/member-balance/ui/MemberBalancePage.vue)
- [src/pages/customer-service-conversation-detail/ui/CustomerServiceConversationDetailPage.vue](../src/pages/customer-service-conversation-detail/ui/CustomerServiceConversationDetailPage.vue)
- [src/pages/home/ui/HomePage.vue](../src/pages/home/ui/HomePage.vue)
- [src/pages/member-coupons/ui/MemberCouponsPage.vue](../src/pages/member-coupons/ui/MemberCouponsPage.vue)
- [src/pages/checkout-coupons/ui/CheckoutCouponsPage.vue](../src/pages/checkout-coupons/ui/CheckoutCouponsPage.vue)

这些页面已基本切到统一 token；残留多为透明度、渐变层次或特定功能语义色。

## 当前颜色资产

### A. 全局主题 token 色板

来自 `theme-warm` 的核心颜色：

- 背景：`#f5efe5` `#f0e4d4` `#fffaf2` `#fff`
- 文本：`#2e241d` `#1a1918` `#1f1d1a` `#6b5a4d` `#6d6c6a` `#9c9b99`
- 主色：`#b85c38`
- 主色深色：`#8f3d24`
- 辅助强调：`#2f6b5f`
- 成功态浅底：`#c8f0d8`

来自 `theme-ocean` 的核心颜色：

- 主色：`#287ba7`
- 辅助强调：`#1f8a70`
- 中性色：`#1e3138` `#5e7680` `#8ca0a8`

### B. 页面层主流暖橙系

仓库内出现频率较高的硬编码颜色：

- `#fff`
- `#1a1918`
- `#1f1d1a`
- `#3c3b39`
- `#6d6c6a`
- `#9c9b99`
- `#e5e4e1`
- `#eeeae5`
- `#fafaf8`
- `#f5f4f1`
- `#ea580c`
- `#c2410c`
- `#f08a3e`
- `#c25b0a`
- `#d89575`

这套配色已经事实上构成了当前业务页面的主视觉。

### C. 会员中心青绿色子系统

典型颜色：

- `#44a08d`
- `#4ecdc4`
- `#3d8a5a`
- `rgba(61, 138, 90, 0.12)`

代表页面：

- [src/pages/member-center/ui/MemberCenterPage.vue](../src/pages/member-center/ui/MemberCenterPage.vue)

### D. 客服聊天绿色子系统

典型颜色：

- `#07c160`
- `#95ec69`
- `#22c55e`

代表页面：

- [src/pages/customer-service-conversation-detail/ui/CustomerServiceConversationDetailPage.vue](../src/pages/customer-service-conversation-detail/ui/CustomerServiceConversationDetailPage.vue)

## 问题归类

### 1. 主题 token 与实际页面主色不一致

全局 `theme-warm` 主色是：

- `--color-primary: #b85c38`
- `--color-primary-deep: #8f3d24`

但业务页面主流强调色更接近：

- `#ea580c`
- `#c2410c`
- `#f08a3e`
- `#c25b0a`

这意味着当前 token 层本身并不完全代表页面真实视觉。

### 2. 同一语义出现多组相近颜色

例如“主要强调色”同时出现：

- `#ea580c`
- `#c2410c`
- `#f08a3e`
- `#c25b0a`
- `#ff6a1a`

例如“正文/次级文字”同时出现：

- `#1a1918`
- `#1f1d1a`
- `#3c3b39`
- `#2f2a26`
- `#6d6c6a`
- `#78716c`

这类情况说明项目是“视觉接近”，但不是“规范统一”。

### 3. 主题切换能力目前不能覆盖主要页面

虽然 `theme-warm` 和 `theme-ocean` 已经存在，但由于大量页面直接写死颜色，切换主题时：

- 共享组件会变
- 页面大部分区域不会变

因此当前主题切换更像“基础设施已建好，但业务页面未接入”。

### 4. 功能型页面缺少受控子语义色

客服页模仿微信聊天风格是合理的，但它现在是直接写死实现，没有被定义为受控语义色，例如：

- `--color-chat-member-bubble`
- `--color-chat-send`

这会让“特例页面”不断扩散成新的无序色系。

## 规范候选基线

这些共享组件已经比较接近规范化写法，可作为后续整改的基线样例：

- [src/shared/ui/PageTopBar.vue](../src/shared/ui/PageTopBar.vue)
- [src/shared/ui/SectionCard.vue](../src/shared/ui/SectionCard.vue)
- [src/shared/ui/SearchField.vue](../src/shared/ui/SearchField.vue)
- [src/shared/ui/ConfirmDialog.vue](../src/shared/ui/ConfirmDialog.vue)
- [src/shared/ui/CouponCard.vue](../src/shared/ui/CouponCard.vue)
- [src/shared/ui/EmptyState.vue](../src/shared/ui/EmptyState.vue)
- [src/shared/ui/MainBottomNav.vue](../src/shared/ui/MainBottomNav.vue)

## 优先整改页面

初始优先级中的大部分核心页面已经处理完成。下一批目标建议重新基于最新代码扫描确认，而不是继续沿用第一次审计时的排序：

1. 重新扫描仍含大量硬编码色的页面与共享组件
2. 继续清理聊天、渐变、蒙层之外的裸十六进制与非语义 `rgba()`
3. 补齐尚未纳入 token 的少量功能语义色

### 优先级说明

- 已完成页已验证出一套可复用映射模式：中性色、橙色强调、浅橙底、暖灰边框、玻璃底栏都可以直接走 token。
- 聊天页已经切到受控聊天 token，但后续仍可继续把聊天相关共享样式抽象成更明确的子语义层。
- 首页和会员资产页已完成首轮收敛，后续重点会转向剩余页面与共享组件补漏。

## 建议的统一方案

建议不要直接照搬当前 `theme-warm`，而是先基于页面实际使用频率，重定一版“业务主主题 token”。

### 方案方向

- 主站默认主题保留暖白底
- 主强调色收敛到橙色系
- 绿色只保留为辅助强调或状态语义
- 聊天页保留专用语义色，不进入全站主品牌色

### 建议主色板

#### 背景

- `--color-bg: #fafaf8`
- `--color-bg-soft: #f7f4ef`
- `--color-surface: #fff`
- `--color-surface-muted: #f5f4f1`
- `--color-surface-accent: #fff1e6`

#### 文本

- `--color-text-strong: #1a1918`
- `--color-text-heading: #1f1d1a`
- `--color-text: #3c3b39`
- `--color-text-subtle: #6d6c6a`
- `--color-text-muted: #9c9b99`
- `--color-text-faint: #b4b2ad`

#### 边框

- `--color-line: #e5e4e1`
- `--color-line-soft: #eeeae5`
- `--color-line-warm: #eee7da`

#### 主品牌

- `--color-primary: #ea580c`
- `--color-primary-deep: #c2410c`
- `--color-primary-soft: #ffedd5`
- `--color-primary-soft-border: #fdba74`
- `--color-primary-alt: #f08a3e`

#### 辅助强调

- `--color-accent: #3d8a5a`
- `--color-accent-strong: #44a08d`
- `--color-accent-soft: #c8f0d8`
- `--color-accent-soft-text: #3d8a5a`

#### 状态色

- `--color-success: #2f855a`
- `--color-warning: #d89575`
- `--color-danger: #d14343`
- `--color-danger-soft: #fff3f1`

#### 特例语义色

- `--color-chat-send: #07c160`
- `--color-chat-member-bubble: #95ec69`
- `--color-chat-service-bubble: #ffffff`

## 实施建议

### 第一阶段

- 固化新的主题 token
- 补齐缺失语义：
  - `--color-primary-soft`
  - `--color-primary-soft-border`
  - `--color-line-warm`
  - `--color-chat-*`
- 保持 `warm` 为默认主题
- 暂不启用 `ocean` 的页面级承诺

### 第二阶段

- 先改共享组件和高复用容器
- 统一按钮、卡片、标题、输入框、标签、徽章、弹层的颜色语义
- 禁止在共享层新增硬编码颜色

### 第三阶段

- 处理核心页面：
  - 商品详情
  - 店铺页
  - 会员中心
  - 结算流
  - 订单详情

### 第四阶段

- 处理功能特例页
- 将客服页、聊天气泡、状态提示迁移到受控语义 token

## 落地约束

建议新增以下约束：

- 页面和共享组件禁止新增裸十六进制颜色，除非是图片蒙层或临时调试
- 允许使用 `rgba()`，但优先基于 token rgb，如 `rgba(var(--color-primary-rgb), 0.12)`
- Vant 局部主题覆盖也必须通过 token 间接引用
- 新页面必须先选 token，再写样式，不能先写颜色后补抽象

## 简短判断

- 当前项目有主题基础设施
- 当前项目没有形成统一执行的颜色规范
- 当前项目主视觉更接近“暖橙 + 中性色 + 少量绿色辅助”
- 当前最需要的不是再补一套新设计，而是把现有高频颜色收敛成 token 并强制执行
