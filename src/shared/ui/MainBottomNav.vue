<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

type BottomNavKey = 'home' | 'category' | 'cart' | 'member'
type BottomNavVariant = 'floating' | 'bar'

interface BottomNavItem {
  icon: string
  key: BottomNavKey
  label: string
  to: string
}

const props = withDefaults(defineProps<{
  activeKey?: BottomNavKey
  itemKeys?: BottomNavKey[]
  variant?: BottomNavVariant
}>(), {
  variant: 'floating',
})

const items: BottomNavItem[] = [
  { key: 'home', label: '首页', to: '/', icon: 'home-o' },
  { key: 'category', label: '分类', to: '/category', icon: 'apps-o' },
  { key: 'cart', label: '购物车', to: '/cart', icon: 'shopping-cart-o' },
  { key: 'member', label: '我的', to: '/member', icon: 'contact-o' },
]

const visibleItems = computed(() => {
  if (!props.itemKeys || props.itemKeys.length === 0) {
    return items
  }

  const enabledKeys = new Set(props.itemKeys)
  return items.filter((item) => enabledKeys.has(item.key))
})
</script>

<template>
  <nav class="main-bottom-nav" :class="`main-bottom-nav-${variant}`">
    <RouterLink
      v-for="item in visibleItems"
      :key="item.key"
      :to="item.to"
      class="main-bottom-nav-item"
      :class="{ 'main-bottom-nav-item-active': item.key === activeKey }"
    >
      <van-icon :name="item.icon" size="20" />
      <span>{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.main-bottom-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.main-bottom-nav-item {
  flex: 1;
  display: grid;
  gap: 4px;
  justify-items: center;
  color: #a8a7a5;
  line-height: 1;
}

.main-bottom-nav-item span {
  line-height: 1;
}

.main-bottom-nav-floating {
  position: fixed;
  left: 50%;
  bottom: calc(var(--app-bottom-nav-gap) + env(safe-area-inset-bottom, 0px));
  transform: translateX(-50%);
  width: min(360px, calc(100vw - 40px));
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 999px;
  background: rgba(250, 250, 248, 0.82);
  backdrop-filter: blur(18px);
  box-shadow: 0 8px 24px rgba(26, 25, 24, 0.08);
}

.main-bottom-nav-floating .main-bottom-nav-item {
  padding: 10px 8px;
  border-radius: 999px;
  font-size: 0.56rem;
}

.main-bottom-nav-floating .main-bottom-nav-item-active {
  background: #c8f0d8;
  color: #3d8a5a;
}

.main-bottom-nav-bar {
  width: 100%;
  height: 72px;
  padding: 8px 24px calc(12px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid #e5e4e1;
  background: #fff;
}

.main-bottom-nav-bar .main-bottom-nav-item {
  font-size: 10px;
  font-weight: 500;
}

.main-bottom-nav-bar .main-bottom-nav-item-active {
  color: #6d6c6a;
}
</style>
