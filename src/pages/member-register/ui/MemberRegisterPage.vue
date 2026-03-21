<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showDialog, showToast } from 'vant'

import PageTopBar from '@/shared/ui/PageTopBar.vue'

const route = useRoute()
const router = useRouter()

const form = reactive({
  agreement: true,
  confirmPassword: '',
  email: '',
  password: '',
  username: '',
})

const redirectPath = computed(() => {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/member'
})

const loginRoute = computed(() => ({
  name: 'member-login',
  query: { redirect: redirectPath.value },
}))

const mobileRegisterRoute = computed(() => ({
  name: 'member-register-mobile',
  query: { redirect: redirectPath.value },
}))

const activeMode = computed(() => 'default')

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push(loginRoute.value)
}

function goHome() {
  void router.push('/')
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function changeMode(name: string | number) {
  if (name === 'mobile') {
    void router.replace(mobileRegisterRoute.value)
  }
}

async function submitRegister() {
  form.username = form.username.trim()
  form.email = form.email.trim()
  form.password = form.password.trim()
  form.confirmPassword = form.confirmPassword.trim()

  if (!form.username || !form.password || !form.confirmPassword || !form.email) {
    showToast('请完整填写注册信息')
    return
  }

  if (!isValidEmail(form.email)) {
    showToast('请输入有效邮箱地址')
    return
  }

  if (form.password !== form.confirmPassword) {
    showToast('两次输入的密码不一致')
    return
  }

  if (!form.agreement) {
    showToast('请先勾选用户注册协议')
    return
  }

  await showDialog({
    title: '注册成功',
    message: '账号已创建，请继续登录。',
    theme: 'round-button',
  })
  await router.replace(loginRoute.value)
}
</script>

<template>
  <section class="auth-page">
    <PageTopBar title="会员注册" right-icon="wap-home-o" @back="goBack" @right="goHome" />

    <div class="auth-scroll">
      <van-tabs
        :active="activeMode"
        animated
        class="mode-tabs"
        color="var(--color-primary)"
        line-width="24"
        @change="changeMode"
      >
        <van-tab name="default" title="普通注册" />
        <van-tab name="mobile" title="手机注册" />
      </van-tabs>

      <section class="form-card">
        <h1>创建会员账号</h1>
        <p class="subtitle">填写基础信息后即可进入商城会员体系，后续可在个人中心补充更多资料。</p>

        <van-form @submit="submitRegister">
          <van-cell-group inset class="field-group">
            <van-field
              v-model="form.username"
              autocomplete="username"
              clearable
              label="用户名"
              name="username"
              placeholder="请输入用户名"
            />
            <van-field
              v-model="form.password"
              autocomplete="new-password"
              clearable
              label="密码"
              name="password"
              placeholder="设置密码"
              type="password"
            />
            <van-field
              v-model="form.confirmPassword"
              autocomplete="new-password"
              clearable
              label="确认"
              name="confirmPassword"
              placeholder="确认密码"
              type="password"
            />
            <van-field
              v-model="form.email"
              autocomplete="email"
              clearable
              label="邮箱"
              name="email"
              placeholder="请输入邮箱"
              type="email"
            />
          </van-cell-group>

          <div class="agreement-row">
            <van-checkbox v-model="form.agreement" checked-color="var(--color-primary)">
              已阅读并同意用户注册协议
            </van-checkbox>
          </div>

          <van-button block class="submit-button" native-type="submit" round type="primary">
            注册
          </van-button>
        </van-form>

        <div class="switch-row">
          <span>已有账号？</span>
          <RouterLink class="switch-link" :to="loginRoute">
            去登录
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
    radial-gradient(circle at top right, rgba(47, 107, 95, 0.14), transparent 30%),
    linear-gradient(180deg, #fcf7f0 0%, #f4ecdf 100%);
  overflow: hidden;
}

.auth-scroll {
  min-height: 0;
  padding: 18px 16px 32px;
  overflow-y: auto;
}

.mode-tabs {
  overflow: hidden;
  border-radius: 22px;
  background: rgba(255, 250, 242, 0.82);
  box-shadow: var(--shadow-md);
}

:deep(.mode-tabs .van-tabs__wrap) {
  border-radius: 22px 22px 0 0;
  background: transparent;
}

:deep(.mode-tabs .van-tab) {
  color: var(--color-text-soft);
  font-weight: 600;
}

:deep(.mode-tabs .van-tab--active) {
  color: var(--color-primary);
}

.form-card {
  margin-top: 18px;
  padding: 22px 14px 20px;
  border: 1px solid rgba(143, 61, 36, 0.08);
  border-radius: 24px;
  background: rgba(255, 250, 242, 0.9);
  box-shadow: var(--shadow-md);
}

.form-card h1 {
  margin: 0;
  color: var(--color-text);
  font-size: 27px;
  line-height: 1.15;
}

.subtitle {
  margin: 10px 0 18px;
  color: var(--color-text-soft);
  font-size: 14px;
  line-height: 1.6;
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

.agreement-row {
  padding: 16px 4px 18px;
  color: var(--color-text-soft);
  font-size: 13px;
}

.submit-button {
  height: 46px;
  font-weight: 600;
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
