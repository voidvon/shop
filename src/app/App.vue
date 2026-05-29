<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { RouterView, useRoute } from 'vue-router'

import { useBackendRuntime } from '@/app/providers/backend'
import { hydrateBackendAMemberAuthSession } from '@/entities/member-auth'
import { useCustomerServiceUnreadStore } from '@/processes/customer-service'
import { usePlatformSettingsStore } from '@/processes/storefront'
import AppShell from '@/shared/ui/AppShell.vue'

const runtime = useBackendRuntime()
const customerServiceUnreadStore = useCustomerServiceUnreadStore()
const platformSettingsStore = usePlatformSettingsStore()
const route = useRoute()
const defaultDocumentTitle = typeof document === 'undefined'
  ? '商城'
  : (document.title.trim() || '商城')
const routeTitle = computed(() => typeof route.meta.title === 'string' ? route.meta.title.trim() : '')
const platformCompanyName = computed(() => platformSettingsStore.companyName.trim())

function resolveRouteViewKey(route: RouteLocationNormalizedLoaded) {
  return String(route.name ?? route.path)
}

function resolveDocumentTitle() {
  const companyName = platformCompanyName.value.trim() || defaultDocumentTitle

  if (!routeTitle.value || routeTitle.value === '商城首页' || routeTitle.value === companyName) {
    return companyName
  }

  return `${routeTitle.value} - ${companyName}`
}

function syncDocumentTitle() {
  if (typeof document === 'undefined') {
    return
  }

  document.title = resolveDocumentTitle()
}

async function loadPlatformCompanyName() {
  await platformSettingsStore.loadPlatformSettings()
}

function handleVisibilityChange() {
  if (typeof document === 'undefined' || document.visibilityState !== 'visible') {
    return
  }

  if (runtime.type === 'backend-a' && runtime.auth.session.getSnapshot().authResult) {
    void hydrateBackendAMemberAuthSession(runtime.auth.session)
  }

  void customerServiceUnreadStore.refreshUnreadSummary({ silent: true })
}

onMounted(() => {
  customerServiceUnreadStore.startPolling()
  syncDocumentTitle()
  void loadPlatformCompanyName()

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }
})

onBeforeUnmount(() => {
  customerServiceUnreadStore.stopPolling()

  if (typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
})

watch([routeTitle, platformCompanyName], () => {
  syncDocumentTitle()
}, { immediate: true })
</script>

<template>
  <AppShell>
    <RouterView v-slot="{ Component, route }">
      <KeepAlive>
        <component
          :is="Component"
          v-if="route.meta.keepAlive"
          :key="resolveRouteViewKey(route)"
        />
      </KeepAlive>
      <component
        :is="Component"
        v-if="!route.meta.keepAlive"
        :key="route.fullPath"
      />
    </RouterView>
  </AppShell>
</template>
