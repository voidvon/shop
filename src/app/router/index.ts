import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'

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
})

router.afterEach(() => {
  NProgress.done()
})

router.onError(() => {
  NProgress.done()
})
