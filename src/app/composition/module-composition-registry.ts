import type { RouteRecordRaw } from 'vue-router'

import { CartPage } from '@/pages/cart'
import { CategoryPage } from '@/pages/category'
import { CheckoutPage } from '@/pages/checkout'
import { HomePage } from '@/pages/home'
import { MemberCardBindPage } from '@/pages/member-card-bind'
import { MemberCardsPage } from '@/pages/member-cards'
import { MemberAddressesPage } from '@/pages/member-addresses'
import { MemberCenterPage } from '@/pages/member-center'
import { MemberFavoritesPage } from '@/pages/member-favorites'
import { MemberHistoryPage } from '@/pages/member-history'
import { MemberLoginPage } from '@/pages/member-login'
import { MemberRegisterMobilePage } from '@/pages/member-register-mobile'
import { MemberRegisterPage } from '@/pages/member-register'
import { OrderListPage } from '@/pages/order-list'
import { ProductDetailPage } from '@/pages/product-detail'
import { PromotionHubPage } from '@/pages/promotion-hub'
import type { MainNavigationKey, MainNavigationMeta } from '@/shared/config/main-navigation'
import type { FrontendModule } from '@/shared/config/modules'

export interface ModuleRouteDefinition {
  route: RouteRecordRaw
}

export interface ModuleCompositionDefinition {
  moduleId: FrontendModule
  routes?: ModuleRouteDefinition[]
}

type ModuleRouteMeta = NonNullable<RouteRecordRaw['meta']> & {
  activeMainNavigationKey?: MainNavigationKey
  keepAlive?: boolean
  mainNavigation?: MainNavigationMeta
  requiresAuth?: boolean
}

function createModuleRoute(
  route: RouteRecordRaw & { meta?: ModuleRouteMeta },
): ModuleRouteDefinition {
  return { route }
}

const moduleCompositionRegistry: ModuleCompositionDefinition[] = [
  {
    moduleId: 'catalog',
    routes: [
      createModuleRoute({
        path: '/',
        name: 'home',
        component: HomePage,
        meta: {
          activeMainNavigationKey: 'home',
          keepAlive: true,
          description: '分类、推荐和商品导购入口',
          mainNavigation: {
            icon: 'home-o',
            key: 'home',
            label: '首页',
            order: 0,
            to: '/',
          },
          title: '商城首页',
        },
      }),
      createModuleRoute({
        path: '/category/:primaryCategoryId?/:secondaryCategoryId?',
        name: 'category',
        component: CategoryPage,
        meta: {
          activeMainNavigationKey: 'category',
          keepAlive: true,
          mainNavigation: {
            icon: 'apps-o',
            key: 'category',
            label: '分类',
            order: 10,
            to: '/category',
          },
          title: '分类',
        },
      }),
      createModuleRoute({
        path: '/products/:productId',
        name: 'product-detail',
        component: ProductDetailPage,
        props: true,
        meta: {
          description: '商品详情、规格、卖点与服务信息',
          title: '商品详情',
        },
      }),
    ],
  },
  {
    moduleId: 'cart',
    routes: [
      createModuleRoute({
        path: '/cart',
        name: 'cart',
        component: CartPage,
        meta: {
          activeMainNavigationKey: 'cart',
          keepAlive: true,
          mainNavigation: {
            icon: 'shopping-cart-o',
            key: 'cart',
            label: '购物车',
            order: 20,
            to: '/cart',
          },
          title: '购物车',
        },
      }),
    ],
  },
  {
    moduleId: 'checkout',
    routes: [
      createModuleRoute({
        path: '/checkout',
        name: 'checkout',
        component: CheckoutPage,
        meta: {
          title: '确认订单',
        },
      }),
    ],
  },
  {
    moduleId: 'member',
    routes: [
      createModuleRoute({
        path: '/member',
        name: 'member',
        component: MemberCenterPage,
        meta: {
          activeMainNavigationKey: 'member',
          keepAlive: true,
          mainNavigation: {
            icon: 'contact-o',
            key: 'member',
            label: '我的',
            order: 30,
            to: '/member',
          },
          title: '我的',
        },
      }),
      createModuleRoute({
        path: '/member/login',
        name: 'member-login',
        component: MemberLoginPage,
        meta: {
          title: '会员登录',
        },
      }),
      createModuleRoute({
        path: '/member/register',
        name: 'member-register',
        component: MemberRegisterPage,
        meta: {
          title: '会员注册',
        },
      }),
      createModuleRoute({
        path: '/member/orders',
        name: 'member-orders',
        component: OrderListPage,
        meta: {
          activeMainNavigationKey: 'member',
          requiresAuth: true,
          title: '我的订单',
        },
      }),
      createModuleRoute({
        path: '/member/favorites',
        name: 'member-favorites',
        component: MemberFavoritesPage,
        meta: {
          activeMainNavigationKey: 'member',
          requiresAuth: true,
          title: '我的收藏',
        },
      }),
      createModuleRoute({
        path: '/member/history',
        name: 'member-history',
        component: MemberHistoryPage,
        meta: {
          activeMainNavigationKey: 'member',
          requiresAuth: true,
          title: '我的足迹',
        },
      }),
      createModuleRoute({
        path: '/member/assets/cards',
        name: 'member-cards',
        component: MemberCardsPage,
        meta: {
          activeMainNavigationKey: 'member',
          requiresAuth: true,
          title: '我的卡券',
        },
      }),
      createModuleRoute({
        path: '/member/assets/cards/bind',
        name: 'member-card-bind',
        component: MemberCardBindPage,
        meta: {
          activeMainNavigationKey: 'member',
          requiresAuth: true,
          title: '绑定卡券',
        },
      }),
      createModuleRoute({
        path: '/member/addresses',
        name: 'member-addresses',
        component: MemberAddressesPage,
        meta: {
          activeMainNavigationKey: 'member',
          keepAlive: true,
          requiresAuth: true,
          title: '地址管理',
        },
      }),
    ],
  },
  {
    moduleId: 'member-mobile-register',
    routes: [
      createModuleRoute({
        path: '/member/register/mobile',
        name: 'member-register-mobile',
        component: MemberRegisterMobilePage,
        meta: {
          title: '手机注册',
        },
      }),
    ],
  },
  {
    moduleId: 'promotion',
    routes: [
      createModuleRoute({
        path: '/promotion',
        name: 'promotion',
        component: PromotionHubPage,
        meta: {
          description: '营销活动与优惠能力入口',
          title: '营销活动',
        },
      }),
    ],
  },
]

function includesModule(
  enabledModuleIds: readonly FrontendModule[],
  moduleId: FrontendModule,
) {
  return enabledModuleIds.includes(moduleId)
}

function hasRoutes(
  definition: ModuleCompositionDefinition,
): definition is ModuleCompositionDefinition & { routes: ModuleRouteDefinition[] } {
  return definition.routes !== undefined
}

export function resolveAppRoutes(enabledModuleIds: readonly FrontendModule[]) {
  return moduleCompositionRegistry
    .filter((definition) => includesModule(enabledModuleIds, definition.moduleId))
    .filter(hasRoutes)
    .flatMap((definition) => definition.routes.map((routeDefinition) => routeDefinition.route))
}
