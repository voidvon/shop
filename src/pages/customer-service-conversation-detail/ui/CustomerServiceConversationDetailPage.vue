<script setup lang="ts">
import { nextTick, onActivated, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showFailToast, showToast } from 'vant'

import EmptyState from '@/shared/ui/EmptyState.vue'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

import { useCustomerServiceConversationDetailPageModel } from '../model/useCustomerServiceConversationDetailPageModel'

const POLLING_INTERVAL_MS = 12000

const route = useRoute()
const router = useRouter()
const draftMessage = ref('')
const messageListRef = useTemplateRef<HTMLDivElement>('messageListRef')

const {
  appendMessage,
  conversation,
  errorMessage,
  hasMessages,
  isLoading,
  isSending,
  loadConversationDetailPage,
  messages,
  syncConversationIncrement,
} = useCustomerServiceConversationDetailPageModel()

const conversationId = ref(String(route.params.conversationId ?? ''))
let pollingTimer: ReturnType<typeof setInterval> | null = null

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

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push({ name: 'member-customer-service' })
}

async function scrollToBottom() {
  await nextTick()
  const messageListElement = messageListRef.value

  if (!messageListElement) {
    return
  }

  messageListElement.scrollTop = messageListElement.scrollHeight
}

async function loadConversation() {
  if (!conversationId.value) {
    return
  }

  try {
    await loadConversationDetailPage(conversationId.value)
    await scrollToBottom()
  } catch (error) {
    showFailToast(error instanceof Error ? error.message : '客服会话加载失败')
  }
}

async function handleSendMessage() {
  if (!conversationId.value) {
    return
  }

  const content = draftMessage.value.trim()

  if (!content) {
    showToast('请输入要发送的内容')
    return
  }

  try {
    await appendMessage(conversationId.value, content)
    draftMessage.value = ''
    await scrollToBottom()
  } catch (error) {
    showFailToast(error instanceof Error ? error.message : '发送失败')
  }
}

function stopPolling() {
  if (!pollingTimer) {
    return
  }

  clearInterval(pollingTimer)
  pollingTimer = null
}

function startPolling() {
  stopPolling()

  if (!conversationId.value) {
    return
  }

  pollingTimer = setInterval(() => {
    void syncConversationIncrement(conversationId.value)
  }, POLLING_INTERVAL_MS)
}

watch(
  () => route.params.conversationId,
  (nextConversationId) => {
    conversationId.value = String(nextConversationId ?? '')
    void loadConversation()
    startPolling()
  },
  { immediate: true },
)

watch(
  () => messages.value.length,
  () => {
    void scrollToBottom()
  },
)

onMounted(() => {
  void loadConversation()
  startPolling()
})

onActivated(() => {
  void loadConversation()
  startPolling()
})

onBeforeUnmount(() => {
  stopPolling()
})
</script>

<template>
  <section class="customer-service-detail-page">
    <PageTopBar :title="conversation?.subject ?? '会话详情'" @back="goBack" />

    <div class="detail-shell">
      <section v-if="conversation" class="conversation-summary-card">
        <div>
          <strong>{{ conversation.subject }}</strong>
          <p>{{ conversation.sourceLabel ?? '在线客服' }}</p>
        </div>

        <span class="status-badge">{{ conversation.statusLabel }}</span>
      </section>

      <section v-if="errorMessage" class="error-card">
        <p>{{ errorMessage }}</p>
      </section>

      <div ref="messageListRef" class="message-list">
        <div v-if="conversation?.createdAt" class="message-time-separator">
          {{ formatDateTime(conversation.createdAt) }}
        </div>

        <template v-if="hasMessages">
          <article
            v-for="message in messages"
            :key="message.id || `${message.senderRole}:${message.sentAt}:${message.content}`"
            class="message-row"
            :class="{
              'message-row-member': message.senderRole === 'member',
              'message-row-service': message.senderRole !== 'member',
            }"
          >
            <div class="message-meta">
              <span>{{ message.senderName }}</span>
              <span>{{ formatDateTime(message.sentAt) }}</span>
            </div>

            <div
              class="message-bubble"
              :class="{
                'message-bubble-member': message.senderRole === 'member',
                'message-bubble-service': message.senderRole !== 'member',
              }"
            >
              {{ message.content }}
            </div>
          </article>
        </template>

        <EmptyState
          v-else-if="!isLoading"
          class="message-empty"
          icon="chat-o"
          title="暂无消息"
          description="发送第一条留言后，客服回复会显示在这里。"
        />
      </div>

      <footer class="composer-bar">
        <van-field
          v-model="draftMessage"
          autosize
          class="composer-input"
          maxlength="500"
          rows="2"
          type="textarea"
          :disabled="conversation?.canReply === false"
          placeholder="输入要发送给客服的内容"
        />
        <van-button
          color="linear-gradient(135deg, #1f8f74, #2fa78a)"
          :disabled="conversation?.canReply === false"
          :loading="isSending"
          round
          type="primary"
          @click="handleSendMessage"
        >
          发送
        </van-button>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.customer-service-detail-page {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  background:
    radial-gradient(circle at top, rgba(31, 143, 116, 0.14), transparent 32%),
    linear-gradient(180deg, #f2faf6 0%, #f5f3ef 38%, #f6f4f1 100%);
}

.detail-shell {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  padding: 16px 16px 20px;
}

.conversation-summary-card,
.error-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border: 1px solid rgba(32, 57, 49, 0.08);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18px 40px rgba(28, 55, 46, 0.08);
}

.conversation-summary-card strong {
  color: #1c2a24;
  font-size: 16px;
  font-weight: 600;
}

.conversation-summary-card p {
  margin: 8px 0 0;
  color: #6f7d77;
  font-size: 13px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(31, 143, 116, 0.12);
  color: #1f8f74;
  font-size: 12px;
  font-weight: 600;
}

.error-card {
  border-color: rgba(184, 72, 62, 0.14);
  background: #fff8f6;
}

.error-card p {
  margin: 0;
  color: #b8483e;
  font-size: 13px;
}

.message-list {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  padding: 6px 2px 0;
}

.message-time-separator {
  align-self: center;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(81, 103, 95, 0.08);
  color: #718078;
  font-size: 12px;
}

.message-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.message-row-member {
  align-items: flex-end;
}

.message-row-service {
  align-items: flex-start;
}

.message-meta {
  display: flex;
  gap: 8px;
  color: #7a8882;
  font-size: 12px;
}

.message-bubble {
  max-width: min(82%, 320px);
  padding: 12px 14px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-bubble-member {
  background: linear-gradient(135deg, #1f8f74, #2fa78a);
  color: #fff;
  border-bottom-right-radius: 8px;
}

.message-bubble-service {
  background: rgba(255, 255, 255, 0.96);
  color: #2b3833;
  border: 1px solid rgba(32, 57, 49, 0.08);
  border-bottom-left-radius: 8px;
}

.message-empty {
  margin-top: 48px;
}

.composer-bar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: flex-end;
  padding: 14px;
  border: 1px solid rgba(32, 57, 49, 0.08);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 18px 32px rgba(28, 55, 46, 0.08);
}

.composer-input {
  border-radius: 16px;
  background: #f6faf8;
}
</style>
