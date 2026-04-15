<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { RouterView } from 'vue-router'

import { useBackendRuntime } from '@/app/providers/backend'
import { hydrateBackendAMemberAuthSession } from '@/entities/member-auth'
import { useCustomerServiceUnreadStore } from '@/processes/customer-service'
import AppShell from '@/shared/ui/AppShell.vue'

const runtime = useBackendRuntime()
const customerServiceUnreadStore = useCustomerServiceUnreadStore()

function resolveRouteViewKey(route: RouteLocationNormalizedLoaded) {
  return String(route.name ?? route.path)
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
