<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  showFailToast,
  showLoadingToast,
  showSuccessToast,
  showToast,
  type ToastWrapperInstance,
} from 'vant'

import {
  hydrateBackendAMemberAuthSession,
  useMemberAuthSession,
} from '@/entities/member-auth'
import {
  type MerchantDeductionScanResult,
  type MerchantDeductionUploadedImage,
  useMerchantDeductionService,
} from '@/processes/merchant-deduction'
import { ensureWechatJsApiReady, scanWechatQRCode } from '@/shared/lib/wechat-js-sdk'
import { isWechatBrowser } from '@/shared/lib/wechat-browser'
import EmptyState from '@/shared/ui/EmptyState.vue'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

const router = useRouter()
const memberAuthSession = useMemberAuthSession()
const merchantDeductionService = useMerchantDeductionService()
const authSnapshot = ref(memberAuthSession.getSnapshot())
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')
const amountInput = ref('')
const remarkInput = ref('')
const uploadedImages = ref<MerchantDeductionUploadedImage[]>([])
const scanResult = ref<MerchantDeductionScanResult | null>(null)
const submitPopupVisible = ref(false)
const lastResolvedDisplayName = ref('')
const isUploading = ref(false)
const isScanning = ref(false)
const isSubmitting = ref(false)
const feedbackToastVisibleMs = 3000
let activeLoadingToast: ToastWrapperInstance | null = null

const stopAuthSubscription = memberAuthSession.subscribe((snapshot) => {
  authSnapshot.value = snapshot
})

onUnmounted(() => {
  closeActiveLoadingToast()
  stopAuthSubscription()
})

const normalizedMerchantId = computed(() => authSnapshot.value.authResult?.userInfo.merchantId?.trim() ?? '')
const merchantDisplayName = computed(() =>
  authSnapshot.value.authResult?.userInfo.merchantName?.trim() || '未返回商户名称',
)
const supportedBalanceTypes = computed(() =>
  authSnapshot.value.authResult?.userInfo.merchantSupportedBalanceTypes ?? [],
)
const selectedBalanceType = computed(() =>
  supportedBalanceTypes.value[0] ?? null,
)
const currentDisplayName = computed(() => {
  const userInfo = authSnapshot.value.authResult?.userInfo
  const nextDisplayName = userInfo?.nickname?.trim() || userInfo?.username?.trim() || ''

  if (nextDisplayName) {
    return nextDisplayName
  }

  if (lastResolvedDisplayName.value) {
    return lastResolvedDisplayName.value
  }

  if (!userInfo) {
    return '当前账号'
  }

  return '当前账号'
})
const parsedAmount = computed(() => {
  if (!amountInput.value) {
    return null
  }

  const parsedValue = Number.parseFloat(amountInput.value)
  return Number.isFinite(parsedValue) ? parsedValue : null
})
const amountErrorMessage = computed(() => {
  if (!amountInput.value) {
    return '请输入扣款金额'
  }

  if (parsedAmount.value === null || parsedAmount.value <= 0) {
    return '金额需大于 0'
  }

  return ''
})
const balanceTypeErrorMessage = computed(() => {
  if (!normalizedMerchantId.value) {
    return ''
  }

  if (!selectedBalanceType.value) {
    return '当前商户未返回可用的余额类型'
  }

  return ''
})
const canUploadImage = computed(() =>
  !isUploading.value && uploadedImages.value.length < 3,
)
const canScan = computed(() =>
  !amountErrorMessage.value
  && !balanceTypeErrorMessage.value
  && Boolean(normalizedMerchantId.value)
  && !isScanning.value,
)
const canSubmit = computed(() =>
  canScan.value && Boolean(scanResult.value) && !isUploading.value && !isSubmitting.value,
)
const uploadButtonLabel = computed(() => {
  if (isUploading.value) {
    return '上传中...'
  }

  return uploadedImages.value.length >= 3 ? '最多上传 3 张' : '上传备注图片'
})
const scanButtonLabel = computed(() => {
  if (isScanning.value) {
    return '识别中...'
  }

  return scanResult.value ? '重新扫码' : '扫描付款码'
})
const submitButtonLabel = computed(() => {
  if (isSubmitting.value) {
    return '扣款中...'
  }

  return '确认扣款'
})

