import { inject, type App, type InjectionKey } from 'vue'

import type { ThemeRuntime } from './create-theme-runtime'

const themeRuntimeKey: InjectionKey<ThemeRuntime> = Symbol('theme-runtime')
let activeThemeRuntime: ThemeRuntime | null = null

export function provideThemeRuntimeContext(app: App, runtime: ThemeRuntime) {
  activeThemeRuntime = runtime
  app.provide(themeRuntimeKey, runtime)
}

export function getThemeRuntime() {
  return activeThemeRuntime
}

export function useThemeRuntime() {
  const runtime = inject(themeRuntimeKey)

  if (!runtime) {
    throw new Error('ThemeRuntime is not available. Ensure provideThemeRuntime(app) runs during bootstrap.')
  }

  return runtime
}
