import { computed } from 'vue'

import { useBackendRuntime } from '@/app/providers/backend'
import { listEnabledModuleManifests } from '@/shared/config/modules'
import type { FrontendModule } from '@/shared/config/modules'

export function useModuleAvailability(moduleName: FrontendModule) {
  const runtime = useBackendRuntime()
  return computed(() => runtime.enabledModules[moduleName])
}

export function useEnabledModuleManifests() {
  const runtime = useBackendRuntime()
  return computed(() => listEnabledModuleManifests(runtime.enabledModules))
}
