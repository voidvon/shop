<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { showFailToast, showSuccessToast } from 'vant'

import { currentBackendLabel } from '@/shared/config/backend'
import { formatCurrency } from '@/shared/lib/currency'
import SectionCard from '@/shared/ui/SectionCard.vue'

import { useCheckoutFlowStore } from '../model/useCheckoutFlowStore'

const checkoutStore = useCheckoutFlowStore()
const {
  confirmation,
  errorMessage,
  hasLoaded,
  isCheckoutEnabled,
  isLoading,
  isSubmitting,
  preview,
  sourceLabel,
  submissionMessage,
} = storeToRefs(checkoutStore)

const previewLines = computed(() => preview.value?.lines ?? [])

async function handleSubmit() {
  try {
    const result = await checkoutStore.submitCurrentOrder()

    if (result) {
      showSuccessToast(`订单已提交：${result.orderId}`)
    }
  } catch {
    showFailToast(errorMessage.value ?? '提交订单失败')
  }
}

onMounted(() => {
  if (isCheckoutEnabled.value && !hasLoaded.value) {
    void checkoutStore.loadPreview()
  }
})
</script>

<template>
  <SectionCard
    title="Checkout Process"
    :description="`作为 process 示例，这段流程由 ${currentBackendLabel} 的 order adapter 提供结算能力。`"
  >
    <p v-if="!isCheckoutEnabled" class="state">
      当前租户未启用 checkout 模块，因此不会装配结算流程。
    </p>

    <template v-else>
      <div class="topline">
        <span class="source">{{ sourceLabel }}</span>
        <span class="hint">支持从购物车或立即购买进入</span>
      </div>

      <p v-if="isLoading" class="state">正在生成结算预览...</p>
      <p v-else-if="errorMessage" class="state error">{{ errorMessage }}</p>

      <template v-else-if="preview">
        <ul class="preview-list">
          <li v-for="line in previewLines" :key="line.productId">
            <div>
              <strong>{{ line.productName }}</strong>
              <span>{{ line.quantity }} 件 × {{ formatCurrency(line.unitPrice) }}</span>
            </div>
            <em>{{ formatCurrency(line.lineTotal) }}</em>
          </li>
        </ul>

        <div class="amounts">
          <div>
            <span>商品小计</span>
            <strong>{{ formatCurrency(preview.subtotalAmount) }}</strong>
          </div>
          <div>
            <span>优惠减免</span>
            <strong>{{ formatCurrency(preview.discountAmount) }}</strong>
          </div>
          <div>
            <span>应付金额</span>
            <strong>{{ formatCurrency(preview.payableAmount) }}</strong>
          </div>
        </div>

        <p v-if="submissionMessage" class="state success">{{ submissionMessage }}</p>
        <p v-if="confirmation" class="state">
          提交时间：{{ confirmation.submittedAt }}
        </p>

        <van-button round type="primary" :loading="isSubmitting" @click="handleSubmit">
          提交订单
        </van-button>
      </template>
    </template>
  </SectionCard>
</template>

<style scoped>
.topline {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.source {
  font-weight: 700;
  color: var(--color-primary-deep);
}

.hint {
  color: var(--color-text-soft);
  font-size: 0.84rem;
}

.preview-list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.preview-list li {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.6);
}

.preview-list strong,
.preview-list span,
.preview-list em {
  display: block;
}

.preview-list span {
  margin-top: 4px;
  color: var(--color-text-soft);
  font-size: 0.84rem;
}

.preview-list em {
  align-self: center;
  font-style: normal;
  font-weight: 700;
}

.amounts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.amounts div {
  padding: 14px 16px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.76);
}

.amounts span,
.amounts strong {
  display: block;
}

.amounts span {
  color: var(--color-text-soft);
  font-size: 0.82rem;
}

.amounts strong {
  margin-top: 4px;
}

.state {
  margin: 0;
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.72);
  color: var(--color-text-soft);
}

.success {
  color: var(--color-success);
}

.error {
  color: var(--color-primary-deep);
}

@media (max-width: 640px) {
  .topline,
  .preview-list li {
    flex-direction: column;
  }

  .amounts {
    grid-template-columns: 1fr;
  }
}
</style>
