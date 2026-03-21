import type { RouteMeta, RouteRecordNormalized, RouteRecordRaw } from 'vue-router'

export type MainNavigationKey = 'home' | 'category' | 'cart' | 'member'

export interface MainNavigationItem {
  icon: string
  key: MainNavigationKey
  label: string
  order: number
  to: string
}

export interface TopBarMenuItem {
  color?: string
  disabled?: boolean
  icon?: string
  key: string
  label: string
  to?: string
}

export interface MainNavigationMeta {
  icon: string
  key: MainNavigationKey
  label: string
  order: number
  to: string
}

type NavigationRoute = Pick<RouteRecordNormalized, 'meta'> | Pick<RouteRecordRaw, 'meta'>

interface MainNavigationRouteMeta extends RouteMeta {
  activeMainNavigationKey?: MainNavigationKey
  mainNavigation?: MainNavigationMeta
}

function resolveRouteMeta(route: NavigationRoute | { meta?: RouteMeta }) {
  return (route.meta ?? {}) as MainNavigationRouteMeta
}

function isMainNavigationKey(value: unknown): value is MainNavigationKey {
  return value === 'home' || value === 'category' || value === 'cart' || value === 'member'
}

export function resolveActiveMainNavigationKey(route: { meta?: RouteMeta }) {
  const key = resolveRouteMeta(route).activeMainNavigationKey
  return isMainNavigationKey(key) ? key : undefined
}

export function resolveMainNavigationItems(routes: readonly NavigationRoute[]) {
  const itemByKey = new Map<MainNavigationKey, MainNavigationItem>()

  routes.forEach((route) => {
    const mainNavigation = resolveRouteMeta(route).mainNavigation

    if (!mainNavigation || itemByKey.has(mainNavigation.key)) {
      return
    }

    itemByKey.set(mainNavigation.key, { ...mainNavigation })
  })

  return [...itemByKey.values()].sort((left, right) => left.order - right.order)
}

export function createMainNavigationMenuItems(routes: readonly NavigationRoute[]): TopBarMenuItem[] {
  return resolveMainNavigationItems(routes).map(({ icon, key, label, to }) => ({
    icon,
    key,
    label,
    to,
  }))
}
