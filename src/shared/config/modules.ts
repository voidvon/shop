import type { BackendType } from './backend'

const frontendModules = [
  'catalog',
  'cart',
  'checkout',
  'member',
  'member-mobile-register',
  'promotion',
  'review',
] as const

const defaultEnabledFrontendModules = [
  'catalog',
  'cart',
  'checkout',
  'member',
  'promotion',
  'review',
] as const satisfies readonly FrontendModule[]

export type FrontendModule = (typeof frontendModules)[number]

export type FrontendModuleMap = Record<FrontendModule, boolean>

export interface FrontendModuleManifest {
  dependsOn: FrontendModule[]
  entry: 'feature' | 'process'
  id: FrontendModule
  label: string
  summary: string
}

export const frontendModuleManifests: Record<FrontendModule, FrontendModuleManifest> = {
  catalog: {
    dependsOn: [],
    entry: 'feature',
    id: 'catalog',
    label: '商品目录',
    summary: '负责商品检索、筛选、排序和基础曝光。',
  },
  cart: {
    dependsOn: ['catalog'],
    entry: 'feature',
    id: 'cart',
    label: '购物车',
    summary: '负责加购、购物车汇总和待结算商品管理。',
  },
  checkout: {
    dependsOn: ['catalog'],
    entry: 'process',
    id: 'checkout',
    label: '结算提单',
    summary: '负责跨页面结算流程、地址确认与下单提交；可从购物车或立即购买进入。',
  },
  member: {
    dependsOn: [],
    entry: 'feature',
    id: 'member',
    label: '会员中心',
    summary: '负责会员信息、权益和个性化价格能力。',
  },
  'member-mobile-register': {
    dependsOn: ['member'],
    entry: 'feature',
    id: 'member-mobile-register',
    label: '手机注册',
    summary: '负责手机号注册入口、短信验证码获取与快速注册流程。',
  },
  promotion: {
    dependsOn: ['catalog'],
    entry: 'feature',
    id: 'promotion',
    label: '营销活动',
    summary: '负责优惠券、促销标记和活动曝光能力。',
  },
  review: {
    dependsOn: [],
    entry: 'feature',
    id: 'review',
    label: '商品评价',
    summary: '负责商品详情评价展示，以及订单中的待评价入口与评价动作。',
  },
}

export const supportedModulesByBackend: Record<BackendType, FrontendModuleMap> = {
  mock: {
    catalog: true,
    cart: true,
    checkout: true,
    member: true,
    'member-mobile-register': true,
    promotion: false,
    review: true,
  },
  'backend-a': {
    catalog: true,
    cart: true,
    checkout: true,
    member: true,
    'member-mobile-register': false,
    promotion: true,
    review: false,
  },
}

function isFrontendModule(value: string): value is FrontendModule {
  return frontendModules.includes(value as FrontendModule)
}

function createModuleMap(enabled: FrontendModule[]): FrontendModuleMap {
  return frontendModules.reduce<FrontendModuleMap>((result, moduleName) => {
    result[moduleName] = enabled.includes(moduleName)
    return result
  }, {} as FrontendModuleMap)
}

export function resolveEnabledFrontendModules(
  rawValue = import.meta.env.VITE_ENABLED_MODULES,
): FrontendModuleMap {
  if (!rawValue || rawValue.trim() === '' || rawValue.trim() === '*') {
    return createModuleMap([...defaultEnabledFrontendModules])
  }

  const enabledModules = rawValue
    .split(',')
    .map((item) => item.trim())
    .filter(isFrontendModule)

  return createModuleMap(enabledModules)
}

export function intersectModuleMaps(
  left: FrontendModuleMap,
  right: FrontendModuleMap,
): FrontendModuleMap {
  return frontendModules.reduce<FrontendModuleMap>((result, moduleName) => {
    result[moduleName] = left[moduleName] && right[moduleName]
    return result
  }, {} as FrontendModuleMap)
}

export function resolveModuleDependencies(moduleMap: FrontendModuleMap): FrontendModuleMap {
  const cache = {} as Partial<FrontendModuleMap>

  function isEnabled(moduleName: FrontendModule): boolean {
    if (cache[moduleName] !== undefined) {
      return cache[moduleName]
    }

    if (!moduleMap[moduleName]) {
      cache[moduleName] = false
      return false
    }

    const manifest = frontendModuleManifests[moduleName]
    const dependenciesSatisfied = manifest.dependsOn.every((dependency) => isEnabled(dependency))

    cache[moduleName] = dependenciesSatisfied
    return dependenciesSatisfied
  }

  return frontendModules.reduce<FrontendModuleMap>((result, moduleName) => {
    result[moduleName] = isEnabled(moduleName)
    return result
  }, {} as FrontendModuleMap)
}

export function listEnabledModules(moduleMap: FrontendModuleMap) {
  return frontendModules.filter((moduleName) => moduleMap[moduleName])
}

export function listEnabledModuleManifests(moduleMap: FrontendModuleMap) {
  return listEnabledModules(moduleMap).map((moduleName) => frontendModuleManifests[moduleName])
}

export const configuredFrontendModules = resolveEnabledFrontendModules()

export function resolveRuntimeEnabledModules(type: BackendType): FrontendModuleMap {
  return resolveModuleDependencies(
    intersectModuleMaps(configuredFrontendModules, supportedModulesByBackend[type]),
  )
}
