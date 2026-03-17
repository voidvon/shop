import type { RouteRecordRaw } from 'vue-router'

import { StorefrontShell, resolveModuleRoutes } from '@/app/composition'
import { AboutPage } from '@/pages/about'
import { backendTarget } from '@/shared/config/backend'
import { listEnabledModules, resolveRuntimeEnabledModules } from '@/shared/config/modules'

const enabledRouteModules = new Set(listEnabledModules(resolveRuntimeEnabledModules(backendTarget)))
const dynamicModuleRoutes = resolveModuleRoutes([...enabledRouteModules])

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: StorefrontShell,
    meta: {
      navLabel: '首页',
      navOrder: 0,
      title: '架构首页',
      description: 'FSD + DDD 项目骨架与商品目录示例',
    },
  },
  {
    path: '/about',
    name: 'about',
    component: AboutPage,
    meta: {
      navLabel: '架构说明',
      navOrder: 10,
      title: '架构说明',
      description: '职责边界、依赖方向与迁移约束',
    },
  },
  ...dynamicModuleRoutes,
]
