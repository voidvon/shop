import { useBackendRuntime } from '@/app/providers/backend'
import { listEnabledModuleManifests } from '@/shared/config/modules'
import type { FrontendModule } from '@/shared/config/modules'

export function useModuleAvailability(moduleName: FrontendModule) {
  return useBackendRuntime().enabledModules[moduleName]
}

export function useEnabledModuleManifests() {
  return listEnabledModuleManifests(useBackendRuntime().enabledModules)
}
