export const architectureLayers = [
  {
    name: 'app',
    responsibility: '应用启动、全局样式、路由和 backend runtime/provider 装配。',
    dependsOn: 'pages/widgets/features/entities/shared',
  },
  {
    name: 'pages',
    responsibility: '路由级页面，只负责拼装 widgets，不承载核心业务规则。',
    dependsOn: 'widgets/features/entities/shared',
  },
  {
    name: 'widgets',
    responsibility: '稳定的页面区块，复用 feature 与 shared UI 形成完整展示块。',
    dependsOn: 'features/entities/shared',
  },
  {
    name: 'features',
    responsibility: '用户可感知动作与界面状态编排，例如商品目录检索。',
    dependsOn: 'entities/shared',
  },
  {
    name: 'entities',
    responsibility: '实体规则、仓储契约、用例、基础展示与多后端基础设施适配。',
    dependsOn: 'shared',
  },
  {
    name: 'shared',
    responsibility: '纯通用配置、工具函数、基础布局组件与样式令牌。',
    dependsOn: 'none',
  },
] as const

export const migrationSteps = [
  '先识别真实业务能力，再决定它属于 pages、widgets、features 还是 entities。',
  '把页面中的业务判断下沉到 feature 或 entity 的 application/domain。',
  '把 HTTP、LocalStorage、浏览器能力迁入 infrastructure，不再散落在组件内部。',
  '把不同后端的 DTO 映射、错误归一和协议差异关进 adapter/mappers，由 app provider 统一装配。',
  '只通过切片公开 API 暴露能力，避免跨层直接引用内部文件。',
  '每次迁移后跑类型检查，确认依赖方向没有被破坏。',
] as const

export const acceptanceCriteria = [
  '页面组件中不直接出现远程请求与业务规则判断。',
  'shared 不包含商品、订单、用户等业务语义。',
  'Pinia store 只承担界面状态和用例编排，不充当领域模型。',
  'features 不直接依赖 mock 或具体后端 adapter，而是消费实体契约。',
  'entity 的 application 不反向依赖 UI 或路由。',
  '新增模块能按 public API 被上层消费，而不是穿透目录依赖内部实现。',
] as const
