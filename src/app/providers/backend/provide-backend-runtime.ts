import type { App } from 'vue'

import {
  hydrateBackendAMemberAuthSession,
  provideMemberAuthRepository,
  provideMemberProfileService,
  provideMemberSecurityService,
  provideMemberAuthSession,
  seedDevMemberAuthSession,
} from '@/entities/member-auth'
import { provideAfterSaleRepository } from '@/entities/after-sale'
import { provideMemberAddressRepository } from '@/entities/member-address'
import { provideMemberFavoriteRepository } from '@/entities/member-favorite'
import { provideCartRepository } from '@/entities/cart'
import { provideOrderRepository } from '@/entities/order'
import { provideProductRepository } from '@/entities/product'
import { provideCheckoutFlowPort } from '@/processes/checkout-flow'
import { provideCustomerServiceQuery } from '@/processes/customer-service'
import {
  provideMemberAssetsService,
  provideMemberCenterQuery,
} from '@/processes/member-center'
import { provideMerchantStaffInviteService } from '@/processes/merchant-staff-invite'
import { provideStorefrontQuery } from '@/processes/storefront'
import { provideTradeQuery } from '@/processes/trade'

import { provideBackendRuntimeContext } from './backend-runtime-provider'
import { createBackendRuntime } from './create-backend-runtime'

export function provideBackendRuntime(app: App) {
  const runtime = createBackendRuntime()

  provideBackendRuntimeContext(app, runtime)
  provideMemberAuthRepository(app, runtime.auth.repository)
  provideMemberProfileService(app, runtime.auth.profileService)
  provideMemberSecurityService(app, runtime.auth.securityService)
  provideMemberAuthSession(app, runtime.auth.session)
  provideAfterSaleRepository(app, runtime.repositories.afterSale)
  provideCartRepository(app, runtime.repositories.cart)
  provideMemberAddressRepository(app, runtime.repositories.memberAddress)
  provideMemberFavoriteRepository(app, runtime.repositories.memberFavorite)
  provideOrderRepository(app, runtime.repositories.order)
  provideProductRepository(app, runtime.repositories.product)
  provideCheckoutFlowPort(app, runtime.queries.checkoutFlow)
  provideCustomerServiceQuery(app, runtime.queries.customerService)
  provideMemberAssetsService(app, runtime.services.memberAssets)
  provideMemberCenterQuery(app, runtime.queries.memberCenter)
  provideMerchantStaffInviteService(app, runtime.services.merchantStaffInvite)
  provideStorefrontQuery(app, runtime.queries.storefront)
  provideTradeQuery(app, runtime.queries.trade)

  if (runtime.type === 'backend-a') {
    seedDevMemberAuthSession(runtime.auth.session)
    void hydrateBackendAMemberAuthSession(runtime.auth.session)
  }

  return runtime
}
