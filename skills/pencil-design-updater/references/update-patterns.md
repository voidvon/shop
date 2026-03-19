# Pencil Design Update Patterns

## Read This File When

- 用户通过口述描述改 Pencil 页面，但没有给出精确节点名
- 需要把“改大气一点”“把这块挪上去”“顶部加渐变背景”转成具体 Pencil 操作
- 需要兼顾移动端布局规则和组件复用保护

## Requirement Normalization

把口述需求先整理成这 5 项：

- `scope`: 哪个 screen、哪个 section、还是当前选区
- `target`: 目标节点或候选节点集合
- `action`: `update` / `move` / `insert` / `replace` / `delete`
- `constraints`: 视觉风格、尺寸、层级、是否必须沿用现有组件
- `safe_assumptions`: 可以直接推断的最小假设

示例：

- “把会员卡移到头部下面，再把背景做成通栏渐变”
  - `scope`: 当前个人中心页
  - `target`: 头部容器、会员卡节点
  - `action`: `move` + `update`
  - `constraints`: 移动端、通栏背景、内容仍居中

## Node Targeting Rules

- 用户说“这块”“上面那个”“第二张卡片”时，先结合当前选区和父容器直接子节点定位。
- 若有多个候选节点，优先读父容器结构，不要盲改多个节点。
- 改稿前至少确认一次目标节点的父容器、布局方向和尺寸约束。

## Minimal Edit Patterns

### Pattern 1: Update Existing Styles Or Copy

```javascript
U("headerTitle",{content:"会员中心",fontSize:24,fontWeight:"600"})
U("heroCard",{cornerRadius:20,fill:"#FFFFFF"})
```

### Pattern 2: Move A Module Into Another Container

```javascript
U("mainContent",{placeholder:true})
M("memberCard","headerSection",1)
U("mainContent",{placeholder:false})
```

### Pattern 3: Insert A New Section

```javascript
tips=I("contentWrapper",{type:"frame",layout:"vertical",width:"fill_container",gap:8,padding:[12,12,12,12],fill:"#F5F4F1",cornerRadius:12})
tipTitle=I(tips,{type:"text",content:"温馨提示",fontSize:14,fontWeight:"600",fill:"#1A1918"})
tipBody=I(tips,{type:"text",content:"支持 7 天无理由退换",fontSize:12,fill:"#6D6C6A"})
```

### Pattern 4: Replace A Slot Or Node

```javascript
badge=R("memberCard/rightSlot",{type:"text",content:"VIP",fontSize:12,fontWeight:"600",fill:"#FFFFFF"})
```

## Mobile Full-Width Background Rule

- 主容器不要带左右 padding。
- 全屏背景节点使用 `width:"fill_container"`。
- 内容区域另建固定宽度容器，通常为 `362`。
- 主容器或背景容器设置 `alignItems:"center"`，保证内容居中。

示例：

```javascript
U("pageRoot",{padding:[0,0,20,0],alignItems:"center"})
bg=I("pageRoot",{type:"frame",width:"fill_container",height:188,fill:{
  type:"gradient",
  gradientType:"linear",
  enabled:true,
  rotation:180,
  size:{height:1},
  colors:[
    {color:"#2A6B42",position:0},
    {color:"#4ECDC4",position:0.32},
    {color:"#FAFAF8",position:1}
  ]
}})
content=I("pageRoot",{type:"frame",layout:"vertical",width:362,gap:20})
```

## Component Safety Rule

- 读到实例节点是 `type:"ref"` 时，优先保留它并只改可覆写字段。
- 需要判断是否真复用时，验证：
  - 节点是 `type:"ref"`
  - `ref` 指向真实组件源
  - 差异只存在于必要的 `descendants`
- 不要根据截图相似度判断是否“已经组件化”。

## Regression Checklist

- 重新读取被修改节点，确认属性和层级正确
- 扫描布局问题，重点检查越界、裁切、重叠
- 截图确认视觉结果与用户描述一致
- 若做了临时占位或探针节点，结束前清理
