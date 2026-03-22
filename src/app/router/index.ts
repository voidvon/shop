import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'

import { getBrowserMemberAuthSessionSnapshot } from '@/entities/member-auth'

import { routes } from './routes'

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 120,
})

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, from) => {
  if (to.fullPath !== from.fullPath) {
    NProgress.start()
  }

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
