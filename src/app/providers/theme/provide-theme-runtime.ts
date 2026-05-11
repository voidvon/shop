import type { App } from 'vue'

import { createThemeRuntime } from './create-theme-runtime'
import { provideThemeRuntimeContext } from './theme-runtime-provider'

export function provideThemeRuntime(app: App) {
  const runtime = createThemeRuntime()
  provideThemeRuntimeContext(app, runtime)
  return runtime
}
