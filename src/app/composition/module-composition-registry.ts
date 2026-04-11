import { AfterSaleListPage } from '@/pages/after-sale-list'
import { AfterSaleApplyPage } from '@/pages/after-sale-apply'
import type { RouteRecordRaw } from 'vue-router'

import { CartPage } from '@/pages/cart'
import { CategoryPage } from '@/pages/category'
import { CheckoutPage } from '@/pages/checkout'
import { CheckoutCouponsPage } from '@/pages/checkout-coupons'
import { CustomerServiceConversationDetailPage } from '@/pages/customer-service-conversation-detail'
import { CustomerServiceConversationListPage } from '@/pages/customer-service-conversation-list'
import { HomePage } from '@/pages/home'
import { MemberCardBindPage } from '@/pages/member-card-bind'
import { MemberCardsPage } from '@/pages/member-cards'
import { MemberBalancePage } from '@/pages/member-balance'
import { MemberBalanceQueryPage } from '@/pages/member-balance-query'
import { MemberPaymentCodePage } from '@/pages/member-payment-code'
import { MemberAboutPage } from '@/pages/member-about'
import { MemberAddressesPage } from '@/pages/member-addresses'
import { MemberCenterPage } from '@/pages/member-center'
import { MemberCouponsPage } from '@/pages/member-coupons'
import { MemberFavoritesPage } from '@/pages/member-favorites'
import { MemberHistoryPage } from '@/pages/member-history'
import { MemberLoginPage } from '@/pages/member-login'
import { MemberMobilePage } from '@/pages/member-mobile'
import { MemberPasswordPage } from '@/pages/member-password'
import { MemberPayPasswordPage } from '@/pages/member-pay-password'
import { MemberProfileNamePage } from '@/pages/member-profile-name'
import { MemberRegisterMobilePage } from '@/pages/member-register-mobile'
import { MemberRegisterPage } from '@/pages/member-register'
import { MemberSettingsPage } from '@/pages/member-settings'
import { MerchantDeductionPage } from '@/pages/merchant-deduction'
import { MerchantDeductionLogsPage } from '@/pages/merchant-deduction-logs'
import { MerchantStaffBindPage } from '@/pages/merchant-staff-bind'
import { OrderDetailPage } from '@/pages/order-detail'
import { OrderListPage } from '@/pages/order-list'
import { OrderSearchResultsPage } from '@/pages/order-search-results'
import { PartnerStoreDirectoryPage } from '@/pages/partner-store-directory'
import { ProductDetailPage } from '@/pages/product-detail'
import { LogisticsDetailPage } from '@/pages/logistics-detail'
import { PromotionHubPage } from '@/pages/promotion-hub'
import { RefundDetailPage } from '@/pages/refund-detail'
import { ReturnDetailPage } from '@/pages/return-detail'
import { ReturnShipmentPage } from '@/pages/return-shipment'
import { SearchPage } from '@/pages/search'
import { SearchResultsPage } from '@/pages/search-results'
import { StorePage } from '@/pages/store'
import { StoreAboutPage } from '@/pages/store-about'
import { StoreSearchResultsPage } from '@/pages/store-search-results'
import { backendTarget } from '@/shared/config/backend'
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
  skipWechatAutoLogin?: boolean
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
      createModuleRoute({
        path: '/stores/:storeId',
        name: 'store-detail',
        component: StorePage,
        meta: {
          description: '店铺主页与店内商品浏览',
          title: '店铺详情',
        },
      }),
      createModuleRoute({
        path: '/stores/:storeId/about',
        name: 'store-about',
        component: StoreAboutPage,
        meta: {
          description: '店铺信息与介绍',
          title: '关于我们',
        },
      }),
      createModuleRoute({
        path: '/stores/:storeId/search/results',
        name: 'store-search-results',
        component: StoreSearchResultsPage,
        meta: {
          description: '店内商品搜索结果',
          title: '店内搜索',
        },
      }),
      createModuleRoute({
        path: '/search',
        name: 'search',
        component: SearchPage,
        meta: {
          title: '搜索',
        },
      }),
      createModuleRoute({
        path: '/search/results',
        name: 'search-results',
        component: SearchResultsPage,
        meta: {
          title: '搜索结果',
        },
      }),
      createModuleRoute({
        path: '/partner-store-types/:storeTypeId',
        name: 'partner-store-directory',
        component: PartnerStoreDirectoryPage,
        meta: {
          title: '合作门店',
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
      createModuleRoute({
        path: '/checkout/coupons',
        name: 'checkout-coupons',
        component: CheckoutCouponsPage,
        meta: {
          title: '选择优惠券',
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
        path: '/staff-bind',
        name: 'merchant-staff-bind',
        component: MerchantStaffBindPage,
        meta: {
          title: '员工绑定',
        },
      }),
      createModuleRoute({
        path: '/merchant/deduction',
        name: 'merchant-deduction',
        component: MerchantDeductionPage,
        meta: {
          requiresAuth: true,
          title: '扣款',
        },
      }),
      createModuleRoute({
        path: '/merchant/deduction/logs',
        name: 'merchant-deduction-logs',
        component: MerchantDeductionLogsPage,
        meta: {
          requiresAuth: true,
          title: '店铺流水查询',
        },
      }),
      createModuleRoute({
        path: '/member/orders',
        name: 'member-orders',
        component: OrderListPage,
        meta: {
          activeMainNavigationKey: 'member',
          keepAlive: true,
          requiresAuth: true,
          title: '我的订单',
        },
      }),
      createModuleRoute({
        path: '/member/customer-service',
        name: 'member-customer-service',
        component: CustomerServiceConversationListPage,
        meta: {
          activeMainNavigationKey: 'member',
          requiresAuth: true,
          title: '联系客服',
        },
      }),
      createModuleRoute({
        path: '/member/customer-service/:conversationId',
        name: 'member-customer-service-conversation',
        component: CustomerServiceConversationDetailPage,
        props: true,
        meta: {
          activeMainNavigationKey: 'member',
          requiresAuth: true,
          title: '客服会话',
        },
      }),
      createModuleRoute({
        path: '/member/orders/search-results',
        name: 'member-order-search-results',
        component: OrderSearchResultsPage,
        meta: {
          activeMainNavigationKey: 'member',
          requiresAuth: true,
          title: '订单搜索结果',
        },
      }),
      createModuleRoute({
        path: '/member/orders/:orderId',
        name: 'member-order-detail',
        component: OrderDetailPage,
        props: true,
        meta: {
          activeMainNavigationKey: 'member',
          requiresAuth: true,
          title: '订单详情',
        },
      }),
      createModuleRoute({
        path: '/member/orders/:orderId/logistics',
        name: 'member-order-logistics',
        component: LogisticsDetailPage,
        props: true,
        meta: {
          activeMainNavigationKey: 'member',
          requiresAuth: true,
          title: '物流详情',
        },
      }),
      createModuleRoute({
        path: '/member/orders/:orderId/items/:orderItemId/after-sale/apply',
        name: 'member-after-sale-apply',
        component: AfterSaleApplyPage,
        props: true,
        meta: {
          activeMainNavigationKey: 'member',
          requiresAuth: true,
          title: '申请售后',
        },
      }),
      createModuleRoute({
        path: '/member/after-sales',
        name: 'member-after-sales',
        component: AfterSaleListPage,
        meta: {
          activeMainNavigationKey: 'member',
          requiresAuth: true,
          title: '售后服务',
        },
      }),
      createModuleRoute({
        path: '/member/after-sales/:refundId',
        name: 'member-refund-detail',
        component: RefundDetailPage,
        props: true,
        meta: {
          activeMainNavigationKey: 'member',
          requiresAuth: true,
          title: '退款详情',
        },
      }),
      createModuleRoute({
        path: '/member/after-sales/returns/:refundId',
        name: 'member-return-detail',
        component: ReturnDetailPage,
        props: true,
        meta: {
          activeMainNavigationKey: 'member',
          requiresAuth: true,
          title: '退货详情',
        },
      }),
      createModuleRoute({
        path: '/member/after-sales/returns/:refundId/shipment',
        name: 'member-return-shipment',
        component: ReturnShipmentPage,
        props: true,
        meta: {
          activeMainNavigationKey: 'member',
          requiresAuth: true,
          title: '填写回寄物流',
        },
      }),
      createModuleRoute({
        path: '/member/coupons',
        name: 'member-coupons',
        component: MemberCouponsPage,
        meta: {
          activeMainNavigationKey: 'member',
          requiresAuth: true,
          title: '我的优惠券',
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
        path: '/member/assets/balance',
        name: 'member-balance',
        component: MemberBalancePage,
        meta: {
          activeMainNavigationKey: 'member',
          requiresAuth: true,
          title: '账户余额',
        },
      }),
      createModuleRoute({
        path: '/member/assets/balance-query',
        name: 'member-balance-query',
        component: MemberBalanceQueryPage,
        meta: {
          title: '余额查询',
          skipWechatAutoLogin: true,
        },
      }),
      createModuleRoute({
        path: '/member/assets/payment-code',
        name: 'member-payment-code',
        component: MemberPaymentCodePage,
        meta: {
          activeMainNavigationKey: 'member',
          requiresAuth: true,
          title: '付款码',
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
      createModuleRoute({
        path: '/member/settings',
        name: 'member-settings',
        component: MemberSettingsPage,
        meta: {
          activeMainNavigationKey: 'member',
          requiresAuth: true,
          title: '用户设置',
        },
      }),
      ...(backendTarget === 'mock'
        ? [createModuleRoute({
          path: '/member/password',
          name: 'member-password',
          component: MemberPasswordPage,
          meta: {
            activeMainNavigationKey: 'member',
            requiresAuth: true,
            title: '登录密码',
          },
        })]
        : []),
      createModuleRoute({
        path: '/member/profile-name',
        name: 'member-profile-name',
        component: MemberProfileNamePage,
        meta: {
          activeMainNavigationKey: 'member',
          requiresAuth: true,
          title: '用户昵称',
        },
      }),
      ...(backendTarget === 'mock'
        ? [createModuleRoute({
          path: '/member/mobile',
          name: 'member-mobile',
          component: MemberMobilePage,
          meta: {
            activeMainNavigationKey: 'member',
            requiresAuth: true,
            title: '手机号码',
          },
        })]
        : []),
      ...(backendTarget === 'mock'
        ? [createModuleRoute({
          path: '/member/pay-password',
          name: 'member-pay-password',
          component: MemberPayPasswordPage,
          meta: {
            activeMainNavigationKey: 'member',
            requiresAuth: true,
            title: '支付密码',
          },
        })]
        : []),
      createModuleRoute({
        path: '/member/about',
        name: 'member-about',
        component: MemberAboutPage,
        meta: {
          activeMainNavigationKey: 'member',
          requiresAuth: true,
          title: '关于我们',
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
