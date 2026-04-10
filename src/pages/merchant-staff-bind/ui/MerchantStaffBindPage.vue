<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showFailToast, showLoadingToast, showSuccessToast, showToast } from 'vant'

import {
  hydrateBackendAMemberAuthSession,
  useMemberAuthSession,
} from '@/entities/member-auth'
import {
  type MerchantStaffInviteInfo,
  useMerchantStaffInviteService,
} from '@/processes/merchant-staff-invite'
import { startWechatOauthLogin } from '@/shared/lib/wechat-browser'
import EmptyState from '@/shared/ui/EmptyState.vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

const pendingBindStorageKey = 'shop.merchant-staff-bind.pending-token'

const route = useRoute()
const router = useRouter()
const memberAuthSession = useMemberAuthSession()
const merchantStaffInviteService = useMerchantStaffInviteService()

const authSnapshot = ref(memberAuthSession.getSnapshot())
const inviteInfo = ref<MerchantStaffInviteInfo | null>(null)
const errorMessage = ref<string | null>(null)
const isAuthenticating = ref(false)
const isBinding = ref(false)
const isBoundSuccessfully = ref(false)
const isLoading = ref(false)
const successMessage = ref('')

const stopAuthSubscription = memberAuthSession.subscribe((snapshot) => {
  authSnapshot.value = snapshot
})

onUnmounted(() => {
  stopAuthSubscription()
})

const inviteToken = computed(() => {
  const token = route.query.invite_token
  return typeof token === 'string' ? token.trim() : ''
})

const isAuthenticated = computed(() => authSnapshot.value.isAuthenticated)
const currentDisplayName = computed(() => {
  const userInfo = authSnapshot.value.authResult?.userInfo

  if (!userInfo) {
    return '当前微信账号'
  }

  return userInfo.nickname ?? userInfo.username
})

const merchantDisplayName = computed(() => inviteInfo.value?.merchantName ?? '商家')
const actionLabel = computed(() => {
  if (isBinding.value) {
    return '绑定中...'
  }

  if (isAuthenticating.value) {
    return '登录中...'
  }

  return isAuthenticated.value ? '确认绑定为员工' : '微信登录后绑定'
})

const formattedExpiry = computed(() => formatInviteTime(inviteInfo.value?.expiresAt ?? null))

function canUseSessionStorage() {
  return typeof window !== 'undefined'
}

function readPendingBindToken() {
  if (!canUseSessionStorage()) {
    return null
  }

  return window.sessionStorage.getItem(pendingBindStorageKey)
}

function savePendingBindToken(token: string) {
  if (!canUseSessionStorage()) {
    return
  }

  window.sessionStorage.setItem(pendingBindStorageKey, token)
}

function clearPendingBindToken(token?: string) {
  if (!canUseSessionStorage()) {
    return
  }

  if (!token || readPendingBindToken() === token) {
    window.sessionStorage.removeItem(pendingBindStorageKey)
  }
}

function formatInviteTime(value: string | null) {
  if (!value) {
    return '长期有效'
  }

  const normalizedValue = value.trim()

  if (!normalizedValue) {
    return '长期有效'
  }

  const date = new Date(normalizedValue)

  if (Number.isNaN(date.getTime())) {
    return normalizedValue
  }

  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  }).format(date)
}

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push('/')
}

function goHome() {
  void router.push('/')
}

function goMemberCenter() {
  void router.push({ name: 'member' })
}

async function loadInvite() {
  if (!inviteToken.value) {
    inviteInfo.value = null
    errorMessage.value = '缺少邀请参数，请使用完整邀请链接重新进入'
    return
  }

  isLoading.value = true
  errorMessage.value = null

  try {
    inviteInfo.value = await merchantStaffInviteService.getInviteByToken(inviteToken.value)
  } catch (error) {
    inviteInfo.value = null
    errorMessage.value = error instanceof Error ? error.message : '邀请信息加载失败'
  } finally {
    isLoading.value = false
  }
}

