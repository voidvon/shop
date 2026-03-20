import type { RouteRecordRaw } from 'vue-router'

import { resolveModuleRoutes } from '@/app/composition'
import { CartPage } from '@/pages/cart'
import { CategoryPage } from '@/pages/category'
import { HomePage } from '@/pages/home'
import { MemberCenterPage } from '@/pages/member-center'
import { backendTarget } from '@/shared/config/backend'
import { listEnabledModules, resolveRuntimeEnabledModules } from '@/shared/config/modules'

const enabledRouteModules = new Set(listEnabledModules(resolveRuntimeEnabledModules(backendTarget)))
const dynamicModuleRoutes = resolveModuleRoutes([...enabledRouteModules])

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: {
      navLabel: '首页',
      navOrder: 0,
      title: '商城首页',
      description: '分类、推荐和商品导购入口',
    },
  },
  {
    path: '/category',
    name: 'category',
    component: CategoryPage,
    meta: {
      title: '分类',
    },
  },
  {
    path: '/cart',
    name: 'cart',
    component: CartPage,
    meta: {
      title: '购物车',
    },
  },
  {
    path: '/member',
    name: 'member',
    component: MemberCenterPage,
    meta: {
      title: '我的',
    },
  },
  ...dynamicModuleRoutes,
]
