import { computed } from 'vue'
import { useRouter, type RouteRecordNormalized } from 'vue-router'

interface NavigationItem {
  label: string
  order: number
  to: string
}

function isNavigationRecord(
  route: RouteRecordNormalized,
): route is RouteRecordNormalized & { meta: { navLabel: string; navOrder?: number } } {
  return typeof route.meta.navLabel === 'string' && route.path !== ''
}

export function useNavigationItems() {
  const router = useRouter()

  return computed<NavigationItem[]>(() =>
    router
      .getRoutes()
      .filter(isNavigationRecord)
      .map((route) => ({
        label: route.meta.navLabel,
        order: typeof route.meta.navOrder === 'number' ? route.meta.navOrder : 999,
        to: route.path,
      }))
      .sort((left, right) => left.order - right.order),
  )
}