async function ensureAuthenticatedForBind(token: string) {
  if (isAuthenticated.value) {
    return true
  }

  isAuthenticating.value = true
  savePendingBindToken(token)
  const loadingToast = showLoadingToast({
    duration: 0,
    forbidClick: true,
    message: '登录中...',
  })

  try {
    const result = await startWechatOauthLogin(route.fullPath)

    if (result.redirected) {
      return false
    }

    if (result.succeeded) {
      if (result.successMessage) {
        showSuccessToast(result.successMessage)
      }

      return memberAuthSession.getSnapshot().isAuthenticated
    }

    clearPendingBindToken(token)

    if (result.message) {
      showToast(result.message)
    }

    return false
  } finally {
    loadingToast.close()
    isAuthenticating.value = false
  }
}

async function performBind() {
  if (!inviteInfo.value) {
    showFailToast(errorMessage.value ?? '邀请信息加载失败')
    return
  }

  isBinding.value = true
  const loadingToast = showLoadingToast({
    duration: 0,
    forbidClick: true,
    message: '绑定中...',
  })

  try {
    const result = await merchantStaffInviteService.bindInviteByToken(inviteInfo.value.token)
    await hydrateBackendAMemberAuthSession(memberAuthSession)
    clearPendingBindToken(inviteInfo.value.token)
    successMessage.value = result.successMessage
    isBoundSuccessfully.value = true
    showSuccessToast(result.successMessage)
  } catch (error) {
    const message = error instanceof Error ? error.message : '员工绑定失败'
    showFailToast(message)
  } finally {
    loadingToast.close()
    isBinding.value = false
  }
}

async function handleBind() {
  if (!inviteInfo.value) {
    showFailToast(errorMessage.value ?? '邀请信息加载失败')
    return
  }

  const authenticated = await ensureAuthenticatedForBind(inviteInfo.value.token)

  if (!authenticated) {
    return
  }

  await performBind()
}

watch(inviteToken, () => {
  isBoundSuccessfully.value = false
  successMessage.value = ''
  void loadInvite()
}, { immediate: true })

watch(
  [isAuthenticated, () => inviteInfo.value?.token ?? ''],
  ([authenticated, token]) => {
    if (!authenticated || !token || isBinding.value || isBoundSuccessfully.value) {
      return
    }

    if (readPendingBindToken() !== token) {
      return
    }

    clearPendingBindToken(token)
    void performBind()
  },
  { immediate: true },
)
</script>

<template>
  <section class="staff-bind-page">
    <PageTopBar title="员工绑定" right-icon="wap-home-o" @back="goBack" @right="goHome" />

    <div class="staff-bind-scroll">
      <LoadingState v-if="isLoading" fill text="正在加载邀请信息..." />

      <EmptyState
        v-else-if="errorMessage"
        boxed
        description-width="240px"
        icon="warning-o"
        title="邀请不可用"
        :description="errorMessage"
      />

      <template v-else-if="inviteInfo">
        <section v-if="isBoundSuccessfully" class="success-card">
          <div class="success-icon">
            <van-icon name="passed" size="28" />
          </div>
          <strong>绑定完成</strong>
          <p>{{ successMessage || '当前账号已绑定为商家员工，可继续使用相关员工能力。' }}</p>

          <div class="success-actions">
            <button type="button" class="primary-button" @click="goHome">
              返回首页
            </button>
            <button type="button" class="secondary-button" @click="goMemberCenter">
              进入我的
            </button>
          </div>
        </section>

        <template v-else>
          <section class="invite-hero">
            <span class="hero-badge">{{ inviteInfo.statusText || '员工邀请' }}</span>
            <h1>{{ merchantDisplayName }}</h1>
            <p>
              {{ inviteInfo.inviterName || '商家管理员' }}
              邀请你绑定为
              {{ inviteInfo.roleName || '商家员工' }}
            </p>
          </section>

          <section class="info-card">
            <div class="info-row">
              <span>商家名称</span>
              <strong>{{ merchantDisplayName }}</strong>
            </div>
            <div class="info-row">
              <span>员工角色</span>
              <strong>{{ inviteInfo.roleName || '商家员工' }}</strong>
            </div>
            <div class="info-row">
              <span>邀请人</span>
              <strong>{{ inviteInfo.inviterName || '商家管理员' }}</strong>
            </div>
            <div class="info-row">
              <span>有效期</span>
              <strong>{{ formattedExpiry }}</strong>
            </div>
          </section>

          <section class="notice-card">
            <strong>{{ isAuthenticated ? '当前可直接完成绑定' : '绑定前需要先登录当前微信账号' }}</strong>
            <p>
              {{
                isAuthenticated
                  ? `当前登录账号：${currentDisplayName}`
                  : '如果你还没登录，点击下方按钮会先进入现有登录流程，登录后会自动回到当前页面。'
              }}
            </p>
          </section>

          <div class="action-bar">
            <button
              type="button"
              class="primary-button"
              :disabled="isBinding || isAuthenticating"
              @click="handleBind"
            >
              {{ actionLabel }}
            </button>
          </div>
        </template>
      </template>
    </div>
  </section>
