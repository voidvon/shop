import { inject, type App, type InjectionKey } from 'vue'

import type { MemberProfileService } from '../domain/member-profile-service'

const memberProfileServiceKey: InjectionKey<MemberProfileService> = Symbol('member-profile-service')

export function provideMemberProfileService(app: App, service: MemberProfileService) {
  app.provide(memberProfileServiceKey, service)
}

export function useMemberProfileService() {
  const service = inject(memberProfileServiceKey)

  if (!service) {
    throw new Error('MemberProfileService is not available. Ensure provideBackendRuntime(app) runs during bootstrap.')
  }

  return service
}
