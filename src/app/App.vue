<script setup lang="ts">
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { RouterView } from 'vue-router'

import AppShell from '@/shared/ui/AppShell.vue'

function resolveRouteViewKey(route: RouteLocationNormalizedLoaded) {
  return String(route.name ?? route.path)
}
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
