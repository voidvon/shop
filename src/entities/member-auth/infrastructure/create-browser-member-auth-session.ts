import type { AuthResult } from '@/shared/types/modules'

import {
  createGuestMemberAuthSessionSnapshot,
  createMemberAuthSessionSnapshot,
  type MemberAuthSessionPersistence,
} from '../domain/member-auth'
import type {
  MemberAuthSession,
  MemberAuthSessionListener,
} from '../domain/member-auth-session'

const memberAuthStorageKey = 'shop.member-auth.session'

function canUseStorage() {
  return typeof window !== 'undefined'
}

export function readStoredMemberAuthResult(): AuthResult | null {
  if (!canUseStorage()) {
    return null
  }

  const storedValue = window.localStorage.getItem(memberAuthStorageKey)
    ?? window.sessionStorage.getItem(memberAuthStorageKey)

  if (!storedValue) {
    return null
  }

  try {
    return JSON.parse(storedValue) as AuthResult
  } catch {
    window.localStorage.removeItem(memberAuthStorageKey)
    window.sessionStorage.removeItem(memberAuthStorageKey)
    return null
  }
}

function clearStoredAuthResult() {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.removeItem(memberAuthStorageKey)
  window.sessionStorage.removeItem(memberAuthStorageKey)
}

function persistAuthResult(
  authResult: AuthResult,
  persistence: MemberAuthSessionPersistence,
) {
  if (!canUseStorage()) {
    return
  }

  const serialized = JSON.stringify(authResult)

  if (persistence === 'local') {
    window.localStorage.setItem(memberAuthStorageKey, serialized)
    window.sessionStorage.removeItem(memberAuthStorageKey)
    return
  }

  window.sessionStorage.setItem(memberAuthStorageKey, serialized)
  window.localStorage.removeItem(memberAuthStorageKey)
}

export function createBrowserMemberAuthSession(): MemberAuthSession {
  let snapshot = createMemberAuthSessionSnapshot(readStoredMemberAuthResult())
  const listeners = new Set<MemberAuthSessionListener>()

  function notifyListeners() {
    listeners.forEach((listener) => {
      listener(snapshot)
    })
  }

  return {
    clear() {
      snapshot = createGuestMemberAuthSessionSnapshot()
      clearStoredAuthResult()
      notifyListeners()
    },

    getSnapshot() {
      return snapshot
    },

    setAuthResult(authResult, options) {
      snapshot = createMemberAuthSessionSnapshot(authResult)
      persistAuthResult(authResult, options?.persistence ?? 'local')
      notifyListeners()
    },

    subscribe(listener) {
      listeners.add(listener)

      return () => {
        listeners.delete(listener)
      }
    },
  }
}

export function getBrowserMemberAuthSessionSnapshot() {
  return createMemberAuthSessionSnapshot(readStoredMemberAuthResult())
}
