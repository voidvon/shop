import { inject, type App, type InjectionKey } from 'vue'

import type { MerchantStaffInviteService } from '../domain/merchant-staff-invite-service'

const merchantStaffInviteServiceKey: InjectionKey<MerchantStaffInviteService> = Symbol('merchant-staff-invite-service')

export function provideMerchantStaffInviteService(app: App, service: MerchantStaffInviteService) {
  app.provide(merchantStaffInviteServiceKey, service)
}

export function useMerchantStaffInviteService() {
  const service = inject(merchantStaffInviteServiceKey)

  if (!service) {
    throw new Error('MerchantStaffInviteService is not available. Ensure provideBackendRuntime(app) runs during bootstrap.')
  }

  return service
}
