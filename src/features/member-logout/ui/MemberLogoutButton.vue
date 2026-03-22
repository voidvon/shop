<script setup lang="ts">
import { computed } from 'vue'
import {
  showConfirmDialog,
  showSuccessToast,
  showToast,
} from 'vant'

import { useMemberAuthSession } from '@/entities/member-auth'

import { logoutMember } from '../application/logout-member'

const props = withDefaults(defineProps<{
  disabled?: boolean
}>(), {
  disabled: false,
})

const emit = defineEmits<{
  (e: 'logged-out'): void
}>()

const memberAuthSession = useMemberAuthSession()
const isDisabled = computed(() => props.disabled)

async function handleLogout() {
  if (isDisabled.value) {
    return
  }

  try {
    await showConfirmDialog({
      title: '退出登录',
      message: '确认退出当前账号吗？',
      theme: 'round-button',
    })

    const result = await logoutMember(memberAuthSession)
    showSuccessToast(result.successMessage)
    emit('logged-out')
  } catch (error) {
    if (error === 'cancel') {
      return
    }

    showToast(error instanceof Error ? error.message : '退出登录失败')
  }
}
</script>

<template>
  <van-button
    class="member-logout-button"
    plain
    round
    size="small"
    type="default"
    :disabled="isDisabled"
    @click="handleLogout"
  >
    退出登录
  </van-button>
</template>

<style scoped>
.member-logout-button {
  min-width: 96px;
  border-color: rgba(255, 255, 255, 0.42);
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  backdrop-filter: blur(8px);
}
</style>
