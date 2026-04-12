<script setup lang="ts">
import { computed, onActivated, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showFailToast, showSuccessToast, showToast } from 'vant'

import { useCustomerServiceUnreadStore } from '@/processes/customer-service'
import PageTopBar from '@/shared/ui/PageTopBar.vue'
import EmptyState from '@/shared/ui/EmptyState.vue'

import { useCustomerServiceConversationListPageModel } from '../model/useCustomerServiceConversationListPageModel'

const route = useRoute()
const router = useRouter()
const composerVisible = ref(false)
const draftContent = ref('')
const draftSubject = ref('')
const hasConversationListLoaded = ref(false)

const {
  conversations,
  createConversation,
  errorMessage,
  hasConversations,
  isLoading,
  isSubmitting,
  loadConversationListPage,
} = useCustomerServiceConversationListPageModel()
const customerServiceUnreadStore = useCustomerServiceUnreadStore()
const unreadSummary = computed(() => customerServiceUnreadStore.unreadSummary)

const storeId = computed(() => (
  typeof route.query.storeId === 'string' ? route.query.storeId.trim() : ''
))
const storeName = computed(() => (
  typeof route.query.storeName === 'string' ? route.query.storeName.trim() : ''
))
const preferredSubject = computed(() => (
  typeof route.query.subject === 'string' ? route.query.subject.trim() : ''
))
const preferredContent = computed(() => (
  typeof route.query.content === 'string' ? route.query.content.trim() : ''
))
const shouldAutoOpenComposer = computed(() => (
  route.query.composer === 'create'
  || Boolean(storeName.value)
  || Boolean(preferredSubject.value)
  || Boolean(preferredContent.value)
))
const sourceSummary = computed(() => {
  if (!storeName.value) {
    return null
  }

  return {
    description: storeId.value ? `店铺 ID：${storeId.value}` : '将创建一条带店铺上下文的客服留言',
    label: '咨询来源',
    value: storeName.value,
  }
})
const unreadSummaryText = computed(() => {
  if (unreadSummary.value.messageCount > 0) {
    return `${unreadSummary.value.messageCount} 条未读消息`
  }

  if (unreadSummary.value.conversationCount > 0) {
    return `${unreadSummary.value.conversationCount} 个会话待处理`
  }

  return '当前没有未读消息'
})
const hasActiveConversations = computed(() => (
  conversations.value.some((conversation) => conversation.status !== 'closed')
))

function formatDateTime(value: string | null) {
  if (!value) {
    return '刚刚'
  }

  const parsedValue = new Date(value)

  if (Number.isNaN(parsedValue.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('zh-CN', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  }).format(parsedValue)
}

function syncComposerDraftFromRoute() {
  const nextSubject = preferredSubject.value
    || (storeName.value ? `店铺咨询 · ${storeName.value}` : '客服咨询')
  const nextContent = preferredContent.value
    || (storeName.value ? `您好，我想咨询店铺“${storeName.value}”相关问题。` : '')

  draftSubject.value = nextSubject
  draftContent.value = nextContent
}

function syncComposerVisibility() {
  if (!hasConversationListLoaded.value) {
    composerVisible.value = false
    return
  }

  if (hasActiveConversations.value) {
    composerVisible.value = false
    return
  }

  composerVisible.value = shouldAutoOpenComposer.value
}

function syncComposerFromRoute() {
  syncComposerDraftFromRoute()
  syncComposerVisibility()
}

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  if (storeId.value) {
    void router.push({
      name: 'store-detail',
      params: { storeId: storeId.value },
      query: storeName.value ? { name: storeName.value } : undefined,
    })
    return
  }

  void router.push('/member')
}

function openComposer() {
  composerVisible.value = true

  if (!draftSubject.value.trim()) {
    draftSubject.value = storeName.value ? `店铺咨询 · ${storeName.value}` : '客服咨询'
  }
}

