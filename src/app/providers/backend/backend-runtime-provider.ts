import { inject, type App, type InjectionKey } from 'vue'

import type { BackendRuntime } from './create-backend-runtime'

const backendRuntimeKey: InjectionKey<BackendRuntime> = Symbol('backend-runtime')
let activeBackendRuntime: BackendRuntime | null = null

export function provideBackendRuntimeContext(app: App, runtime: BackendRuntime) {
  activeBackendRuntime = runtime
  app.provide(backendRuntimeKey, runtime)
}

export function getBackendRuntime() {
  return activeBackendRuntime
}

export function useBackendRuntime() {
  const runtime = inject(backendRuntimeKey)

  if (!runtime) {
    throw new Error('BackendRuntime is not available. Ensure provideBackendRuntime(app) runs during bootstrap.')
  }

  return runtime
}
