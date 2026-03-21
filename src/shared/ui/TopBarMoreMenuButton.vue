<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { PopoverAction } from 'vant'

import { createMainNavigationMenuItems, type TopBarMenuItem } from '@/shared/config/main-navigation'

type IconTone = 'default' | 'dark'
type TopBarPopoverAction = PopoverAction & TopBarMenuItem

const props = withDefaults(defineProps<{
  ariaLabel?: string
  icon?: string
  menuItems?: TopBarMenuItem[]
  tone?: IconTone
}>(), {
  ariaLabel: '更多操作',
  icon: 'ellipsis',
  tone: 'default',
})

const emit = defineEmits<{
  (e: 'select', item: TopBarMenuItem): void
}>()

const router = useRouter()
const menuVisible = ref(false)

const resolvedMenuItems = computed(() => {
  if (props.menuItems && props.menuItems.length > 0) {
    return props.menuItems
  }

  return createMainNavigationMenuItems(router.getRoutes())
})

const popoverActions = computed<TopBarPopoverAction[]>(() => {
  return resolvedMenuItems.value.map((item) => ({
    ...item,
    text: item.label,
  }))
})

async function handleSelect(action: TopBarPopoverAction) {
  emit('select', action)

  if (action.to) {
    await router.push(action.to)
  }
}
</script>

<template>
  <van-popover
    v-model:show="menuVisible"
    :actions="popoverActions"
    placement="bottom-end"
    teleport="body"
    @select="handleSelect"
  >
    <template #reference>
      <button
        class="icon-button"
        :class="`icon-button-${tone}`"
        type="button"
        :aria-label="ariaLabel"
      >
        <van-icon :name="icon" size="20" />
      </button>
    </template>
  </van-popover>
</template>

<style scoped>
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