onMounted(() => {
  void hydrateBackendAMemberAuthSession(memberAuthSession)
})

watch(
  () => authSnapshot.value.authResult?.userInfo,
  (userInfo) => {
    const nextDisplayName = userInfo?.nickname?.trim() || userInfo?.username?.trim() || ''

    if (nextDisplayName) {
      lastResolvedDisplayName.value = nextDisplayName
    }
  },
  { immediate: true },
)

function goBack() {
  closeActiveLoadingToast()

  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push('/member')
}

function normalizeAmountInput(rawValue: string) {
  const withoutInvalidCharacters = rawValue.replace(/[^\d.]/g, '')
  const [integerPart = '', ...fractionParts] = withoutInvalidCharacters.split('.')
  const normalizedIntegerPart = integerPart.replace(/^0+(?=\d)/, '') || (withoutInvalidCharacters.startsWith('.') ? '0' : integerPart)

  if (fractionParts.length === 0) {
    return normalizedIntegerPart
  }

  return `${normalizedIntegerPart}.${fractionParts.join('').slice(0, 2)}`
}

function handleAmountInput(value: string) {
  amountInput.value = normalizeAmountInput(value)
}

function createBlockingLoadingToast(message: string) {
  closeActiveLoadingToast()
  activeLoadingToast = showLoadingToast({
    duration: 0,
    forbidClick: true,
    message,
  })

  return activeLoadingToast
}

function closeActiveLoadingToast() {
  activeLoadingToast?.close()
  activeLoadingToast = null
}

function showPersistentFailToast(message: string) {
  showFailToast({
    duration: feedbackToastVisibleMs,
    message,
  })
}

function openImagePicker() {
  if (!canUploadImage.value) {
    return
  }

  fileInput.value?.click()
}

function removeUploadedImage(imagePath: string) {
  uploadedImages.value = uploadedImages.value.filter((image) => image.path !== imagePath)
}

function openSubmitPopup() {
  if (!scanResult.value) {
    return
  }

  submitPopupVisible.value = true
}

