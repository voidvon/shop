<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { type RouteLocationRaw } from 'vue-router'
import {
  showDialog,
  showSuccessToast,
  showToast,
  type FieldRule,
  type FieldValidateError,
  type FormInstance,
} from 'vant'

import { useMemberAuthRepository, useMemberAuthSession } from '@/entities/member-auth'
import { useModuleAvailability } from '@/shared/lib/modules'

import { registerMemberByMobile } from '../application/register-member-by-mobile'
import { requestMemberRegisterSmsCode } from '../application/request-member-register-sms-code'
import {
  hasAcceptedAgreement,
  isMatchedCaptcha,
  isMemberMobile,
  normalizeCaptchaText,
  normalizeMemberAuthText,
  normalizeMemberMobileRegisterDraft,
  type MemberMobileRegisterDraft,
  type MemberRegisterMode,
} from '../domain/member-auth'

const props = defineProps<{
  activeMode: MemberRegisterMode
  loginRoute: RouteLocationRaw
}>()

const emit = defineEmits<{
  (e: 'mode-change', value: MemberRegisterMode): void
  (e: 'submitted'): void
}>()

const memberAuthRepository = useMemberAuthRepository()
const memberAuthSession = useMemberAuthSession()

const captchaSeeds = ['A7K3', 'C8N5', 'F2Q9', 'M4P6']
const defaultCaptcha = captchaSeeds[0] ?? 'A7K3'

type FormFailedInfo = {
  errors: FieldValidateError[]
  values: Record<string, unknown>
}

const form = reactive<MemberMobileRegisterDraft>({
  agreement: true,
  captcha: '',
  mobile: '',
  smsCode: '',
})

const formRef = ref<FormInstance>()
const captchaValue = ref<string>(defaultCaptcha)
const countdown = ref(0)
const isMobileRegisterEnabled = useModuleAvailability('member-mobile-register')
const agreementFieldValue = computed(() => (form.agreement ? 'agreed' : ''))

let timer: ReturnType<typeof setInterval> | undefined

const mobileRules: FieldRule[] = [
  {
    validator: (value) => normalizeMemberAuthText(value).length > 0 || '请输入手机号',
  },
  {
    validator: (value) => isMemberMobile(normalizeMemberAuthText(value)) || '请输入正确手机号',
  },
]
const captchaRules: FieldRule[] = [
  {
    validator: (value) => normalizeMemberAuthText(value).length > 0 || '请输入图形验证码',
  },
  {
    validator: (value) => isMatchedCaptcha(normalizeCaptchaText(value), captchaValue.value) || '图形验证码错误',
  },
]
const smsCodeRules: FieldRule[] = [
  {
    validator: (value) => normalizeMemberAuthText(value).length > 0 || '请输入短信验证码',
  },
]
const agreementRules: FieldRule[] = [
  {
    validator: () => hasAcceptedAgreement(form.agreement) || '请先勾选用户注册协议',
  },
]

function refreshCaptcha() {
  const nextIndex = (captchaSeeds.indexOf(captchaValue.value) + 1) % captchaSeeds.length
  captchaValue.value = captchaSeeds[nextIndex] ?? defaultCaptcha
}

function handleModeChange(value: string | number) {
  if (value === 'default') {
    emit('mode-change', 'default')
  }
}

function clearTimer() {
  if (!timer) {
    return
  }

  clearInterval(timer)
  timer = undefined
}

function syncMobileFormValues() {
  const normalized = normalizeMemberMobileRegisterDraft(form)
  form.mobile = normalized.mobile
  form.captcha = normalized.captcha
}

function syncSubmitValues() {
  const normalized = normalizeMemberMobileRegisterDraft(form)
  form.mobile = normalized.mobile
  form.captcha = normalized.captcha
  form.smsCode = normalized.smsCode
}

function shouldRefreshCaptcha(error?: FieldValidateError) {
  return error?.name === 'captcha' && normalizeMemberAuthText(form.captcha).length > 0
}

