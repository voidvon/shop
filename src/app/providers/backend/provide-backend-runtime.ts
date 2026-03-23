import type { App } from 'vue'

import {
  provideMemberAuthRepository,
  provideMemberAuthSession,
} from '@/entities/member-auth'
import { provideMemberAddressRepository } from '@/entities/member-address'
import { provideMemberFavoriteRepository } from '@/entities/member-favorite'
import { provideCartRepository } from '@/entities/cart'
import { provideOrderRepository } from '@/entities/order'
import { provideProductRepository } from '@/entities/product'
import { provideCheckoutFlowPort } from '@/processes/checkout-flow'
import { provideMemberCenterQuery } from '@/processes/member-center'
import { provideStorefrontQuery } from '@/processes/storefront'
import { provideTradeQuery } from '@/processes/trade'

import { provideBackendRuntimeContext } from './backend-runtime-provider'
import { createBackendRuntime } from './create-backend-runtime'

export function provideBackendRuntime(app: App) {
  const runtime = createBackendRuntime()

  provideBackendRuntimeContext(app, runtime)
  provideMemberAuthRepository(app, runtime.auth.repository)
  provideMemberAuthSession(app, runtime.auth.session)
  provideCartRepository(app, runtime.repositories.cart)
  provideMemberAddressRepository(app, runtime.repositories.memberAddress)
  provideMemberFavoriteRepository(app, runtime.repositories.memberFavorite)
  provideOrderRepository(app, runtime.repositories.order)
  provideProductRepository(app, runtime.repositories.product)
  provideCheckoutFlowPort(app, runtime.queries.checkoutFlow)
  provideMemberCenterQuery(app, runtime.queries.memberCenter)
  provideStorefrontQuery(app, runtime.queries.storefront)
  provideTradeQuery(app, runtime.queries.trade)

  return runtime
}
