---
name: pencil-architecture
description: 移动端 UI 架构设计规范，覆盖全屏背景处理、页面层级、画布编排、颜色系统和间距标准。用于使用 Pencil 设计移动端页面、重构页面壳层、整理页面与组件在画布上的摆放关系，尤其适合需要统一主页面横向排布、子页面纵向挂载、组件集中在第一列的场景。
---

# UI Architecture Skill

## 核心原则

### 1. 全屏背景处理
当需要创建全屏宽度的背景时：
- **主容器不应有 padding** - 背景需要从边缘到边缘
- **背景元素使用 fill_container** - 宽度设置为 `fill_container` 或具体的屏幕宽度（如 402px）
- **内容区域单独包裹** - 在背景之后创建独立的内容容器，该容器设置固定宽度（如 362px）
- **使用 alignItems: center** - 在主容器上使用 `alignItems: center` 让内容自动居中

### 2. 正确的层级结构
```
根容器 (无 padding)
├─ 全屏背景区域 (width: fill_container 或 402px)
│  └─ 背景内容 (width: 362px, 居中)
└─ 内容包裹容器 (width: 362px, 自动居中)
   ├─ 模块 1
   ├─ 模块 2
   └─ 模块 3
```

### 3. 避免的错误模式
❌ **错误**：在有 padding 的容器内创建全屏背景
```javascript
container (padding: [0, 20, 20, 20])
└─ background (width: 402px) // 会被 padding 限制
```

✅ **正确**：先创建全屏背景，再添加内容容器
```javascript
container (padding: [0, 0, 20, 0], alignItems: center)
├─ background (width: fill_container)
└─ contentWrapper (width: 362px)
```

### 4. 渐变背景最佳实践
- **方向**：使用 `rotation: 180` 实现从上到下的渐变
- **颜色过渡**：深色在顶部（position: 0），浅色在底部（position: 1）
- **融入背景**：最后一个颜色应该是页面背景色，实现平滑过渡
- **无边框**：全屏背景不需要 `stroke` 和 `effect`

示例：
```javascript
fill: {
  type: "gradient",
  gradientType: "linear",
  enabled: true,
  rotation: 180,
  size: { height: 1 },
  colors: [
    { color: "#44A08D", position: 0 },      // 顶部深色
    { color: "#4ECDC4", position: 0.3 },    // 中间过渡
    { color: "#FAFAF8", position: 1 }       // 底部背景色
  ]
}
```

### 5. 移动端标准尺寸
- **屏幕宽度**：402px (iPhone 标准)
- **内容宽度**：362px (左右各 20px 间距)
- **状态栏高度**：54px
- **底部导航高度**：95px

### 6. 间距系统
- **主要间距**：20px (section gap)
- **次要间距**：16px (card gap)
- **小间距**：12px (element gap)
- **内边距**：[0, 20, 20, 20] 用于内容区域

### 7. 调试检查清单
遇到布局问题时，按顺序检查：
1. 主容器是否有不必要的 padding？
2. 背景元素的宽度是否正确（fill_container 或 402px）？
3. 背景元素是否被父容器的宽度限制？
4. 内容容器是否正确居中（alignItems: center）？
5. 是否使用了正确的层级结构？

### 8. 重构步骤
当发现结构问题需要重构时：
1. 移除主容器的 padding
2. 确保背景元素在正确的层级
3. 创建独立的内容包裹容器
4. 将所有内容模块移动到包裹容器内
5. 在主容器上设置 alignItems: center

### 9. 画布编排规则
整理 `.pen` 画布时，按“组件列 / 主页面行 / 子页面列”三层组织，不把新增节点随意散落在画布上。

#### 第一列只放组件与规划物料
- 将可复用组件、组件库舞台、规划板统一放在第一列。
- 让这一列只沿 `y` 方向向下扩展，不在第一列继续横向散放组件。
- 新增可复用组件时，优先接在现有组件区下方，例如把底部操作栏组件放在底部导航组件下方。

#### 主页面只做横向排布
- 将首页、分类、购物车、我的、详情等主页面放在组件列右侧。
- 让主页面沿 `x` 方向横向展开，每个主页面占一列。
- 只把“大模块”视为主页面；不要把弹窗态、抽屉态、二级态混入主页面横向序列。