async function submitConversation() {
  const subject = draftSubject.value.trim()
  const content = draftContent.value.trim()

  if (!content) {
    showToast('请输入留言内容')
    return
  }

  try {
    const conversationId = await createConversation({
      content,
      subject: subject || undefined,
    })

    showSuccessToast('留言已提交')
    composerVisible.value = false

    await router.replace({
      name: 'member-customer-service-conversation',
      params: {
        conversationId,
      },
    })
  } catch (error) {
    showFailToast(error instanceof Error ? error.message : '留言提交失败')
  }
}

function openConversation(conversationId: string) {
  void router.push({
    name: 'member-customer-service-conversation',
    params: {
      conversationId,
    },
  })
}

watch(
  () => [
    route.query.composer,
    route.query.content,
    route.query.storeId,
    route.query.storeName,
    route.query.subject,
    hasActiveConversations.value,
  ],
  () => {
    if (!hasConversationListLoaded.value) {
      composerVisible.value = false
      return
    }

    if (hasActiveConversations.value) {
      composerVisible.value = false
      return
    }

    if (!draftSubject.value.trim() && !draftContent.value.trim()) {
      syncComposerDraftFromRoute()
      syncComposerVisibility()
      return
    }

    if (shouldAutoOpenComposer.value) {
      composerVisible.value = true
    }
  },
  { immediate: true },
)

async function refreshConversationList() {
  hasConversationListLoaded.value = false

  try {
    await loadConversationListPage()
  } finally {
    hasConversationListLoaded.value = true
    syncComposerFromRoute()
  }
}

onMounted(() => {
  void refreshConversationList()
})

onActivated(() => {
  void refreshConversationList()
})
</script>

<template>
  <section class="customer-service-page">
    <PageTopBar title="联系客服" right-icon="plus" @back="goBack" @right="openComposer" />

    <div class="customer-service-scroll">
      <section class="service-entry-card">
        <div class="service-entry-avatar">客</div>

        <div class="service-entry-copy">
          <strong>平台客服</strong>
          <p>{{ unreadSummaryText }}</p>
        </div>

        <button type="button" class="service-entry-action" @click="openComposer">
          发起咨询
        </button>
      </section>

      <section v-if="sourceSummary" class="source-card">
        <div class="source-head">
          <span class="source-label">{{ sourceSummary.label }}</span>
          <strong>{{ sourceSummary.value }}</strong>
        </div>
        <p>{{ sourceSummary.description }}</p>
      </section>

      <section v-if="errorMessage" class="error-card">
        <p>{{ errorMessage }}</p>
      </section>

      <section class="conversation-section">
        <header class="conversation-section-head">
          <strong>会话列表</strong>
          <span class="conversation-count">{{ conversations.length }} 个会话</span>
        </header>

        <template v-if="hasConversations">
          <button
            v-for="conversation in conversations"
            :key="conversation.id"
            type="button"
            class="conversation-card"
            @click="openConversation(conversation.id)"
          >
            <div class="conversation-avatar-wrap">
              <div class="conversation-avatar">
                {{ (conversation.sourceLabel || '客服').slice(0, 1) }}
              </div>
              <span v-if="conversation.unreadCount > 0" class="conversation-avatar-dot" aria-hidden="true" />
            </div>

            <div class="conversation-main">
              <div class="conversation-head">
                <strong>{{ conversation.subject }}</strong>
                <span class="conversation-time">{{ formatDateTime(conversation.lastMessageAt) }}</span>
              </div>

              <div class="conversation-foot">
                <p class="conversation-preview">{{ conversation.previewText }}</p>
              </div>

              <div class="conversation-meta">
                <span class="conversation-status">{{ conversation.statusLabel }}</span>
                <span v-if="conversation.sourceLabel" class="conversation-source">{{ conversation.sourceLabel }}</span>
              </div>
            </div>
          </button>
        </template>

        <EmptyState
          v-else-if="!isLoading"
          class="empty-state"
          icon="chat-o"
          title="暂无客服会话"
          description="发起一条咨询后，会话会显示在这里。"
        />
      </section>
    </div>

    <van-popup
      v-model:show="composerVisible"
      round
      position="bottom"
      class="composer-popup"
      teleport="body"
    >
      <section class="composer-card">
        <header class="section-head">
          <strong>发起客服咨询</strong>
          <button type="button" class="text-button" @click="composerVisible = false">
            关闭
          </button>
        </header>

        <van-field
          v-model="draftSubject"
          class="composer-field"
          label="主题"
          maxlength="60"
          placeholder="请输入咨询主题"
        />
        <van-field
          v-model="draftContent"
          class="composer-field"
          autosize
          label="内容"
          maxlength="500"
          rows="5"
          type="textarea"
          placeholder="请输入你要咨询的问题"
        />

        <van-button
          block
          color="#07c160"
          :loading="isSubmitting"
          round
          type="primary"
          @click="submitConversation"
        >
          开始会话
        </van-button>
      </section>
    </van-popup>
  </section>
