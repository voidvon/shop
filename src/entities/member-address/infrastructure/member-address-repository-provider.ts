import type { App, InjectionKey } from 'vue'
import { inject } from 'vue'

import type { MemberAddressRepository } from '../domain/member-address-repository'

const memberAddressRepositoryKey: InjectionKey<MemberAddressRepository> = Symbol('member-address-repository')

export function provideMemberAddressRepository(app: App, repository: MemberAddressRepository) {
  app.provide(memberAddressRepositoryKey, repository)
}

export function useMemberAddressRepository() {
  const repository = inject(memberAddressRepositoryKey)

  if (!repository) {
    throw new Error('MemberAddressRepository is not available. Ensure provideBackendRuntime(app) runs during bootstrap.')
  }

  return repository
}
