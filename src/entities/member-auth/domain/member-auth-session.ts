import type { AuthResult } from '@/shared/types/modules'

import type {
  MemberAuthSessionPersistence,
  MemberAuthSessionSnapshot,
} from './member-auth'

export type MemberAuthSessionListener = (snapshot: MemberAuthSessionSnapshot) => void

export interface MemberAuthSession {
  clear(): void
  getSnapshot(): MemberAuthSessionSnapshot
  setAuthResult(
    authResult: AuthResult,
    options?: { persistence?: MemberAuthSessionPersistence },
  ): void
  subscribe(listener: MemberAuthSessionListener): () => void
}
