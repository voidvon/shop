import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
  type RouteLocationRaw,
  type RouterScrollBehavior,
} from 'vue-router'
import NProgress from 'nprogress'
import { showLoadingToast, showToast } from 'vant'

import { getBrowserMemberAuthSessionSnapshot } from '@/entities/member-auth'
import { submitMemberWechatLogin } from '@/features/member-auth'
import { getBackendRuntime } from '@/app/providers/backend/backend-runtime-provider'
import {
  consumePendingWechatLoginRedirectPath,
  consumePendingWechatLoginState,
  isWechatBrowser,
  startWechatOauthLogin,
} from '@/shared/lib/wechat-browser'

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

function normalizeRouteRedirect(value: unknown) {
  return typeof value === 'string' && value.startsWith('/') ? value : null
}

function buildRouteWithoutWechatAuthQuery(to: RouteLocationNormalized): RouteLocationRaw {
  const nextQuery = { ...to.query }

  delete nextQuery.code
  delete nextQuery.state

  return {
    hash: to.hash,
    path: to.path,
    query: Object.keys(nextQuery).length > 0 ? nextQuery : undefined,
    replace: true,
  }
}

async function tryHandleWechatOauthCallback(to: RouteLocationNormalized) {
  const code = typeof to.query.code === 'string' ? to.query.code.trim() : ''

  if (!code) {
    return null
  }

  const expectedState = consumePendingWechatLoginState()
  const state = typeof to.query.state === 'string' ? to.query.state.trim() : ''

  if (expectedState && state && expectedState !== state) {
    showToast('微信登录状态校验失败，请重试')
    return buildRouteWithoutWechatAuthQuery(to)
  }

  const runtime = getBackendRuntime()

  if (!runtime) {
    showToast('当前运行时未初始化')
    return buildRouteWithoutWechatAuthQuery(to)
  }

  const loadingToast = showLoadingToast({
    duration: 0,
    forbidClick: true,
    message: '正在登录...',
  })

  try {
    const result = await submitMemberWechatLogin(code, {
      repository: runtime.auth.repository,
      session: runtime.auth.session,
    })
    showToast(result.successMessage)

    const pendingRedirectPath = consumePendingWechatLoginRedirectPath()
    return pendingRedirectPath && pendingRedirectPath !== '/member/login'
      ? pendingRedirectPath
      : buildRouteWithoutWechatAuthQuery(to)
  } catch (error) {
    showToast(error instanceof Error ? error.message : '微信登录失败')

    const pendingRedirectPath = consumePendingWechatLoginRedirectPath()
    return {
      name: 'member-login',
      query: {
        ...(pendingRedirectPath ? { redirect: pendingRedirectPath } : {}),
      },
      replace: true,
    }
  } finally {
    loadingToast.close()
  }
}

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior,
})

router.beforeEach(async (to, from) => {
  if (to.fullPath !== from.fullPath) {
    NProgress.start()
  }

  saveRouteScrollPosition(from)

  const wechatCallbackRedirect = await tryHandleWechatOauthCallback(to)

  if (wechatCallbackRedirect) {
    return wechatCallbackRedirect
  }

  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth === true)

  if (!requiresAuth) {
    return true
  }

  const authSnapshot = getBrowserMemberAuthSessionSnapshot()

  if (authSnapshot.isAuthenticated) {
    return true
  }

  if (isWechatBrowser()) {
    const result = await startWechatOauthLogin(to.fullPath)

    if (result.redirected) {
      NProgress.done()
      return false
    }

    if (result.succeeded) {
      return true
    }

    if (result.message) {
      showToast(result.message)
    }
  }

  return {
    name: 'member-login',
    query: {
      redirect: normalizeRouteRedirect(to.fullPath) ?? '/member',
    },
  }
})

router.afterEach(() => {
  NProgress.done()
})

router.onError(() => {
  NProgress.done()
})
