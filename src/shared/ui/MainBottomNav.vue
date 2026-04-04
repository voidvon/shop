<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { showLoadingToast, showToast } from 'vant'

import { useMemberAuthSession } from '@/entities/member-auth'
import {
  resolveMainNavigationItems,
  type MainNavigationKey,
} from '@/shared/config/main-navigation'
import { isWechatBrowser, startWechatOauthLogin } from '@/shared/lib/wechat-browser'

type BottomNavVariant = 'floating' | 'bar'

const props = withDefaults(defineProps<{
  activeKey?: MainNavigationKey
  itemKeys?: MainNavigationKey[]
  variant?: BottomNavVariant
}>(), {
  variant: 'floating',
})

const router = useRouter()
const memberAuthSession = useMemberAuthSession()

const visibleItems = computed(() => {
  const availableItems = resolveMainNavigationItems(router.getRoutes())

  if (!props.itemKeys || props.itemKeys.length === 0) {
    return availableItems
  }

  const enabledKeys = new Set(props.itemKeys)
  return availableItems.filter((item) => enabledKeys.has(item.key))
})

async function handleNavigation(item: (typeof visibleItems.value)[number]) {
  if (item.key !== 'member') {
    await router.push(item.to)
    return
  }

  if (memberAuthSession.getSnapshot().authResult) {
    await router.push(item.to)
    return
  }

  if (isWechatBrowser()) {
    const loadingToast = showLoadingToast({
      duration: 0,
      forbidClick: true,
      message: '正在登录...',
    })
    const result = await startWechatOauthLogin(item.to)
    loadingToast.close()

    if (result.redirected || result.succeeded) {
      return
    }

    if (result.message) {
      showToast(result.message)
    }

    return
  }

  await router.push({
    name: 'member-login',
    query: {
      redirect: item.to,
    },
  })
}
</script>

<template>
  <nav class="main-bottom-nav" :class="`main-bottom-nav-${variant}`">
    <button
      v-for="item in visibleItems"
      :key="item.key"
      class="main-bottom-nav-item"
      :class="{ 'main-bottom-nav-item-active': item.key === activeKey }"
      type="button"
      @click="handleNavigation(item)"
    >
      <van-icon :name="item.icon" size="20" />
      <span>{{ item.label }}</span>
    </button>
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
  padding: 0;
  border: 0;
  background: transparent;
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
