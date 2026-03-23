<script setup lang="ts">
import { computed, onActivated, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showFailToast, showSuccessToast } from 'vant'

import { useModuleAvailability } from '@/shared/lib/modules'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

import { useCartPageModel } from '../model/useCartPageModel'

const router = useRouter()
const isCheckoutEnabled = useModuleAvailability('checkout')
const {
  cartPageData,
  errorMessage,
  isAllSelected,
  isItemPending,
  isLoading,
  isLineSelected,
  isSelectionPending,
  isGroupSelected,
  loadCartPage,
  removeItem,
  selectedItemCount,
  selectedTotalAmount,
  setAllSelected,
  setGroupSelected,
  setItemQuantity,
  setLineSelected,
} = useCartPageModel()

const cartGroups = computed(() => cartPageData.value.groups)
const isCartEmpty = computed(() => cartGroups.value.length === 0)
const isCheckoutDisabled = computed(
  () => !isCheckoutEnabled.value || isCartEmpty.value || selectedItemCount.value === 0,
)
const submitBarPrice = computed(() => Math.round(selectedTotalAmount.value * 100))
const submitButtonText = computed(() => `结算(${selectedItemCount.value})`)

function formatAmount(value: number) {
  return value.toFixed(2)
}

function normalizeStepperValue(value: string | number) {
  const parsedValue = typeof value === 'number' ? value : Number.parseInt(value, 10)
  return Number.isFinite(parsedValue) && parsedValue > 0 ? Math.floor(parsedValue) : 1
}

async function handleAllCheckedChange(checked: boolean) {
  try {
    await setAllSelected(checked)
  } catch {
    showFailToast(errorMessage.value ?? '更新待结算商品失败')
  }
}

async function handleGroupCheckedChange(storeId: string, checked: boolean) {
  const group = cartGroups.value.find((entry) => entry.storeId === storeId)

  if (!group) {
    return
  }

  try {
    await setGroupSelected(group, checked)
  } catch {
    showFailToast(errorMessage.value ?? '更新待结算商品失败')
  }
}

async function handleLineCheckedChange(lineId: string, checked: boolean) {
  try {
    await setLineSelected(lineId, checked)
  } catch {
    showFailToast(errorMessage.value ?? '更新待结算商品失败')
  }
}

async function handleRemoveItem(lineId: string) {
  try {
    await removeItem(lineId)
    showSuccessToast('已从购物车移除')
  } catch {
    showFailToast(errorMessage.value ?? '删除购物车商品失败')
  }
}

async function handleQuantityChange(lineId: string, value: string | number) {
  try {
    await setItemQuantity(lineId, normalizeStepperValue(value))
  } catch {
    showFailToast(errorMessage.value ?? '更新购物车数量失败')
  }
}

function goToProductDetail(productId: string) {
  void router.push({
    name: 'product-detail',
    params: { productId },
  })
}

function handleCheckout() {
  if (isCheckoutDisabled.value) {
    return
  }

  void router.push('/checkout')
}

onMounted(() => {
  void loadCartPage()
})

onActivated(() => {
  void loadCartPage()
})
</script>

