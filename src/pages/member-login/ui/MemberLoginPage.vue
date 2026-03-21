<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showSuccessToast, showToast } from 'vant'

import PageTopBar from '@/shared/ui/PageTopBar.vue'

const route = useRoute()
const router = useRouter()

const form = reactive({
  account: '',
  password: '',
  rememberLogin: true,
})

const redirectPath = computed(() => {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/member'
})

const registerRoute = computed(() => ({
  name: 'member-register',
  query: { redirect: redirectPath.value },
}))

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

function openForgotPassword() {
  showToast('找回密码流程待接入')
}

function useWechatLogin() {
  showToast('微信登录能力待接入')
}

async function submitLogin() {
  form.account = form.account.trim()
  form.password = form.password.trim()

  if (!form.account || !form.password) {
    showToast('请输入账户和密码')
    return
  }

  showSuccessToast('登录成功')
  await router.replace(redirectPath.value)
}
</script>

<template>
  <section class="auth-page">
    <PageTopBar title="会员登录" right-icon="wap-home-o" @back="goBack" @right="goHome" />

    <div class="auth-scroll">
      <section class="hero-card">
        <p class="eyebrow">MEMBER ACCESS</p>
        <h1>欢迎回来</h1>
        <p class="hero-text">登录后可查看订单、卡券、收藏与会员资产，继续当前商城浏览流程。</p>
      </section>

      <section class="form-card">
        <van-form @submit="submitLogin">
          <van-cell-group inset class="field-group">
            <van-field
              v-model="form.account"
              autocomplete="username"
              clearable
              label="账户"
              name="account"
              placeholder="用户名 / 邮箱 / 已验证手机"
            />
            <van-field
              v-model="form.password"
              autocomplete="current-password"
              clearable
              label="密码"
              name="password"
              placeholder="登录密码"
              type="password"
            />
          </van-cell-group>

          <div class="meta-row">
            <van-checkbox v-model="form.rememberLogin" checked-color="var(--color-primary)">
              七天自动登录
            </van-checkbox>
            <van-button class="minor-action" plain round size="small" type="default" @click="openForgotPassword">
              忘记密码
            </van-button>
          </div>

          <van-button block class="submit-button" native-type="submit" round type="primary">
            登录
          </van-button>
        </van-form>

        <van-divider class="section-divider">其他方式</van-divider>

        <van-button block class="wechat-button" icon="wechat" plain round type="success" @click="useWechatLogin">
          微信合作账号登录
        </van-button>

        <div class="switch-row">
          <span>还没有账号？</span>
          <RouterLink class="switch-link" :to="registerRoute">
            立即注册
          </RouterLink>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.auth-page {
  display: grid;
  grid-template-rows: 49px minmax(0, 1fr);
  height: 100vh;
  height: 100dvh;
  background:
    radial-gradient(circle at top left, rgba(184, 92, 56, 0.16), transparent 34%),
    linear-gradient(180deg, #fcf7f0 0%, #f6ede0 100%);
  overflow: hidden;
}

.auth-scroll {
  min-height: 0;
  padding: 18px 16px 32px;
  overflow-y: auto;
}

.hero-card {
  padding: 28px 22px 24px;
  border-radius: 28px;
  background:
    linear-gradient(135deg, rgba(184, 92, 56, 0.92), rgba(143, 61, 36, 0.9)),
    #b85c38;
  color: #fffaf5;
  box-shadow: var(--shadow-md);
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 11px;
  letter-spacing: 0.18em;
  opacity: 0.76;
}

.hero-card h1 {
  margin: 0;
  font-size: 28px;
  line-height: 1.15;
}

.hero-text {
  margin: 12px 0 0;
  color: rgba(255, 250, 245, 0.86);
  font-size: 14px;
  line-height: 1.6;
}

.form-card {
  margin-top: 18px;
  padding: 18px 14px 20px;
  border: 1px solid rgba(143, 61, 36, 0.08);
  border-radius: 24px;
  background: rgba(255, 250, 242, 0.9);
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(12px);
}

.field-group {
  overflow: hidden;
  border-radius: 18px;
}

:deep(.field-group .van-cell) {
  padding-top: 14px;
  padding-bottom: 14px;
  background: rgba(255, 255, 255, 0.82);
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 4px 18px;
  color: var(--color-text-soft);
  font-size: 13px;
}

.minor-action {
  min-width: 92px;
  border-color: rgba(184, 92, 56, 0.18);
  color: var(--color-primary);
}

.submit-button {
  height: 46px;
  font-weight: 600;
}

.section-divider {
  margin: 18px 0 14px;
  color: var(--color-text-soft);
}

.wechat-button {
  height: 44px;
  border-color: rgba(47, 107, 95, 0.18);
  background: rgba(47, 107, 95, 0.08);
}

.switch-row {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 18px;
  color: var(--color-text-soft);
  font-size: 13px;
}

.switch-link {
  color: var(--color-primary);
  font-weight: 600;
}
</style>
