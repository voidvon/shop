import { inject, type App, type InjectionKey } from 'vue'

import type { BackendRuntime } from './create-backend-runtime'

const backendRuntimeKey: InjectionKey<BackendRuntime> = Symbol('backend-runtime')

export function provideBackendRuntimeContext(app: App, runtime: BackendRuntime) {
  app.provide(backendRuntimeKey, runtime)
}

export function useBackendRuntime() {
  const runtime = inject(backendRuntimeKey)

  if (!runtime) {
    throw new Error('BackendRuntime is not available. Ensure provideBackendRuntime(app) runs during bootstrap.')
  }

  return runtime
}