#### 子页面挂在所属主页面下方
- 将抽屉、弹窗、详情扩展态、评价页等子页面放到所属主页面正下方。
- 让同一条业务链只沿 `y` 方向继续延伸，例如商品详情页下方依次挂评价抽屉、规格弹窗。
- 不要把子页面单独排到新的横向主页面列里，避免打断页面关系。

#### 坐标更新原则
- 先确定第一列的 `x` 基线，再确定主页面起始列的 `x` 基线。
- 保持同组节点的 `x` 一致，只更新 `y` 形成纵向链路。
- 移动画布编排时，只改顶层 frame / component 的坐标，不改页面内部结构。

#### 快速检查清单
1. 第一列是否只包含组件和规划物料？
2. 主页面是否只沿 `x` 方向展开？
3. 子页面是否挂在对应主页面正下方？
4. 新增组件是否追加在组件列底部？
5. 是否只移动了顶层节点，没有误改页面内部布局？

## 实际应用示例

### 个人中心页面头部
```javascript
// 主容器：无左右 padding
U("mainContainer", { padding: [0, 0, 20, 0], alignItems: "center" })

// 头部区域：包含全屏背景
headerSection = I("mainContainer", {
  type: "frame",
  layout: "vertical",
  width: "fill_container",
  height: "fit_content",
  gap: 20,
  alignItems: "center"
})

// 全屏渐变背景
background = I(headerSection, {
  type: "frame",
  width: "fill_container",
  height: 180,
  fill: {
    type: "gradient",
    gradientType: "linear",
    enabled: true,
    rotation: 180,
    size: { height: 1 },
    colors: [
      { color: "#44A08D", position: 0 },
      { color: "#4ECDC4", position: 0.3 },
      { color: "#FAFAF8", position: 1 }
    ]
  }
})

// 背景内的内容（居中）
profileContent = I(background, {
  type: "frame",
  layout: "horizontal",
  width: 362,
  height: "fit_content",
  gap: 16,
  padding: [32, 20],
  alignItems: "center"
})

// 统计卡片（居中）
statsRow = I(headerSection, {
  type: "frame",
  layout: "horizontal",
  width: 362,
  height: 84,
  gap: 12
})

// 其他内容包裹容器
contentWrapper = I("mainContainer", {
  type: "frame",
  layout: "vertical",
  width: 362,
  height: "fit_content",
  gap: 20
})

// 将其他模块移动到 contentWrapper
M("ordersCard", contentWrapper)
M("servicesCard", contentWrapper)
M("noticeText", contentWrapper)
```

## 9. 颜色配置方案

### 设计系统颜色规范

#### 主色调 (Primary Colors)
```javascript
// 绿色系 - 主要品牌色
primary: {
  dark: "#2A6B42",      // 深绿 - 渐变起点
  main: "#3D8A5A",      // 主绿 - 图标、强调色
  medium: "#44A08D",    // 中绿 - 渐变中间
  light: "#4ECDC4",     // 青绿 - 渐变过渡
  pale: "#C8F0D8"       // 浅绿 - 激活背景、徽章
}
```

#### 中性色 (Neutral Colors)
```javascript
// 背景色
background: {
  primary: "#FAFAF8",   // 主背景 - 页面底色
  card: "#FFFFFF",      // 卡片背景 - 白色
  elevated: "#F5F4F1"   // 提升背景 - 微黄白色
}

// 文字色
text: {
  primary: "#1A1918",   // 主文字 - 标题、重要信息
  secondary: "#6D6C6A", // 次要文字 - 描述文本
  tertiary: "#9C9B99",  // 三级文字 - 辅助信息、占位符
  quaternary: "#A8A7A5",// 四级文字 - 未激活状态
  disabled: "#3C3B39"   // 禁用文字
}

// 边框色
border: {
  light: "#ECE8E3",     // 浅边框 - 卡片边框
  medium: "#E5E4E1",    // 中边框 - 分割线
  strong: "#D1D0CD"     // 强边框 - 强调边框
}
```