<template>
  <section class="cart-page">
    <div class="cart-app">
      <PageTopBar title="购物车" :show-back="false" />

      <div class="cart-scroll">
        <div v-if="isLoading" class="page-state">正在加载购物车...</div>
        <div v-else-if="errorMessage" class="page-state page-state-error">{{ errorMessage }}</div>
        <div v-else-if="isCartEmpty" class="page-state">购物车还是空的，先去挑点商品吧。</div>

        <template v-else>
          <section v-for="group in cartGroups" :key="group.storeId" class="merchant-section">
            <header class="store-row">
              <div class="store-left">
                <van-checkbox
                  :model-value="isGroupSelected(group)"
                  checked-color="#ff8a1f"
                  :disabled="isSelectionPending"
                  @update:model-value="handleGroupCheckedChange(group.storeId, $event)"
                />
                <van-icon name="shop-o" size="16" class="store-icon" />
                <span class="store-name">{{ group.storeName }}</span>
              </div>
            </header>

            <div class="rows-wrap">
              <van-swipe-cell v-for="item in group.items" :key="item.lineId" :disabled="isItemPending(item.lineId)">
                <article class="cart-item-row">
                  <van-checkbox
                    class="item-check"
                    :model-value="isLineSelected(item.lineId)"
                    checked-color="#ff8a1f"
                    :disabled="isSelectionPending"
                    @update:model-value="handleLineCheckedChange(item.lineId, $event)"
                  />

                  <button class="item-link" type="button" @click="goToProductDetail(item.productId)">
                    <img class="thumb" :src="item.productImageUrl || undefined" :alt="item.productName">

                    <div class="right-col">
                      <div class="name-row">
                        <strong>{{ item.productName }}</strong>
                      </div>

                      <div class="price-wrap">
                        <span class="price-symbol">¥</span>
                        <span class="price-value">{{ formatAmount(item.unitPrice) }}</span>
                      </div>
                    </div>
                  </button>

                  <van-stepper
                    class="item-stepper"
                    :model-value="item.quantity"
                    theme="round"
                    integer
                    min="1"
                    disable-input
                    button-size="26"
                    :disabled="isItemPending(item.lineId)"
                    @update:model-value="handleQuantityChange(item.lineId, $event)"
                  />
                </article>

                <template #right>
                  <button
                    class="swipe-delete-button"
                    type="button"
                    :disabled="isItemPending(item.lineId)"
                    @click="handleRemoveItem(item.lineId)"
                  >
                    删除
                  </button>
                </template>
              </van-swipe-cell>
            </div>
          </section>
        </template>
      </div>

      <van-submit-bar
        class="cart-submit-bar"
        :price="submitBarPrice"
        :button-text="submitButtonText"
        :disabled="isCheckoutDisabled"
        @submit="handleCheckout"
      >
        <van-checkbox
          :model-value="isAllSelected"
          checked-color="#ff8a1f"
          :disabled="isSelectionPending || isCartEmpty"
          @update:model-value="handleAllCheckedChange"
        >
          全选
        </van-checkbox>
      </van-submit-bar>
    </div>
  </section>
</template>

<style scoped>
.cart-page {
  height: calc(100vh - var(--app-bottom-nav-offset, 0px) - 12px);
  height: calc(100dvh - var(--app-bottom-nav-offset, 0px) - 12px);
  background: #fafaf8;
  overflow: hidden;
}

.cart-app {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  height: 100%;
  background: #fff;
  border-bottom: 1px solid #ede9e3;
}

.cart-scroll {
  min-height: 0;
  overflow-y: auto;
  background: #fff;
  scrollbar-width: none;
}

.cart-scroll::-webkit-scrollbar {
  display: none;
}

.page-state {
  padding: 48px 24px;
  color: #8a8884;
  text-align: center;
}

.page-state-error {
  color: #c95a21;
}

.merchant-section {
  background: #fff;
}

.store-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  padding: 0 16px;
}

.store-left {
  display: flex;
  gap: 8px;
  align-items: center;
}

.store-icon {
  color: #6d6c6a;
}

.store-name {
  color: #4b4a48;
  font-size: 15px;
  font-weight: 500;
}

.rows-wrap {
  display: grid;
}

.cart-item-row {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: start;
  padding: 12px 16px;
  border-bottom: 1px solid #f1eeea;
  background: #fff;
}

.item-check {
  margin-top: 27px;
}

.item-link {
  display: grid;
  grid-template-columns: 74px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
}

.thumb {
  width: 74px;
  height: 74px;
  border: 1px solid #e6ded3;
  border-radius: 8px;
  object-fit: cover;
  background: #f6f1ea;
}

.right-col {
  display: grid;
  gap: 10px;
  min-width: 0;
}

.name-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.name-row strong {
  flex: 1;
  color: #3c3b39;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.35;
}

.price-wrap {
  display: flex;
  gap: 4px;
  align-items: center;
}

.price-symbol,
.price-value {
  color: #ff8a1f;
  font-weight: 700;
}

.price-symbol {
  font-size: 15px;
}

.price-value {
  font-size: 16px;
}

.item-stepper {
  align-self: end;
}

.swipe-delete-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 100%;
  border: 0;
  background: #ee4d2d;
  color: #fff;
  font-size: 14px;
}

.swipe-delete-button:disabled {
  opacity: 0.6;
}

.cart-submit-bar {
  position: static;
  inset: auto;
  padding-bottom: 0;
}
</style>
