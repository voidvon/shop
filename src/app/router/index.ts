import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
  type RouterScrollBehavior,
} from 'vue-router'
import NProgress from 'nprogress'

import { getBrowserMemberAuthSessionSnapshot } from '@/entities/member-auth'

import { routes } from './routes'

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 120,
})

interface RouteScrollPosition {
  left: number
  top: number
}

const routeScrollPositions = new Map<string, RouteScrollPosition>()

function resolveRouteScrollKey(route: Pick<RouteLocationNormalized, 'fullPath'>) {
  return route.fullPath
}

function saveRouteScrollPosition(route: Pick<RouteLocationNormalized, 'fullPath'>) {
  if (typeof window === 'undefined') {
    return
  }

  routeScrollPositions.set(resolveRouteScrollKey(route), {
    left: window.scrollX,
    top: window.scrollY,
  })
}

const scrollBehavior: RouterScrollBehavior = (to, _, savedPosition) => {
  if (savedPosition) {
    return savedPosition
  }

  const cachedPosition = routeScrollPositions.get(resolveRouteScrollKey(to))

  if (cachedPosition) {
    return cachedPosition
  }

  if (to.hash) {
    return {
      el: to.hash,
      top: 0,
    }
  }

  return { top: 0 }
}

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior,
})

router.beforeEach((to, from) => {
  if (to.fullPath !== from.fullPath) {
    NProgress.start()
  }

  saveRouteScrollPosition(from)

  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth === true)

  if (!requiresAuth) {
    return true
  }

  const authSnapshot = getBrowserMemberAuthSessionSnapshot()

  if (authSnapshot.isAuthenticated) {
    return true
  }

  return {
    name: 'member-login',
    query: {
      redirect: to.fullPath,
    },
  }
})

router.afterEach(() => {
  NProgress.done()
})

router.onError(() => {
  NProgress.done()
})
