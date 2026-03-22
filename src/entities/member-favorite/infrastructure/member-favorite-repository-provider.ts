import type { App, InjectionKey } from 'vue'
import { inject } from 'vue'

import type { MemberFavoriteRepository } from '../domain/member-favorite-repository'

const memberFavoriteRepositoryKey: InjectionKey<MemberFavoriteRepository> = Symbol('member-favorite-repository')

export function provideMemberFavoriteRepository(app: App, repository: MemberFavoriteRepository) {
  app.provide(memberFavoriteRepositoryKey, repository)
}

export function useMemberFavoriteRepository() {
  const repository = inject(memberFavoriteRepositoryKey)

  if (!repository) {
    throw new Error('MemberFavoriteRepository is not available. Ensure provideBackendRuntime(app) runs during bootstrap.')
  }

  return repository
}
