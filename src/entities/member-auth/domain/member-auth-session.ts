import type { AuthResult } from '@/shared/types/modules'

import type {
  MemberAuthSessionPersistence,
  MemberAuthSessionSnapshot,
} from './member-auth'

export interface MemberAuthSession {
  clear(): void
  getSnapshot(): MemberAuthSessionSnapshot
  setAuthResult(
    authResult: AuthResult,
    options?: { persistence?: MemberAuthSessionPersistence },
  ): void
}
