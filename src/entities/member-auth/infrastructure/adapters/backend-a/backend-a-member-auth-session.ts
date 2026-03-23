import {
  BackendAHttpError,
  createBackendAHttpClient,
} from '@/shared/api/backend-a/backend-a-http-client'
import type { AuthResult } from '@/shared/types/modules'

import type { MemberAuthSessionPersistence } from '../../../domain/member-auth'
import type { MemberAuthSession } from '../../../domain/member-auth-session'
import type { BackendAUserProfileDto } from '../../dto/backend-a-member-auth.dto'
import { mapBackendAUserProfileToAuthResult } from '../../mappers/backend-a-member-auth-mapper'

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

export async function hydrateBackendAMemberAuthSession(
  memberAuthSession: MemberAuthSession,
) {
  const authResult = memberAuthSession.getSnapshot().authResult

  if (!authResult?.session.accessToken) {
    return
  }

  const httpClient = createBackendAHttpClient({
    getAccessToken: () => authResult.session.accessToken,
  })

  try {
    const profile = await httpClient.get<BackendAUserProfileDto>('/api/v1/auth/profile')

    replaceMemberAuthSession(
      memberAuthSession,
      mapBackendAUserProfileToAuthResult(profile, authResult.session, authResult),
    )
  } catch (error) {
    if (error instanceof BackendAHttpError && error.status === 401) {
      memberAuthSession.clear()
      return
    }
  }
}
