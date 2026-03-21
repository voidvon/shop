<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import MainBottomNav from './MainBottomNav.vue'

const route = useRoute()

const activeNavKey = computed(() => {
  if (route.name === 'home') {
    return 'home'
  }

  if (route.name === 'category') {
    return 'category'
  }

  if (route.name === 'cart') {
    return 'cart'
  }

  if (route.name === 'member') {
    return 'member'
  }

  return undefined
})

const showBottomNav = computed(() => activeNavKey.value !== undefined)
</script>

<template>
  <div class="shell">
    <div class="app-frame">
      <main class="content">
        <slot />
      </main>

      <MainBottomNav v-if="showBottomNav" :active-key="activeNavKey" variant="floating" />
    </div>
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  justify-content: center;
  width: 100%;
}

.app-frame {
  position: relative;
  --app-bottom-nav-gap: 24px;
  --app-bottom-nav-height: 64px;
  --app-bottom-nav-offset: calc(
    var(--app-bottom-nav-gap) + var(--app-bottom-nav-height) + env(safe-area-inset-bottom, 0px)
  );
  width: min(402px, 100vw);
  min-height: 100vh;
  min-height: 100dvh;
}

.content {
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
}

</style>