#### 功能色 (Functional Colors)
```javascript
// 白色系 - 用于深色背景上
white: {
  solid: "#FFFFFF",     // 纯白 - 头像、卡片
  high: "#FFFFFFCC",    // 80% 不透明 - 副标题
  medium: "#FFFFFF80",  // 50% 不透明 - 辅助文字
  low: "#FFFFFF26",     // 15% 不透明 - 按钮背景
  subtle: "#FFFFFF1F",  // 12% 不透明 - 徽章背景
  border: "#FFFFFF33"   // 20% 不透明 - 边框
}

// 强调色
accent: {
  orange: "#D89575",    // 橙色 - 温馨提示、次要强调
  coral: "#D08068",     // 珊瑚色 - 警告、负面指标
  gold: "#FFD700"       // 金色 - 特殊徽章、VIP
}
```

#### 阴影色 (Shadow Colors)
```javascript
shadow: {
  light: "#1A191808",   // 3% 黑色 - 轻微阴影
  medium: "#1A19180F",  // 6% 黑色 - 标准阴影
  strong: "#00000014"   // 8% 黑色 - 强阴影
}
```

### 颜色使用规则

#### 1. 背景渐变
```javascript
// 头部渐变 - 从深到浅到背景色
headerGradient: {
  colors: [
    { color: "#44A08D", position: 0 },      // 深绿
    { color: "#4ECDC4", position: 0.3 },    // 青绿
    { color: "#FAFAF8", position: 1 }       // 背景色
  ]
}

// 卡片渐变 - 品牌色渐变
cardGradient: {
  colors: [
    { color: "#3D8A5A", position: 0 },      // 主绿
    { color: "#4D9B6A", position: 1 }       // 亮绿
  ]
}
```

#### 2. 文字颜色层级
- **标题/数字**：`#1A1918` (text.primary)
- **正文/标签**：`#6D6C6A` (text.secondary)
- **辅助信息**：`#9C9B99` (text.tertiary)
- **未激活状态**：`#A8A7A5` (text.quaternary)
- **深色背景上的主文字**：`#FFFFFF` (white.solid)
- **深色背景上的副文字**：`#FFFFFFCC` (white.high)

#### 3. 图标颜色
- **激活状态**：`#3D8A5A` (primary.main)
- **未激活状态**：`#A8A7A5` (text.quaternary)
- **深色背景上**：`#FFFFFF` (white.solid)
- **功能图标**：`#3D8A5A` (primary.main)

#### 4. 边框使用
- **卡片边框**：`#E5E4E1` (border.medium) + 1px
- **输入框边框**：`#ECE8E3` (border.light) + 1px
- **分割线**：`#E5E4E1` (border.medium) + 1px
- **深色背景上的边框**：`#FFFFFF26` (white.low)

#### 5. 状态颜色
```javascript
// 激活状态
active: {
  background: "#C8F0D8",  // 浅绿背景
  text: "#3D8A5A",        // 主绿文字
  icon: "#3D8A5A"         // 主绿图标
}

// 未激活状态
inactive: {
  background: "transparent",
  text: "#A8A7A5",        // 灰色文字
  icon: "#A8A7A5"         // 灰色图标
}

// 悬停状态
hover: {
  background: "#F5F4F1",  // 微黄白色
  text: "#1A1918",        // 主文字色
  icon: "#3D8A5A"         // 主绿图标
}
```

#### 6. 阴影配置
```javascript
// 卡片阴影
cardShadow: {
  type: "shadow",
  shadowType: "outer",
  color: "#1A191808",     // 3% 黑色
  offset: { x: 0, y: 2 },
  blur: 8
}

// 提升阴影
elevatedShadow: {
  type: "shadow",
  shadowType: "outer",
  color: "#1A191808",     // 3% 黑色
  offset: { x: 0, y: 2 },
  blur: 12
}

// 按钮阴影
buttonShadow: {
  type: "shadow",
  shadowType: "outer",
  color: "#1A191808",     // 3% 黑色
  offset: { x: 0, y: 1 },
  blur: 6
}

// 头像阴影
avatarShadow: {
  type: "shadow",
  shadowType: "outer",
  color: "#00000014",     // 8% 黑色
  offset: { x: 0, y: 4 },
  blur: 12
}
```

