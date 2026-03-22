<script setup lang="ts">
import { computed, reactive } from 'vue'
import { type RouteLocationRaw } from 'vue-router'
import { showDialog, showToast, type FieldRule, type FieldValidateError } from 'vant'

import { useMemberAuthRepository, useMemberAuthSession } from '@/entities/member-auth'
import { useModuleAvailability } from '@/shared/lib/modules'

import { registerMemberAccount } from '../application/register-member-account'
import {
  hasAcceptedAgreement,
  hasConfirmedPassword,
  isMemberEmail,
  normalizeMemberAuthText,
  type MemberRegisterDraft,
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

type FormFailedInfo = {
  errors: FieldValidateError[]
  values: Record<string, unknown>
}

const form = reactive<MemberRegisterDraft>({
  agreement: true,
  confirmPassword: '',
  email: '',
  password: '',
  username: '',
})

const isMobileRegisterEnabled = useModuleAvailability('member-mobile-register')
const agreementFieldValue = computed(() => (form.agreement ? 'agreed' : ''))

function buildRequiredRule(message: string): FieldRule {
  return {
    validator: (value) => normalizeMemberAuthText(value).length > 0 || message,
  }
}

const usernameRules: FieldRule[] = [buildRequiredRule('请输入用户名')]
const passwordRules: FieldRule[] = [buildRequiredRule('请设置密码')]
const confirmPasswordRules: FieldRule[] = [
  buildRequiredRule('请再次输入密码'),
  {
    validator: (value) => hasConfirmedPassword(form.password, normalizeMemberAuthText(value)) || '两次输入的密码不一致',
  },
]
const emailRules: FieldRule[] = [
  buildRequiredRule('请输入邮箱'),
  {
    validator: (value) => isMemberEmail(normalizeMemberAuthText(value)) || '请输入有效邮箱地址',
  },
]
const agreementRules: FieldRule[] = [
  {
    validator: () => hasAcceptedAgreement(form.agreement) || '请先勾选用户注册协议',
  },
]

function handleModeChange(value: string | number) {
  if (value === 'mobile') {
    emit('mode-change', 'mobile')
  }
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
    const result = await registerMemberAccount(form, {
      repository: memberAuthRepository,
      session: memberAuthSession,
    })
    form.username = normalizeMemberAuthText(form.username)
    form.password = normalizeMemberAuthText(form.password)
    form.confirmPassword = normalizeMemberAuthText(form.confirmPassword)
    form.email = normalizeMemberAuthText(form.email)

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
</script>

<template>
  <div class="member-register-panel">
    <van-tabs
      :active="props.activeMode"
      animated
      class="mode-tabs"
      color="var(--color-primary)"
      line-width="24"
      @change="handleModeChange"
    >
      <van-tab name="default" title="普通注册" />
      <van-tab v-if="isMobileRegisterEnabled" name="mobile" title="手机注册" />
    </van-tabs>

    <section class="form-card">
      <h1>创建会员账号</h1>
      <p class="subtitle">填写基础信息后即可进入商城会员体系，后续可在个人中心补充更多资料。</p>

      <van-form scroll-to-error validate-first validate-trigger="onSubmit" @failed="handleSubmitFailed" @submit="handleSubmit">
        <van-cell-group inset class="field-group">
          <van-field
            v-model="form.username"
            autocomplete="username"
            clearable
            label="用户名"
            name="username"
            placeholder="请输入用户名"
            :rules="usernameRules"
          />
          <van-field
            v-model="form.password"
            autocomplete="new-password"
            clearable
            label="密码"
            name="password"
            placeholder="设置密码"
            type="password"
            :rules="passwordRules"
          />
          <van-field
            v-model="form.confirmPassword"
            autocomplete="new-password"
            clearable
            label="确认"
            name="confirmPassword"
            placeholder="确认密码"
            type="password"
            :rules="confirmPasswordRules"
          />
          <van-field
            v-model="form.email"
            autocomplete="email"
            clearable
            label="邮箱"
            name="email"
            placeholder="请输入邮箱"
            type="email"
            :rules="emailRules"
          />
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
.member-register-panel {
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
  color: var(--color-primary);
}

.form-card {
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
