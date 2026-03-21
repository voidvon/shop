import { resolveAppRoutes } from '@/app/composition'
import { backendTarget } from '@/shared/config/backend'
import { listEnabledModules, resolveRuntimeEnabledModules } from '@/shared/config/modules'

const enabledRouteModules = new Set(listEnabledModules(resolveRuntimeEnabledModules(backendTarget)))
export const routes = resolveAppRoutes([...enabledRouteModules])
