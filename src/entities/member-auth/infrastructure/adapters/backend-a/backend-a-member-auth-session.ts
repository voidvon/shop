import type { AuthResult } from '@/shared/types/modules'

import type { MemberAuthSessionPersistence } from '../../../domain/member-auth'
import type { MemberAuthSession } from '../../../domain/member-auth-session'

const memberAuthStorageKey = 'shop.member-auth.session'

export function resolveMemberAuthSessionPersistence(): MemberAuthSessionPersistence {
  if (typeof window === 'undefined') {
    return 'local'
  }

  return window.localStorage.getItem(memberAuthStorageKey)
    ? 'local'
    : 'session'
}

export function requireAuthenticatedAuthResult(
  memberAuthSession: MemberAuthSession,
  errorMessage: string,
): AuthResult {
  const authResult = memberAuthSession.getSnapshot().authResult

  if (!authResult) {
    throw new Error(errorMessage)
  }

  return authResult
}

export function replaceMemberAuthSession(
  memberAuthSession: MemberAuthSession,
  authResult: AuthResult,
) {
  memberAuthSession.setAuthResult(authResult, {
    persistence: resolveMemberAuthSessionPersistence(),
  })
}
