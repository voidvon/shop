<script setup lang="ts">
import { computed, onActivated, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showFailToast, showSuccessToast, showToast } from 'vant'

import PageTopBar from '@/shared/ui/PageTopBar.vue'
import EmptyState from '@/shared/ui/EmptyState.vue'

import { useCustomerServiceConversationListPageModel } from '../model/useCustomerServiceConversationListPageModel'

const route = useRoute()
const router = useRouter()
const composerVisible = ref(false)
const draftContent = ref('')
const draftSubject = ref('')

const {
  conversations,
  createConversation,
  errorMessage,
  hasConversations,
  isLoading,
  isSubmitting,
  loadConversationListPage,
  unreadSummary,
} = useCustomerServiceConversationListPageModel()

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

function syncComposerFromRoute() {
  const nextSubject = preferredSubject.value
    || (storeName.value ? `店铺咨询 · ${storeName.value}` : '客服咨询')
  const nextContent = preferredContent.value
    || (storeName.value ? `您好，我想咨询店铺“${storeName.value}”相关问题。` : '')

  draftSubject.value = nextSubject
  draftContent.value = nextContent
  composerVisible.value = shouldAutoOpenComposer.value
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
  () => [route.query.composer, route.query.content, route.query.storeId, route.query.storeName, route.query.subject],
  () => {
    if (!draftSubject.value.trim() && !draftContent.value.trim()) {
      syncComposerFromRoute()
      return
    }

    if (shouldAutoOpenComposer.value) {
      composerVisible.value = true
    }
  },
  { immediate: true },
)

onMounted(() => {
  void loadConversationListPage()
})

onActivated(() => {
  void loadConversationListPage()
})
</script>

<template>
  <section class="customer-service-page">
    <PageTopBar title="联系客服" right-icon="plus" @back="goBack" @right="openComposer" />

    <div class="customer-service-scroll">
      <section class="summary-card">
        <div>
          <strong>在线客服</strong>
          <p>{{ unreadSummaryText }}</p>
        </div>

        <span class="summary-badge">{{ conversations.length }} 个会话</span>
      </section>

      <section v-if="sourceSummary" class="source-card">
        <span class="source-label">{{ sourceSummary.label }}</span>
        <strong>{{ sourceSummary.value }}</strong>
        <p>{{ sourceSummary.description }}</p>
      </section>

      <section v-if="composerVisible" class="composer-card">
        <header class="section-head">
          <strong>发起客服咨询</strong>
          <button type="button" class="text-button" @click="composerVisible = false">
            收起
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
          rows="4"
          type="textarea"
          placeholder="请输入你要咨询的问题"
        />

        <van-button
          block
          color="linear-gradient(135deg, #1f8f74, #2fa78a)"
          :loading="isSubmitting"
          round
          type="primary"
          @click="submitConversation"
        >
          提交留言
        </van-button>
      </section>

      <section v-if="errorMessage" class="error-card">
        <p>{{ errorMessage }}</p>
      </section>

      <section v-if="hasConversations" class="conversation-list">
        <button
          v-for="conversation in conversations"
          :key="conversation.id"
          type="button"
          class="conversation-card"
          @click="openConversation(conversation.id)"
        >
          <div class="conversation-head">
            <strong>{{ conversation.subject }}</strong>
            <span class="conversation-time">{{ formatDateTime(conversation.lastMessageAt) }}</span>
          </div>

          <div class="conversation-meta">
            <span class="conversation-status">{{ conversation.statusLabel }}</span>
            <span v-if="conversation.sourceLabel" class="conversation-source">{{ conversation.sourceLabel }}</span>
          </div>

          <p class="conversation-preview">{{ conversation.previewText }}</p>

          <div class="conversation-foot">
            <span class="conversation-link">查看详情</span>
            <span v-if="conversation.unreadCount > 0" class="conversation-unread">
              {{ conversation.unreadCount }} 条未读
            </span>
          </div>
        </button>
      </section>

      <EmptyState
        v-else-if="!isLoading"
        class="empty-state"
        icon="chat-o"
        title="暂无客服会话"
        description="提交一条留言后，客服回复会显示在这里。"
      />
    </div>
  </section>
</template>

<style scoped>
.customer-service-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top, rgba(31, 143, 116, 0.14), transparent 36%),
    linear-gradient(180deg, #f4fbf8 0%, #f7f4ef 32%, #f7f5f1 100%);
}

.customer-service-scroll {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.summary-card,
.source-card,
.composer-card,
.conversation-card,
.error-card {
  border: 1px solid rgba(32, 57, 49, 0.08);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18px 40px rgba(28, 55, 46, 0.08);
}

.summary-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 18px;
}

.summary-card strong,
.source-card strong,
.section-head strong,
.conversation-head strong {
  color: #1c2a24;
  font-size: 16px;
  font-weight: 600;
}

.summary-card p,
.source-card p,
.conversation-preview,
.error-card p {
  margin: 8px 0 0;
  color: #66756e;
  font-size: 13px;
  line-height: 1.5;
}

.summary-badge,
.conversation-status,
.conversation-source,
.conversation-unread {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.summary-badge,
.conversation-status {
  background: rgba(31, 143, 116, 0.12);
  color: #1f8f74;
}

.source-card {
  padding: 18px;
}

.source-label {
  color: #7e8a85;
  font-size: 12px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.composer-card {
  padding: 18px;
}

.composer-field {
  margin-bottom: 12px;
  border-radius: 16px;
  background: #f6faf8;
}

.text-button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #1f8f74;
  font-size: 13px;
}

.error-card {
  padding: 14px 16px;
  border-color: rgba(184, 72, 62, 0.14);
  background: #fff8f6;
}

.error-card p {
  margin: 0;
  color: #b8483e;
}

.conversation-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.conversation-card {
  width: 100%;
  padding: 18px;
  text-align: left;
}

.conversation-head,
.conversation-meta,
.conversation-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.conversation-meta,
.conversation-foot {
  margin-top: 12px;
}

.conversation-time {
  color: #8a9791;
  font-size: 12px;
}

.conversation-source {
  background: rgba(48, 95, 82, 0.08);
  color: #305f52;
}

.conversation-preview {
  display: -webkit-box;
  margin-top: 12px;
  overflow: hidden;
  color: #42514b;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.conversation-link {
  color: #1f8f74;
  font-size: 13px;
  font-weight: 600;
}

.conversation-unread {
  background: rgba(184, 72, 62, 0.12);
  color: #b8483e;
}

.empty-state {
  margin-top: 48px;
}
</style>
