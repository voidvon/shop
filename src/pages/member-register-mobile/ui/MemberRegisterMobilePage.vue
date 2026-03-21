<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showDialog, showSuccessToast, showToast } from 'vant'

import PageTopBar from '@/shared/ui/PageTopBar.vue'

const route = useRoute()
const router = useRouter()

const captchaSeeds = ['A7K3', 'C8N5', 'F2Q9', 'M4P6']
const defaultCaptcha = captchaSeeds[0] ?? 'A7K3'
const form = reactive({
  agreement: true,
  captcha: '',
  mobile: '',
  smsCode: '',
})

const captchaValue = ref<string>(defaultCaptcha)
const countdown = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

const redirectPath = computed(() => {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/member'
})

const loginRoute = computed(() => ({
  name: 'member-login',
  query: { redirect: redirectPath.value },
}))

const normalRegisterRoute = computed(() => ({
  name: 'member-register',
  query: { redirect: redirectPath.value },
}))

const activeMode = computed(() => 'mobile')

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push(normalRegisterRoute.value)
}

function goHome() {
  void router.push('/')
}

function refreshCaptcha() {
  const nextIndex = (captchaSeeds.indexOf(captchaValue.value) + 1) % captchaSeeds.length
  captchaValue.value = captchaSeeds[nextIndex] ?? defaultCaptcha
}

function changeMode(name: string | number) {
  if (name === 'default') {
    void router.replace(normalRegisterRoute.value)
  }
}

function isValidMobile(value: string) {
  return /^1\d{10}$/.test(value)
}

function clearTimer() {
  if (!timer) {
    return
  }

  clearInterval(timer)
  timer = undefined
}

function requestSmsCode() {
  form.mobile = form.mobile.trim()
  form.captcha = form.captcha.trim().toUpperCase()

  if (!isValidMobile(form.mobile)) {
    showToast('请输入正确手机号')
    return
  }

  if (form.captcha !== captchaValue.value) {
    showToast('图形验证码错误')
    refreshCaptcha()
    return
  }

  if (countdown.value > 0) {
    return
  }

  countdown.value = 60
  clearTimer()
  timer = setInterval(() => {
    if (countdown.value <= 1) {
      countdown.value = 0
      clearTimer()
      return
    }

    countdown.value -= 1
  }, 1000)

  showSuccessToast('验证码已发送')
}

async function submitRegister() {
  form.mobile = form.mobile.trim()
  form.captcha = form.captcha.trim().toUpperCase()
  form.smsCode = form.smsCode.trim()

  if (!isValidMobile(form.mobile) || !form.captcha || !form.smsCode) {
    showToast('请完整填写手机号、图形码和短信码')
    return
  }

  if (form.captcha !== captchaValue.value) {
    showToast('图形验证码错误')
    refreshCaptcha()
    return
  }

  if (!form.agreement) {
    showToast('请先勾选用户注册协议')
    return
  }

  await showDialog({
    title: '注册成功',
    message: '手机号已完成注册，请继续登录。',
    theme: 'round-button',
  })
  await router.replace(loginRoute.value)
}

onBeforeUnmount(() => {
  clearTimer()
})
</script>

<template>
  <section class="auth-page">
    <PageTopBar title="手机注册" right-icon="wap-home-o" @back="goBack" @right="goHome" />

    <div class="auth-scroll">
      <van-tabs
        :active="activeMode"
        animated
        class="mode-tabs"
        color="var(--color-accent)"
        line-width="24"
        @change="changeMode"
      >
        <van-tab name="default" title="普通注册" />
        <van-tab name="mobile" title="手机注册" />
      </van-tabs>

      <section class="form-card">
        <h1>手机号快速注册</h1>
        <p class="subtitle">完成短信验证后即可生成账号，后续再补充密码和个人资料。</p>

        <van-form @submit="submitRegister">
          <van-cell-group inset class="field-group">
            <van-field
              v-model="form.mobile"
              autocomplete="tel"
              clearable
              label="手机号"
              name="mobile"
              placeholder="请输入手机号"
              type="tel"
            />
            <van-field
              v-model="form.captcha"
              clearable
              label="图形码"
              name="captcha"
              placeholder="请输入图形验证码"
            >
              <template #button>
                <van-button class="captcha-box" plain round size="small" type="success" @click="refreshCaptcha">
                  {{ captchaValue }}
                </van-button>
              </template>
            </van-field>
            <van-field
              v-model="form.smsCode"
              clearable
              label="短信码"
              name="smsCode"
              placeholder="请输入短信验证码"
              type="digit"
            >
              <template #button>
                <van-button
                  class="sms-button"
                  plain
                  round
                  size="small"
                  type="primary"
                  :disabled="countdown > 0"
                  @click="requestSmsCode"
                >
                  {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
                </van-button>
              </template>
            </van-field>
          </van-cell-group>

          <van-cell-group inset class="tip-group">
            <van-cell icon="warning-o" title="一个手机只能绑定一个账号" />
            <van-cell icon="desktop-o" title="手机修改或解绑需在 PC 端处理" />
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
    radial-gradient(circle at top left, rgba(47, 107, 95, 0.14), transparent 30%),
    linear-gradient(180deg, #fbf8f2 0%, #f1e7d8 100%);
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
  color: var(--color-accent);
}

.form-card {
  margin-top: 18px;
  padding: 22px 14px 20px;
  border: 1px solid rgba(47, 107, 95, 0.1);
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

.captcha-box,
.sms-button {
  min-width: 88px;
  font-weight: 600;
}

.captcha-box {
  border-color: rgba(47, 107, 95, 0.18);
  letter-spacing: 0.22em;
}

.sms-button {
  border-color: rgba(184, 92, 56, 0.18);
}

.tip-group {
  margin-top: 14px;
  overflow: hidden;
  border-radius: 18px;
}

:deep(.tip-group .van-cell) {
  background: rgba(255, 255, 255, 0.82);
  color: var(--color-text-soft);
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
