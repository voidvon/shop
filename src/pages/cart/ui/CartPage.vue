<script setup lang="ts">
import { mockTradeData } from '@/shared/mocks'

const cartPageData = mockTradeData.cartPageData
const cartGroups = cartPageData.groups

function formatAmount(value: number) {
  return value.toFixed(2)
}
</script>

<template>
  <section class="cart-page">
    <div class="cart-app">
      <header class="top-bar">
        <h1>购物车</h1>
      </header>

      <div class="cart-scroll">
        <section v-for="group in cartGroups" :key="group.storeId" class="merchant-section">
          <header class="store-row">
            <div class="store-left">
              <span class="select-icon">
                <van-icon name="success" size="14" />
              </span>
              <van-icon name="shop-o" size="16" class="store-icon" />
              <span class="store-name">{{ group.storeName }}</span>
            </div>
          </header>

          <div class="rows-wrap">
            <article v-for="item in group.items" :key="item.lineId" class="cart-item-row">
              <span class="select-icon item-check">
                <van-icon name="success" size="14" />
              </span>

              <img class="thumb" :src="item.productImageUrl" :alt="item.productName">

              <div class="right-col">
                <div class="name-row">
                  <strong>{{ item.productName }}</strong>
                  <button class="trash-button" type="button" aria-label="删除商品">
                    <van-icon name="delete-o" size="16" />
                  </button>
                </div>

                <div class="bottom-row">
                  <div class="price-wrap">
                    <span class="price-symbol">¥</span>
                    <span class="price-value">{{ formatAmount(item.unitPrice) }}</span>
                  </div>

                  <div class="stepper" aria-label="商品数量">
                    <button class="stepper-cell stepper-cell-muted" type="button" aria-label="减少数量">
                      <van-icon name="minus" size="12" />
                    </button>
                    <span class="stepper-cell count-cell">{{ item.quantity }}</span>
                    <button class="stepper-cell" type="button" aria-label="增加数量">
                      <van-icon name="plus" size="12" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>

      <footer class="summary-bar">
        <div class="summary-left">
          <span class="select-icon">
            <van-icon name="success" size="14" />
          </span>
          <div class="total-wrap">
            <span class="total-symbol">¥</span>
            <span class="total-value">{{ cartPageData.totalAmount.toFixed(1) }}</span>
          </div>
        </div>

        <button class="submit-button" type="button">提交订单</button>
      </footer>
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

.top-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 16px;
  border-bottom: 1px solid #f1eeea;
  background: #fff;
}

.top-bar h1 {
  margin: 0;
  color: #1a1918;
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
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

.select-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ff8a1f;
  color: #fff;
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
  grid-template-columns: 20px 74px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
  padding: 12px 16px;
  border-bottom: 1px solid #f1eeea;
}

.item-check {
  margin-top: 27px;
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

.trash-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #d4d0ca;
}

.bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.price-wrap,
.total-wrap {
  display: flex;
  gap: 4px;
  align-items: center;
}

.price-symbol,
.price-value,
.total-symbol,
.total-value {
  color: #ff8a1f;
  font-weight: 700;
}

.price-symbol {
  font-size: 15px;
}

.price-value {
  font-size: 16px;
}

.stepper {
  display: grid;
  grid-template-columns: repeat(3, 32px);
  height: 32px;
  border: 1px solid #e6e1da;
  border-radius: 4px;
  overflow: hidden;
}

.stepper-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-left: 1px solid #eee9e3;
  background: #fff;
  color: #8a8884;
}

.stepper-cell:first-child {
  border-left: 0;
}

.stepper-cell-muted {
  background: #fbfaf8;
  color: #9c9b99;
}

.count-cell {
  font-size: 14px;
  font-weight: 500;
}

.summary-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
  border-top: 1px solid #ede9e3;
  background: #fff;
}

.summary-left {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 0 16px;
}

.total-symbol {
  font-size: 16px;
}

.total-value {
  font-size: 18px;
}

.submit-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 108px;
  align-self: stretch;
  border: 0;
  background: #ff7a1a;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
}
</style>
