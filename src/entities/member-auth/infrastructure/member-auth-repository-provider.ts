import type { App, InjectionKey } from 'vue'
import { inject } from 'vue'

import type { MemberAuthRepository } from '../domain/member-auth-repository'

const memberAuthRepositoryKey: InjectionKey<MemberAuthRepository> = Symbol('member-auth-repository')

export function provideMemberAuthRepository(app: App, repository: MemberAuthRepository) {
  app.provide(memberAuthRepositoryKey, repository)
}

export function useMemberAuthRepository() {
  const repository = inject(memberAuthRepositoryKey)

  if (!repository) {
    throw new Error('MemberAuthRepository is not available. Ensure provideBackendRuntime(app) runs during bootstrap.')
  }

  return repository
}
