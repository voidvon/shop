import { inject, type App, type InjectionKey } from 'vue'

import type { MemberSecurityService } from '../domain/member-security-service'

const memberSecurityServiceKey: InjectionKey<MemberSecurityService> = Symbol('member-security-service')

export function provideMemberSecurityService(app: App, service: MemberSecurityService) {
  app.provide(memberSecurityServiceKey, service)
}

export function useMemberSecurityService() {
  const service = inject(memberSecurityServiceKey)

  if (!service) {
    throw new Error('MemberSecurityService is not available. Ensure provideBackendRuntime(app) runs during bootstrap.')
  }

  return service
}
