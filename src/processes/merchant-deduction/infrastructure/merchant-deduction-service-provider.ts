import { inject, type App, type InjectionKey } from 'vue'

import type { MerchantDeductionService } from '../domain/merchant-deduction-service'

const merchantDeductionServiceKey: InjectionKey<MerchantDeductionService> = Symbol('merchant-deduction-service')

export function provideMerchantDeductionService(app: App, service: MerchantDeductionService) {
  app.provide(merchantDeductionServiceKey, service)
}

export function useMerchantDeductionService() {
  const service = inject(merchantDeductionServiceKey)

  if (!service) {
    throw new Error('MerchantDeductionService is not available. Ensure provideBackendRuntime(app) runs during bootstrap.')
  }

  return service
}
