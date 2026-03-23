import { inject, type App, type InjectionKey } from 'vue'

import type { MemberAssetsService } from '../domain/member-assets-service'

const memberAssetsServiceKey: InjectionKey<MemberAssetsService> = Symbol('member-assets-service')

export function provideMemberAssetsService(app: App, service: MemberAssetsService) {
  app.provide(memberAssetsServiceKey, service)
}

export function useMemberAssetsService() {
  const service = inject(memberAssetsServiceKey)

  if (!service) {
    throw new Error('MemberAssetsService is not available. Ensure provideBackendRuntime(app) runs during bootstrap.')
  }

  return service
}