function handleValidationErrors(errors: FieldValidateError[]) {
  const firstError = errors[0]

  if (!firstError) {
    return
  }

  if (shouldRefreshCaptcha(firstError)) {
    refreshCaptcha()
  }

  showToast(firstError.message)
}

function handleSubmitFailed({ errors }: FormFailedInfo) {
  handleValidationErrors(errors)
}

async function handleRequestSmsCode() {
  if (countdown.value > 0) {
    return
  }

  syncMobileFormValues()

  try {
    await formRef.value?.validate(['mobile', 'captcha'])
  } catch (error) {
    handleValidationErrors(Array.isArray(error) ? error : [error as FieldValidateError])
    return
  }

  const result = await requestMemberRegisterSmsCode({
    captcha: form.captcha,
    mobile: form.mobile,
  }, {
    repository: memberAuthRepository,
  })

  countdown.value = result.countdownSeconds
  clearTimer()
  timer = setInterval(() => {
    if (countdown.value <= 1) {
      countdown.value = 0
      clearTimer()
      return
    }

    countdown.value -= 1
  }, 1000)

  showSuccessToast(result.successMessage)
}

async function handleSubmit() {
  syncSubmitValues()

  try {
    const result = await registerMemberByMobile(form, {
      repository: memberAuthRepository,
      session: memberAuthSession,
    })

    await showDialog({
      title: result.dialogTitle,
      message: result.dialogMessage,
      theme: 'round-button',
    })

    emit('submitted')
  } catch (error) {
    showToast(error instanceof Error ? error.message : '注册失败')
  }
}

onBeforeUnmount(() => {
  clearTimer()
})
</script>

<template>
  <div class="member-mobile-register-panel">
    <van-tabs
      :active="props.activeMode"
      animated
      class="mode-tabs"
      color="var(--color-accent)"
      line-width="24"
      @change="handleModeChange"
    >
      <van-tab name="default" title="普通注册" />
      <van-tab v-if="isMobileRegisterEnabled" name="mobile" title="手机注册" />
    </van-tabs>

    <section class="form-card">
      <h1>手机号快速注册</h1>
      <p class="subtitle">完成短信验证后即可生成账号，后续再补充密码和个人资料。</p>

      <van-form
        ref="formRef"
        scroll-to-error
        validate-first
        validate-trigger="onSubmit"
        @failed="handleSubmitFailed"
        @submit="handleSubmit"
      >
        <van-cell-group inset class="field-group">
          <van-field
            v-model="form.mobile"
            autocomplete="tel"
            clearable
            label="手机号"
            name="mobile"
            placeholder="请输入手机号"
            type="tel"
            :rules="mobileRules"
          />
          <van-field
            v-model="form.captcha"
            clearable
            label="图形码"
            name="captcha"
            placeholder="请输入图形验证码"
            :rules="captchaRules"
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
            :rules="smsCodeRules"
          >
            <template #button>
              <van-button
                class="sms-button"
                plain
                round
                size="small"
                type="primary"
                :disabled="countdown > 0"
                @click="handleRequestSmsCode"
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
          <van-field
            :border="false"
            :label-width="0"
            :model-value="agreementFieldValue"
            class="agreement-field"
            input-align="left"
            name="agreement"
            :rules="agreementRules"
          >
            <template #input>
              <van-checkbox v-model="form.agreement" checked-color="var(--color-primary)">
                已阅读并同意用户注册协议
              </van-checkbox>
            </template>
          </van-field>
        </div>

        <van-button block class="submit-button" native-type="submit" round type="primary">
          注册
        </van-button>
      </van-form>

      <div class="switch-row">
        <span>已有账号？</span>
        <RouterLink class="switch-link" :to="props.loginRoute">
          去登录
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.member-mobile-register-panel {
  display: grid;
  gap: 18px;
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

.agreement-field {
  padding: 0;
  background: transparent;
}

:deep(.agreement-field .van-field__body) {
  display: block;
}

:deep(.agreement-field .van-field__control-container) {
  display: block;
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
