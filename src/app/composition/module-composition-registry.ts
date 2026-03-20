import type { RouteRecordRaw } from 'vue-router'

import { ProductDetailPage } from '@/pages/product-detail'
import { PromotionHubPage } from '@/pages/promotion-hub'
import type { FrontendModule } from '@/shared/config/modules'

export interface ModuleRouteDefinition {
  route: RouteRecordRaw
}

export interface ModuleCompositionDefinition {
  moduleId: FrontendModule
  routes?: ModuleRouteDefinition[]
}

const moduleCompositionRegistry: ModuleCompositionDefinition[] = [
  {
    moduleId: 'catalog',
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
  { moduleId: 'cart' },
  { moduleId: 'checkout' },
  { moduleId: 'member' },
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

function hasRoutes(
  definition: ModuleCompositionDefinition,
): definition is ModuleCompositionDefinition & { routes: ModuleRouteDefinition[] } {
  return definition.routes !== undefined
}

export function resolveModuleRoutes(enabledModuleIds: readonly FrontendModule[]) {
  return moduleCompositionRegistry
    .filter((definition) => includesModule(enabledModuleIds, definition.moduleId))
    .filter(hasRoutes)
    .flatMap((definition) => definition.routes.map((routeDefinition) => routeDefinition.route))
}