</template>

<style scoped>
.customer-service-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: #ededed;
}

.customer-service-scroll {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 0 24px;
}

.service-entry-card,
.source-card,
.conversation-section,
.error-card {
  background: #fff;
}

.service-entry-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
}

.service-entry-avatar,
.conversation-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #7c8aa5, #5b677d);
  color: #fff;
  font-size: 18px;
  font-weight: 700;
}

.conversation-avatar-wrap {
  position: relative;
  flex: none;
}

.conversation-avatar-dot {
  position: absolute;
  right: -2px;
  top: -2px;
  width: 10px;
  height: 10px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #fa5151;
}

.service-entry-copy {
  min-width: 0;
  flex: 1;
}

.service-entry-copy strong,
.source-card strong,
.section-head strong,
.conversation-head strong,
.conversation-section-head strong {
  color: #111;
  font-size: 16px;
  font-weight: 600;
}

.service-entry-copy p,
.source-card p,
.error-card p {
  margin: 4px 0 0;
  color: #888;
  font-size: 13px;
}

.service-entry-action {
  flex: none;
  padding: 0 14px;
  height: 32px;
  border: 0;
  border-radius: 999px;
  background: rgba(7, 193, 96, 0.12);
  color: #07c160;
  font-size: 13px;
  font-weight: 600;
}

.conversation-status,
.conversation-source,
.conversation-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #999;
}

.source-card {
  padding: 12px 16px;
}

.source-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.source-label {
  color: #999;
  font-size: 12px;
}

.conversation-section {
  display: flex;
  flex-direction: column;
}

.conversation-section-head,
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}

.composer-card {
  padding: 16px 16px calc(16px + env(safe-area-inset-bottom, 0px));
}

.composer-field {
  margin-bottom: 12px;
  border-radius: 12px;
  background: #f7f7f7;
}

.text-button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #07c160;
  font-size: 13px;
}

.error-card {
  margin: 0 16px;
  padding: 12px 16px;
  border-color: rgba(184, 72, 62, 0.14);
  background: #fff8f6;
  border-radius: 12px;
}

.error-card p {
  margin: 0;
  color: #b8483e;
}

.conversation-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border: 0;
  border-bottom: 1px solid #f0f0f0;
  background: #fff;
  text-align: left;
}

.conversation-main {
  min-width: 0;
  flex: 1;
}

.conversation-head,
.conversation-foot,
.conversation-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.conversation-foot {
  margin-top: 6px;
}

.conversation-meta {
  margin-top: 8px;
}

.conversation-time {
  flex: none;
  color: #999;
  font-size: 12px;
}

.conversation-preview {
  flex: 1;
  margin: 0;
  overflow: hidden;
  color: #7a7a7a;
  font-size: 13px;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-status {
  color: #07c160;
}

.conversation-source {
  color: #999;
}

.empty-state {
  margin: 48px 0;
}

.composer-popup {
  overflow: hidden;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
}
</style>
