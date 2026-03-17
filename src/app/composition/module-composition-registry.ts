import { markRaw, type Component } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

import { CartSummaryPanel } from '@/features/add-to-cart'
import { ProductCatalogPanel } from '@/features/product-catalog'
import { MemberCenterPage } from '@/pages/member-center'
import { ProductDetailPage } from '@/pages/product-detail'
import { PromotionHubPage } from '@/pages/promotion-hub'
import { CheckoutFlowPanel } from '@/processes/checkout-flow'
import type { FrontendModule } from '@/shared/config/modules'

export type HomeModuleArea = 'main' | 'rail'

export interface HomeModulePanelDefinition {
  area: HomeModuleArea
  component: Component
  priority: number
}

export interface ModuleRouteDefinition {
  route: RouteRecordRaw
}

export interface ModuleCompositionDefinition {
  homePanel?: HomeModulePanelDefinition
  moduleId: FrontendModule
  routes?: ModuleRouteDefinition[]
}

const moduleCompositionRegistry: ModuleCompositionDefinition[] = [
  {
    moduleId: 'catalog',
    homePanel: {
      area: 'main',
      component: markRaw(ProductCatalogPanel),
      priority: 0,
    },
    routes: [
      {
        route: {
          path: '/products/:productId',
          name: 'product-detail',
          component: ProductDetailPage,
          props: true,
          meta: {
            title: '商品详情',
            description: '商品详情、规格、卖点与服务信息',
          },
        },
      },
    ],
  },
  {
    moduleId: 'cart',
    homePanel: {
      area: 'rail',
      component: markRaw(CartSummaryPanel),
      priority: 10,
    },
  },
  {
    moduleId: 'checkout',
    homePanel: {
      area: 'rail',
      component: markRaw(CheckoutFlowPanel),
      priority: 20,
    },
  },
  {
    moduleId: 'member',
    routes: [
      {
        route: {
          path: '/member',
          name: 'member',
          component: MemberCenterPage,
          meta: {
            description: '会员信息、权益和账户能力入口',
            navLabel: '会员中心',
            navOrder: 30,
            title: '会员中心',
          },
        },
      },
    ],
  },
  {
    moduleId: 'promotion',
    routes: [
      {
        route: {
          path: '/promotion',
          name: 'promotion',
          component: PromotionHubPage,
          meta: {
            description: '营销活动与优惠能力入口',
            navLabel: '营销活动',
            navOrder: 40,
            title: '营销活动',
          },
        },
      },
    ],
  },
]

function includesModule(
  enabledModuleIds: readonly FrontendModule[],
  moduleId: FrontendModule,
) {
  return enabledModuleIds.includes(moduleId)
}

function hasHomePanel(
  definition: ModuleCompositionDefinition,
): definition is ModuleCompositionDefinition & { homePanel: HomeModulePanelDefinition } {
  return definition.homePanel !== undefined
}

function hasRoutes(
  definition: ModuleCompositionDefinition,
): definition is ModuleCompositionDefinition & { routes: ModuleRouteDefinition[] } {
  return definition.routes !== undefined
}

export function resolveHomeModulePanels(enabledModuleIds: readonly FrontendModule[]) {
  return moduleCompositionRegistry
    .filter((definition) => includesModule(enabledModuleIds, definition.moduleId))
    .filter(hasHomePanel)
    .map((definition) => ({
      ...definition.homePanel,
      moduleId: definition.moduleId,
    }))
    .sort((left, right) => left.priority - right.priority)
}

export function resolveModuleRoutes(enabledModuleIds: readonly FrontendModule[]) {
  return moduleCompositionRegistry
    .filter((definition) => includesModule(enabledModuleIds, definition.moduleId))
    .filter(hasRoutes)
    .flatMap((definition) => definition.routes.map((routeDefinition) => routeDefinition.route))
}
