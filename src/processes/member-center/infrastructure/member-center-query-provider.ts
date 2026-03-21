import { inject, type App, type InjectionKey } from 'vue'

import type { MemberCenterQuery } from '../domain/member-center-query'

const memberCenterQueryKey: InjectionKey<MemberCenterQuery> = Symbol('member-center-query')

export function provideMemberCenterQuery(app: App, query: MemberCenterQuery) {
  app.provide(memberCenterQueryKey, query)
}

export function useMemberCenterQuery() {
  const query = inject(memberCenterQueryKey)

  if (!query) {
    throw new Error('MemberCenterQuery is not available. Ensure provideBackendRuntime(app) runs during bootstrap.')
  }

  return query
}
