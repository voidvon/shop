<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const tabs = [
  { label: '首页', to: '/', icon: 'home-o' },
  { label: '分类', to: '/category', icon: 'apps-o' },
  { label: '购物车', to: '/cart', icon: 'shopping-cart-o' },
  { label: '我的', to: '/member', icon: 'contact-o' },
] as const

const activePath = computed(() => route.path)
</script>

<template>
  <div class="shell">
    <div class="app-frame">
      <main class="content">
        <slot />
      </main>

      <nav class="bottom-nav">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.to"
          :to="tab.to"
          class="tab-link"
          :class="{ 'tab-link-active': activePath === tab.to }"
        >
          <van-icon :name="tab.icon" size="20" />
          <span>{{ tab.label }}</span>
        </RouterLink>
      </nav>
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

.bottom-nav {
  position: fixed;
  left: 50%;
  bottom: calc(var(--app-bottom-nav-gap) + env(safe-area-inset-bottom, 0px));
  transform: translateX(-50%);
  width: min(360px, calc(100vw - 40px));
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 999px;
  background: rgba(250, 250, 248, 0.82);
  backdrop-filter: blur(18px);
  box-shadow: 0 8px 24px rgba(26, 25, 24, 0.08);
}

.tab-link {
  flex: 1;
  display: grid;
  gap: 4px;
  justify-items: center;
  padding: 10px 8px;
  border-radius: 999px;
  color: #a8a7a5;
  font-size: 0.56rem;
}

.tab-link span {
  line-height: 1;
}

.tab-link-active {
  background: #c8f0d8;
  color: #3d8a5a;
}
</style>