### 颜色对比度检查
- **主文字 (#1A1918) on 白色背景 (#FFFFFF)**：AAA 级别 ✓
- **次要文字 (#9C9B99) on 白色背景**：AA 级别 ✓
- **白色文字 (#FFFFFF) on 绿色背景 (#44A08D)**：AAA 级别 ✓
- **主绿图标 (#3D8A5A) on 白色背景**：AA 级别 ✓

### 深色模式适配（可选）
```javascript
darkMode: {
  background: {
    primary: "#0A0A0A",   // 深黑背景
    card: "#1A1A1A",      // 卡片背景
    elevated: "#2A2A2A"   // 提升背景
  },
  text: {
    primary: "#FFFFFF",   // 主文字
    secondary: "#B0B0B0", // 次要文字
    tertiary: "#808080"   // 三级文字
  },
  primary: {
    main: "#4ECDC4",      // 主色调整为更亮的青绿
    light: "#6EDDD4"      // 浅色调整
  }
}
```

### 使用示例
```javascript
// 卡片组件
card = I(parent, {
  type: "frame",
  fill: "#FFFFFF",                    // background.card
  cornerRadius: 16,
  stroke: {
    align: "inside",
    thickness: 1,
    fill: "#E5E4E1"                   // border.medium
  },
  effect: {
    type: "shadow",
    shadowType: "outer",
    color: "#1A191808",               // shadow.light
    offset: { x: 0, y: 2 },
    blur: 8
  }
})

// 标题文字
title = I(card, {
  type: "text",
  content: "标题",
  fill: "#1A1918",                    // text.primary
  fontSize: 18,
  fontWeight: "600"
})

// 描述文字
desc = I(card, {
  type: "text",
  content: "描述信息",
  fill: "#9C9B99",                    // text.tertiary
  fontSize: 13,
  fontWeight: "500"
})

// 激活状态按钮
activeBtn = I(parent, {
  type: "frame",
  fill: "#C8F0D8",                    // primary.pale
  cornerRadius: 100
})
activeIcon = I(activeBtn, {
  type: "icon_font",
  fill: "#3D8A5A"                     // primary.main
})
```

## 总结
- 全屏背景需要在无 padding 的容器中
- 内容通过独立容器 + alignItems: center 实现居中
- 渐变背景从深到浅，最后融入页面背景色
- 遇到问题先检查结构，避免重复返工
- 使用统一的颜色系统，确保视觉一致性和可维护性
- 注意颜色对比度，确保可访问性


## 10. 文字语言规范

### 简体中文要求
**所有设计稿中的文字内容必须使用简体中文**

#### 适用范围
- 所有用户界面文字（按钮、标签、标题、描述等）
- 导航栏文字
- 表单字段标签和占位符
- 提示信息和错误消息
- 商品名称、分类名称等业务内容
- 状态文字（如"已完成"、"进行中"等）

#### 示例
```javascript
// ✅ 正确 - 使用简体中文
button = I(parent, {
  type: "text",
  content: "立即购买",
  fill: "#FFFFFF"
})

searchBar = I(parent, {
  type: "text",
  content: "搜索商品",
  fill: "#9C9B99"
})

// ❌ 错误 - 使用英文
button = I(parent, {
  type: "text",
  content: "Buy Now",
  fill: "#FFFFFF"
})
```

#### 例外情况
以下情况可以使用英文或其他语言：
- 品牌名称（如 "Nike"、"Apple"）
- 专有名词（如 "iPhone"、"MacBook"）
- 技术术语（在必要时，如 "API"、"SDK"）
- 国际通用符号（如 "¥"、"%"）

#### 检查清单
在完成设计后，检查以下内容是否使用简体中文：
- [ ] 所有按钮文字
- [ ] 所有导航标签
- [ ] 所有标题和副标题
- [ ] 所有表单标签
- [ ] 所有占位符文字
- [ ] 所有提示和说明文字
- [ ] 所有状态文字