function clearFileInput() {
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function handleImageSelection(event: Event) {
  const target = event.target as HTMLInputElement | null
  const selectedFiles = Array.from(target?.files ?? [])

  if (selectedFiles.length === 0) {
    return
  }

  const imageFiles = selectedFiles.filter((file) => file.type.startsWith('image/'))

  if (imageFiles.length === 0) {
    clearFileInput()
    showToast('请选择图片文件')
    return
  }

  const remainingSlots = Math.max(0, 3 - uploadedImages.value.length)
  const filesToUpload = imageFiles.slice(0, remainingSlots)

  if (filesToUpload.length === 0) {
    clearFileInput()
    showToast('最多上传 3 张图片')
    return
  }

  isUploading.value = true

  try {
    for (const file of filesToUpload) {
      const uploadedImage = await merchantDeductionService.uploadImage(file)
      uploadedImages.value = [...uploadedImages.value, uploadedImage]
    }

    showSuccessToast(`已上传 ${filesToUpload.length} 张图片`)
  } catch (error) {
    showPersistentFailToast(error instanceof Error ? error.message : '图片上传失败')
  } finally {
    isUploading.value = false
    clearFileInput()
  }
}

async function handleScanCode() {
  if (!normalizedMerchantId.value) {
    showPersistentFailToast('当前账号未返回可用的商户 ID')
    return
  }

  if (amountErrorMessage.value) {
    showPersistentFailToast(amountErrorMessage.value)
    return
  }

  if (balanceTypeErrorMessage.value) {
    showPersistentFailToast(balanceTypeErrorMessage.value)
    return
  }

  if (!isWechatBrowser()) {
    showPersistentFailToast('请在微信内打开当前页面后扫码')
    return
  }

  createBlockingLoadingToast('准备扫码...')

  try {
    await ensureWechatJsApiReady()
    closeActiveLoadingToast()
    const rawCode = await scanWechatQRCode()
    isScanning.value = true
    createBlockingLoadingToast('识别中...')
    scanResult.value = await merchantDeductionService.scanCode(rawCode)
    submitPopupVisible.value = true
    showSuccessToast('付款码识别成功')
  } catch (error) {
    const message = error instanceof Error ? error.message : '付款码识别失败'

    if (message !== '已取消扫码') {
      closeActiveLoadingToast()
      showPersistentFailToast(message)
    }
  } finally {
    closeActiveLoadingToast()
    isScanning.value = false
  }
}

function resetDraft() {
  amountInput.value = ''
  remarkInput.value = ''
  uploadedImages.value = []
  scanResult.value = null
  submitPopupVisible.value = false
  clearFileInput()
}

async function handleSubmitDeduction() {
  if (!normalizedMerchantId.value) {
    showPersistentFailToast('当前账号未返回可用的商户 ID')
    return
  }

  if (amountErrorMessage.value) {
    showPersistentFailToast(amountErrorMessage.value)
    return
  }

  if (balanceTypeErrorMessage.value) {
    showPersistentFailToast(balanceTypeErrorMessage.value)
    return
  }

  if (!scanResult.value || !parsedAmount.value) {
    showPersistentFailToast('请先完成扫码识别')
    return
  }

  isSubmitting.value = true
  createBlockingLoadingToast('扣款中...')

  try {
    const result = await merchantDeductionService.submitDeduction({
      amount: parsedAmount.value,
      attachments: uploadedImages.value,
      balanceTypeId: selectedBalanceType.value?.id ?? '',
      cardQrContent: scanResult.value.cardQrContent,
      merchantId: normalizedMerchantId.value,
      paymentToken: scanResult.value.paymentToken,
      remark: remarkInput.value,
    })

    resetDraft()
    showSuccessToast({
      duration: feedbackToastVisibleMs,
      message: result.successMessage || '操作成功',
    })
  } catch (error) {
    closeActiveLoadingToast()
    showPersistentFailToast(error instanceof Error ? error.message : '扣款失败')
  } finally {
    closeActiveLoadingToast()
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="merchant-deduction-page">
    <PageTopBar title="商户员工扣款" @back="goBack" />

    <div class="content-scroll">
      <section class="hero-card">
        <div class="hero-meta-grid">
          <div class="identity-item">
            <span>商户名称</span>
            <strong>{{ merchantDisplayName }}</strong>
          </div>

          <div class="identity-item">
            <span>用户名称</span>
            <strong>{{ currentDisplayName }}</strong>
          </div>
        </div>
      </section>

      <EmptyState
        v-if="!normalizedMerchantId"
        boxed
        class="empty-state"
        description="当前登录资料里没有返回 merchantId，暂时无法发起商户扣款。"
        description-width="260px"
        icon="warning-o"
        title="缺少商户信息"
      />

      <EmptyState
        v-else-if="supportedBalanceTypes.length === 0"
        boxed
        class="empty-state"
        description="当前登录资料里没有返回 merchant.supported_balance_types，暂时无法发起商户扣款。"
        description-width="280px"
        icon="warning-o"
        title="缺少扣款余额类型"
      />

      <template v-else>
        <section class="section-card">
          <header class="section-head">
            <strong>扣款信息</strong>
          </header>

          <van-field
            :model-value="amountInput"
            class="deduction-field deduction-amount-field"
            :formatter="normalizeAmountInput"
            format-trigger="onChange"
            input-align="right"
            inputmode="decimal"
            label="金额"
            placeholder="0.00"
            type="number"
            @update:model-value="handleAmountInput"
          />
          <p v-if="amountErrorMessage" class="field-hint field-hint-error">{{ amountErrorMessage }}</p>
          <p v-if="balanceTypeErrorMessage" class="field-hint field-hint-error">{{ balanceTypeErrorMessage }}</p>

          <van-field
            v-model="remarkInput"
            autosize
            class="deduction-field deduction-remark-field"
            label="备注"
            maxlength="120"
            placeholder="可填写扣款说明或业务备注"
            rows="3"
            show-word-limit
            type="textarea"
          />

          <div class="upload-section">
            <div class="upload-head">
              <span>备注图片</span>
              <button class="upload-button" :disabled="!canUploadImage" type="button" @click="openImagePicker">
                {{ uploadButtonLabel }}
              </button>
            </div>

            <input
              ref="fileInput"
              accept="image/*"
              class="file-input"
              multiple
              type="file"
              @change="handleImageSelection"
            >

            <div v-if="uploadedImages.length > 0" class="image-grid">
              <article v-for="image in uploadedImages" :key="image.path" class="image-card">
                <img :src="image.previewUrl" :alt="image.name">
                <button type="button" class="image-remove" @click="removeUploadedImage(image.path)">
                  删除
                </button>
              </article>
            </div>
          </div>

          <button class="scan-button" :disabled="!canScan" type="button" @click="handleScanCode">
            <van-icon name="scan" size="36" />
            <span>{{ scanButtonLabel }}</span>
          </button>

          <section v-if="scanResult" class="scan-result-card">
            <div class="scan-result-head">
              <strong>已识别付款信息</strong>
              <span>{{ selectedBalanceType?.name || scanResult.balanceTypeName || '待确认扣款余额' }}</span>
            </div>

            <dl class="scan-result-grid">
              <div v-for="row in scanResult.summaryRows" :key="`${row.label}-${row.value}`">
                <dt>{{ row.label }}</dt>
                <dd>{{ row.value }}</dd>
              </div>
            </dl>

            <button class="scan-result-action" type="button" @click="openSubmitPopup">
              确认扣款
            </button>
          </section>
        </section>
      </template>
    </div>

    <van-popup
      :show="submitPopupVisible"
      class="submit-popup"
      position="bottom"
      round
      teleport="body"
      @update:show="submitPopupVisible = $event"
    >
      <section class="submit-sheet">
        <header class="submit-sheet-head">
          <strong>确认扣款</strong>
          <button class="submit-sheet-close" type="button" @click="submitPopupVisible = false">
            关闭
          </button>
        </header>

        <div class="submit-summary">
          <div>
            <span>金额</span>
            <strong>{{ parsedAmount === null ? '¥0.00' : `¥${parsedAmount.toFixed(2)}` }}</strong>
          </div>
          <div>
            <span>备注</span>
            <strong>{{ remarkInput.trim() || '无' }}</strong>
          </div>
        </div>

        <button class="submit-button" :disabled="!canSubmit" type="button" @click="handleSubmitDeduction">
          {{ submitButtonLabel }}
        </button>
      </section>
    </van-popup>
  </section>
</template>

<style scoped>
.merchant-deduction-page {
  display: grid;
  grid-template-rows: 49px minmax(0, 1fr);
  height: 100vh;
  height: 100dvh;
  background:
    radial-gradient(circle at top, rgba(231, 111, 81, 0.18), transparent 32%),
    linear-gradient(180deg, #fff9f4 0%, #f2ede7 100%);
  overflow: hidden;
}

.content-scroll {
  min-height: 0;
  padding: 12px 16px 24px;
  overflow-y: auto;
  scrollbar-width: none;
}

.content-scroll::-webkit-scrollbar {
  display: none;
}

.hero-card,
.section-card {
  display: grid;
  gap: 10px;
  padding: 18px;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 14px 32px rgba(27, 25, 22, 0.08);
}

.hero-card,
.section-card,
.empty-state {
  margin-bottom: 12px;
}

.hero-card strong,
.identity-item strong,
.section-head strong {
  color: #1f1d1a;
}

.section-head p {
  margin: 0;
  color: #78716c;
  font-size: 13px;
  line-height: 1.6;
}

.hero-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.identity-item {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
}

.identity-item span,
.field-block span,
.upload-head span,
.submit-summary span,
.scan-result-grid dt {
  color: #8c847d;
  font-size: 12px;
}

.identity-item strong {
  flex: 1;
  font-size: 15px;
  line-height: 1.4;
  word-break: break-all;
}

.section-head {
  display: block;
}

.field-block {
  display: grid;
  gap: 10px;
}

.deduction-field {
  overflow: hidden;
  border: 1px solid #efe7de;
  border-radius: 18px;
  background: #fffaf5;
  --van-cell-background: #fffaf5;
  --van-field-label-color: #8c847d;
  --van-field-placeholder-text-color: #b8aea5;
  --van-field-word-limit-color: #9c8f84;
}

.deduction-field :deep(.van-cell) {
  padding: 14px 16px;
}

.deduction-field :deep(.van-field__label) {
  width: 84px;
  color: #8c847d;
  font-size: 12px;
}

.deduction-field :deep(.van-field__value) {
  color: #1f1d1a;
}

.deduction-field :deep(.van-field__control) {
  color: #1f1d1a;
  font-size: 14px;
  line-height: 1.6;
}

.deduction-amount-field :deep(.van-field__control) {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.deduction-remark-field :deep(.van-field__control) {
  min-height: 68px;
}

.deduction-remark-field :deep(.van-field__word-limit) {
  margin-top: 6px;
  font-size: 11px;
}

.field-hint {
  margin: -2px 0 0;
  font-size: 12px;
}

.field-hint-error {
  color: #d14343;
}

.upload-section {
  display: grid;
  gap: 12px;
}

.upload-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.upload-button,
.submit-button,
.scan-button,
.image-remove {
  border: 0;
  border-radius: 16px;
  font-weight: 600;
}

.upload-button,
.image-remove {
  padding: 9px 14px;
  background: #f5ede6;
  color: #7a5c49;
  font-size: 13px;
}

.upload-button:disabled,
.submit-button:disabled,
.scan-button:disabled {
  opacity: 0.52;
}

.file-input {
  display: none;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.image-card {
  display: grid;
  gap: 8px;
}

.image-card img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 16px;
  object-fit: cover;
  background: #f6f0ea;
}

.scan-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 16px 18px;
  background: linear-gradient(180deg, #fff0e6 0%, #ffd9c2 100%);
  color: #cf5f1f;
  font-size: 16px;
}

.scan-result-card {
  display: grid;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid #f1e6dc;
  border-radius: 18px;
  background: #fffaf6;
}

.scan-result-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.scan-result-head span {
  color: #b5653b;
  font-size: 12px;
}

.scan-result-grid {
  display: grid;
  gap: 10px;
}

.scan-result-grid div,
.submit-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.scan-result-grid dd,
.submit-summary strong {
  margin: 4px 0 0;
  color: #1f1d1a;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-all;
}

.scan-result-action,
.submit-sheet-close {
  justify-self: start;
  padding: 9px 14px;
  border: 0;
  border-radius: 14px;
  background: #f5ede6;
  color: #7a5c49;
  font-size: 13px;
  font-weight: 600;
}

.submit-popup {
  overflow: hidden;
}

.submit-sheet {
  display: grid;
  gap: 16px;
  padding: 20px 16px calc(20px + env(safe-area-inset-bottom));
  background:
    radial-gradient(circle at top, rgba(231, 111, 81, 0.12), transparent 40%),
    linear-gradient(180deg, #fffaf6 0%, #fff 100%);
}

.submit-sheet-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}

.submit-sheet-head strong {
  color: #1f1d1a;
  font-size: 18px;
}

.submit-button {
  width: 100%;
  padding: 15px 18px;
  background: linear-gradient(180deg, #d4642f 0%, #b94d1d 100%);
  color: #fff;
  font-size: 16px;
}

@media (max-width: 520px) {
  .identity-card,
  .hero-meta-grid,
  .scan-result-grid div,
  .submit-summary {
    grid-template-columns: 1fr;
  }
}
</style>
