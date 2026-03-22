import type { App, InjectionKey } from 'vue'
import { inject } from 'vue'

import type { MemberAuthSession } from '../domain/member-auth-session'

const memberAuthSessionKey: InjectionKey<MemberAuthSession> = Symbol('member-auth-session')

export function provideMemberAuthSession(app: App, session: MemberAuthSession) {
  app.provide(memberAuthSessionKey, session)
}

export function useMemberAuthSession() {
  const session = inject(memberAuthSessionKey)

  if (!session) {
    throw new Error('MemberAuthSession is not available. Ensure provideBackendRuntime(app) runs during bootstrap.')
  }

  return session
}
