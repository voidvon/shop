import type { RouteRecordRaw } from 'vue-router'

import { resolveModuleRoutes } from '@/app/composition'
import { CartPage } from '@/pages/cart'
import { CategoryPage } from '@/pages/category'
import { HomePage } from '@/pages/home'
import { MemberCardBindPage } from '@/pages/member-card-bind'
import { MemberCardsPage } from '@/pages/member-cards'
import { MemberCenterPage } from '@/pages/member-center'
import { OrderListPage } from '@/pages/order-list'
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
  {
    path: '/member/orders',
    name: 'member-orders',
    component: OrderListPage,
    meta: {
      title: '我的订单',
    },
  },
  {
    path: '/member/assets/cards',
    name: 'member-cards',
    component: MemberCardsPage,
    meta: {
      title: '我的卡券',
    },
  },
  {
    path: '/member/assets/cards/bind',
    name: 'member-card-bind',
    component: MemberCardBindPage,
    meta: {
      title: '绑定卡券',
    },
  },
  ...dynamicModuleRoutes,
]
