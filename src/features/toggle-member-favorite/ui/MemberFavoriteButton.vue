<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showSuccessToast, showToast } from 'vant'

import { useMemberAuthSession } from '@/entities/member-auth'
import { useMemberFavoriteStore } from '@/entities/member-favorite'
import {
  clearPendingMemberFavoriteIntent,
  readPendingMemberFavoriteIntent,
  savePendingMemberFavoriteIntent,
} from '../infrastructure/pending-member-favorite-intent'

const props = defineProps<{
  productId: string
  productImageUrl: string | null
  productName: string
  productPrice: number
  storeName: string
}>()

const route = useRoute()
const router = useRouter()
const memberAuthSession = useMemberAuthSession()
const memberFavoriteStore = useMemberFavoriteStore()

const isFavorited = computed(() => memberFavoriteStore.isProductFavorited(props.productId))
const isSubmitting = computed(() => memberFavoriteStore.pendingProductId === props.productId)

async function syncFavoriteState() {
  const authSnapshot = memberAuthSession.getSnapshot()
  const userId = authSnapshot.authResult?.userInfo.userId

  if (!userId) {
    return
  }

  try {
    await memberFavoriteStore.syncCurrentUserFavorites()
    await resumePendingFavorite()
  } catch {
    // Keep the latest known store state when sync fails.
  }
}

async function goToLogin() {
  savePendingMemberFavoriteIntent({
    productId: props.productId,
    redirectPath: route.fullPath,
  })

  showToast('登录后可收藏商品')

  await router.push({
    name: 'member-login',
    query: {
      redirect: route.fullPath,
    },
  })
}

async function handleToggleFavorite() {
  if (isSubmitting.value) {
    return
  }

  const authSnapshot = memberAuthSession.getSnapshot()
  const userId = authSnapshot.authResult?.userInfo.userId

  if (!userId) {
    await goToLogin()
    return
  }

  try {
    const result = await memberFavoriteStore.toggleFavorite({
      productId: props.productId,
      productImageUrl: props.productImageUrl,
      productName: props.productName,
      productPrice: props.productPrice,
      storeName: props.storeName,
    })
    showSuccessToast(result.successMessage)
  } catch (error) {
    showToast(error instanceof Error ? error.message : '收藏操作失败')
  }
}

async function resumePendingFavorite() {
  const pendingIntent = readPendingMemberFavoriteIntent()

  if (!pendingIntent) {
    return
  }

  if (pendingIntent.productId !== props.productId || pendingIntent.redirectPath !== route.fullPath) {
    return
  }

  const result = await memberFavoriteStore.ensureFavorite({
    productId: props.productId,
    productImageUrl: props.productImageUrl,
    productName: props.productName,
    productPrice: props.productPrice,
    storeName: props.storeName,
  })

  clearPendingMemberFavoriteIntent()

  if (result.successMessage) {
    showSuccessToast(result.successMessage)
  }
}

watch(
  () => [props.productId, memberFavoriteStore.currentUserId] as const,
  () => {
    void syncFavoriteState()
  },
  { immediate: true },
)
</script>

<template>
  <button
    class="member-favorite-button"
    type="button"
    :aria-label="isFavorited ? '取消收藏商品' : '收藏商品'"
    :disabled="isSubmitting"
    @click="handleToggleFavorite"
  >
    <van-icon :name="isFavorited ? 'like' : 'like-o'" size="20" />
  </button>
</template>

<style scoped>
.member-favorite-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: #d9b8bb;
}

.member-favorite-button:disabled {
  opacity: 0.7;
}

.member-favorite-button :deep(.van-icon-like) {
  color: #ea580c;
}
</style>