</template>

<style scoped>
.staff-bind-page {
  display: grid;
  grid-template-rows: 49px minmax(0, 1fr);
  min-height: 100vh;
  min-height: 100dvh;
  background:
    radial-gradient(circle at top left, rgba(245, 158, 11, 0.16), transparent 32%),
    linear-gradient(180deg, #fcf8f1 0%, #f3ece2 100%);
  overflow: hidden;
}

.staff-bind-scroll {
  min-height: 0;
  padding: 18px 16px 32px;
  overflow-y: auto;
}

.invite-hero,
.info-card,
.notice-card,
.success-card {
  border: 1px solid rgba(140, 112, 82, 0.12);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 14px 30px rgba(68, 48, 32, 0.06);
}

.invite-hero {
  display: grid;
  gap: 12px;
  padding: 22px 20px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-width: 72px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(245, 158, 11, 0.12);
  color: #b45309;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.invite-hero h1 {
  margin: 0;
  color: #29211b;
  font-size: 28px;
  line-height: 1.15;
}

.invite-hero p {
  margin: 0;
  color: #6b5b4d;
  font-size: 14px;
  line-height: 1.6;
}

.info-card,
.notice-card {
  margin-top: 14px;
  padding: 18px 16px;
}

.info-row {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.info-row + .info-row {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #f1ebe4;
}

.info-row span {
  color: #8c7c6f;
  font-size: 13px;
}

.info-row strong,
.notice-card strong,
.success-card strong {
  color: #2d241d;
  font-size: 15px;
  font-weight: 700;
}

.notice-card p,
.success-card p {
  margin: 10px 0 0;
  color: #7a6a5d;
  font-size: 13px;
  line-height: 1.6;
}

.action-bar {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.primary-button,
.secondary-button {
  width: 100%;
  min-height: 48px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 700;
}

.primary-button {
  border: 0;
  background: linear-gradient(135deg, #c97b2a 0%, #ea580c 100%);
  color: #fff;
  box-shadow: 0 12px 24px rgba(201, 123, 42, 0.24);
}

.primary-button:disabled {
  opacity: 0.6;
  box-shadow: none;
}

.secondary-button {
  border: 1px solid #e9ddd0;
  background: #fff;
  color: #7a5a42;
}

.success-card {
  display: grid;
  justify-items: center;
  gap: 12px;
  padding: 36px 20px 24px;
  text-align: center;
}

.success-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.12);
  color: #16a34a;
}

.success-actions {
  display: grid;
  gap: 10px;
  width: 100%;
  margin-top: 12px;
}
</style>
