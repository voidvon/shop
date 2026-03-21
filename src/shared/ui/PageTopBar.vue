<script setup lang="ts">
import { computed } from 'vue'

import type { TopBarMenuItem } from '@/shared/config/main-navigation'

import TopBarMoreMenuButton from './TopBarMoreMenuButton.vue'

type IconTone = 'default' | 'dark'
type RightMenuPreset = 'none' | 'main-nav'

const props = withDefaults(defineProps<{
  backAriaLabel?: string
  backTone?: IconTone
  rightAriaLabel?: string
  rightIcon?: string
  rightMenuItems?: TopBarMenuItem[]
  rightMenuPreset?: RightMenuPreset
  rightTone?: IconTone
  showBack?: boolean
  title: string
}>(), {
  backAriaLabel: '返回上一页',
  backTone: 'dark',
  rightAriaLabel: '更多操作',
  rightIcon: undefined,
  rightMenuPreset: 'none',
  rightTone: 'default',
  showBack: true,
})

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'right'): void
  (e: 'right-menu-select', item: TopBarMenuItem): void
}>()

const usesRightMenu = computed(() => {
  if (!props.rightIcon) {
    return false
  }

  return props.rightIcon === 'ellipsis'
    || props.rightMenuPreset === 'main-nav'
    || Boolean(props.rightMenuItems?.length)
})
</script>

<template>
  <header class="page-top-bar">
    <button
      v-if="showBack"
      class="icon-button"
      :class="`icon-button-${backTone}`"
      type="button"
      :aria-label="backAriaLabel"
      @click="emit('back')"
    >
      <van-icon name="arrow-left" size="20" />
    </button>
    <span v-else class="top-bar-spacer" aria-hidden="true" />

    <strong>{{ title }}</strong>

    <TopBarMoreMenuButton
      v-if="rightIcon && usesRightMenu"
      :aria-label="rightAriaLabel"
      :icon="rightIcon"
      :menu-items="rightMenuItems"
      :tone="rightTone"
      @select="emit('right-menu-select', $event)"
    />
    <button
      v-else-if="rightIcon"
      class="icon-button"
      :class="`icon-button-${rightTone}`"
      type="button"
      :aria-label="rightAriaLabel"
      @click="emit('right')"
    >
      <van-icon :name="rightIcon" size="20" />
    </button>
    <span v-else class="top-bar-spacer" aria-hidden="true" />
  </header>
</template>

<style scoped>
.page-top-bar {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) 24px;
  gap: 16px;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eeeae5;
  background: #fff;
}

.page-top-bar strong {
  color: #1a1918;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
}

.top-bar-spacer {
  width: 24px;
  height: 24px;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #9c9b99;
}

.icon-button-dark {
  color: #3c3b39;
}

.icon-button-default {
  color: #6d6c6a;
}
</style>
