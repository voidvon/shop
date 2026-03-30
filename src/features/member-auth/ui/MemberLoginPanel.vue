<script setup lang="ts">
import { reactive } from 'vue'
import { type RouteLocationRaw } from 'vue-router'
import { showSuccessToast, showToast, type FieldRule, type FieldValidateError } from 'vant'

import { useMemberAuthRepository, useMemberAuthSession } from '@/entities/member-auth'
import {
  resolveBackendAWechatOauthUrl,
} from '@/shared/api/backend-a/backend-a-config'
import { backendTarget } from '@/shared/config/backend'

import { submitMemberLogin } from '../application/submit-member-login'
import {
  normalizeMemberAuthText,
  type MemberLoginDraft,
} from '../domain/member-auth'

const props = defineProps<{
  isWechatAuthorizing?: boolean
  registerRoute: RouteLocationRaw
}>()

const emit = defineEmits<{
  (e: 'submitted'): void
}>()

const memberAuthRepository = useMemberAuthRepository()
const memberAuthSession = useMemberAuthSession()

type FormFailedInfo = {
  errors: FieldValidateError[]
  values: Record<string, unknown>
}

const form = reactive<MemberLoginDraft>({
  account: '',
  password: '',
  rememberLogin: true,
})

function buildRequiredRule(message: string): FieldRule {
  return {
    validator: (value) => normalizeMemberAuthText(value).length > 0 || message,
  }
}

const accountRules: FieldRule[] = [buildRequiredRule('请输入账户')]
const passwordRules: FieldRule[] = [buildRequiredRule('请输入密码')]

function openForgotPassword() {
  showToast('找回密码流程待接入')
}

function useWechatLogin() {
  if (backendTarget !== 'backend-a') {
    showToast('微信登录能力待接入')
    return
  }

  const oauthUrl = resolveBackendAWechatOauthUrl()

  if (oauthUrl) {
    window.location.href = oauthUrl
    return
  }

  showToast('请从微信静默授权回调页进入当前登录页，或配置 VITE_BACKEND_A_WECHAT_OAUTH_URL')
}

function handleSubmitFailed({ errors }: FormFailedInfo) {
  const firstError = errors[0]

  if (!firstError) {
    return
  }

  showToast(firstError.message)
}

async function handleSubmit() {
  try {
    const result = await submitMemberLogin(form, {
      repository: memberAuthRepository,
      session: memberAuthSession,
    })
    form.account = normalizeMemberAuthText(form.account)
    form.password = normalizeMemberAuthText(form.password)
    showSuccessToast(result.successMessage)
    emit('submitted')
  } catch (error) {
    showToast(error instanceof Error ? error.message : '登录失败')
  }
}
</script>

<template>
  <div class="member-login-panel">
    <section class="hero-card">
      <p class="eyebrow">MEMBER ACCESS</p>
      <h1>欢迎回来</h1>
      <p class="hero-text">
        登录后可查看订单、卡券、收藏与会员资产；首次使用微信授权时，将按微信 openid
        自动注册并直接进入商城。
      </p>
    </section>

    <section class="form-card">
      <van-form scroll-to-error validate-first validate-trigger="onSubmit" @failed="handleSubmitFailed" @submit="handleSubmit">
        <van-cell-group inset class="field-group">
          <van-field
            v-model="form.account"
            autocomplete="username"
            clearable
            label="账户"
            name="account"
            placeholder="用户名 / 邮箱 / 已验证手机"
            :rules="accountRules"
          />
          <van-field
            v-model="form.password"
            autocomplete="current-password"
            clearable
            label="密码"
            name="password"
            placeholder="登录密码"
            type="password"
            :rules="passwordRules"
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

      <van-button
        block
        class="wechat-button"
        icon="wechat"
        plain
        round
        type="success"
        :disabled="props.isWechatAuthorizing"
        @click="useWechatLogin"
      >
        {{ props.isWechatAuthorizing ? '微信登录中...' : '微信授权登录 / 自动注册' }}
      </van-button>

      <div class="switch-row">
        <span>还没有账号？</span>
        <RouterLink class="switch-link" :to="props.registerRoute">
          立即注册
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.member-login-panel {
  display: grid;
  gap: 18px;
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
