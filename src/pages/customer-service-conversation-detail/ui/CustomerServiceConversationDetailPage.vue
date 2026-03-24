<script setup lang="ts">
import { computed, nextTick, onActivated, onBeforeUnmount, onDeactivated, ref, useTemplateRef, watch } from 'vue'
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

const conversationTitle = computed(() => conversation.value?.sourceLabel || '平台客服')
const conversationSubtitle = computed(() => {
  if (!conversation.value) {
    return '在线服务中'
  }

  if (conversation.value.canReply === false) {
    return '当前会话已关闭'
  }

  return conversation.value.statusLabel || '在线服务中'
})
const canReply = computed(() => conversation.value?.canReply !== false)
const footerPlaceholder = computed(() => (
  canReply.value ? '请输入消息' : '当前会话暂不可继续发送'
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

function formatTimeOnly(value: string | null) {
  if (!value) {
    return '刚刚'
  }

  const parsedValue = new Date(value)

  if (Number.isNaN(parsedValue.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsedValue)
}

function shouldShowTime(index: number) {
  const current = messages.value[index]
  const previous = messages.value[index - 1]

  if (!current) {
    return false
  }

  if (!previous?.sentAt || !current.sentAt) {
    return index === 0
  }

  return Date.parse(current.sentAt) - Date.parse(previous.sentAt) >= 5 * 60 * 1000
}

function resolveSenderAvatar(message: (typeof messages.value)[number]) {
  if (message.senderRole === 'member') {
    return '我'
  }

  if (message.senderRole === 'system') {
    return '系'
  }

  return '客'
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

function handleMessageKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' || event.shiftKey || event.isComposing) {
    return
  }

  event.preventDefault()
  void handleSendMessage()
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

watch(() => messages.value.length, () => {
  void scrollToBottom()
})

onActivated(() => {
  void loadConversation()
  startPolling()
})

onDeactivated(() => {
  stopPolling()
})

onBeforeUnmount(() => {
  stopPolling()
})
</script>

<template>
  <section class="customer-service-detail-page">
    <PageTopBar :title="conversationTitle" @back="goBack" />

    <div class="chat-status-bar">
      <div class="chat-status-copy">
        <strong>{{ conversationSubtitle }}</strong>
        <p>{{ conversation?.subject ?? '欢迎咨询平台客服' }}</p>
      </div>

      <span class="chat-status-chip">{{ canReply ? '在线' : '关闭' }}</span>
    </div>

    <section v-if="errorMessage" class="error-card">
      <p>{{ errorMessage }}</p>
    </section>

    <div ref="messageListRef" class="message-list">
      <div v-if="conversation?.createdAt" class="message-time-separator">
        {{ formatDateTime(conversation.createdAt) }}
      </div>

      <template v-if="hasMessages">
        <template
          v-for="(message, index) in messages"
          :key="message.id || `${message.senderRole}:${message.sentAt}:${message.content}`"
        >
          <div v-if="shouldShowTime(index)" class="message-time-separator">
            {{ formatDateTime(message.sentAt) }}
          </div>

          <article
            class="message-row"
            :class="{
              'message-row-member': message.senderRole === 'member',
              'message-row-service': message.senderRole !== 'member',
            }"
          >
            <div
              class="message-avatar"
              :class="{
                'message-avatar-member': message.senderRole === 'member',
                'message-avatar-service': message.senderRole !== 'member',
              }"
            >
              {{ resolveSenderAvatar(message) }}
            </div>

            <div class="message-content">
              <div class="message-meta">
                <span>{{ message.senderRole === 'member' ? '我' : (message.senderName || '在线客服') }}</span>
                <span>{{ formatTimeOnly(message.sentAt) }}</span>
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
            </div>
          </article>
        </template>
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
        rows="1"
        type="textarea"
        :disabled="!canReply"
        :placeholder="footerPlaceholder"
        @keydown="handleMessageKeydown"
      />
      <van-button
        color="#07c160"
        :disabled="!canReply || !draftMessage.trim()"
        :loading="isSending"
        round
        type="primary"
        @click="handleSendMessage"
      >
        发送
      </van-button>
    </footer>
  </section>
</template>

<style scoped>
.customer-service-detail-page {
  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  flex-direction: column;
  background: #ededed;
}

.chat-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(33, 33, 33, 0.06);
  background: rgba(245, 245, 245, 0.96);
}

.chat-status-copy {
  min-width: 0;
}

.chat-status-copy strong {
  display: block;
  overflow: hidden;
  color: #1f2329;
  font-size: 14px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-status-copy p {
  margin: 2px 0 0;
  overflow: hidden;
  color: #7b7f86;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-status-chip {
  flex: none;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(7, 193, 96, 0.12);
  color: #07c160;
  font-size: 12px;
  font-weight: 600;
}

.error-card {
  margin: 10px 16px 0;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(184, 72, 62, 0.14);
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
  gap: 10px;
  overflow-y: auto;
  padding: 14px 12px 12px;
}

.message-time-separator {
  align-self: center;
  padding: 2px 10px;
  color: #999;
  font-size: 12px;
}

.message-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.message-row-member {
  flex-direction: row-reverse;
}

.message-avatar {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
}

.message-avatar-member {
  background: linear-gradient(135deg, #22c55e, #07c160);
}

.message-avatar-service {
  background: linear-gradient(135deg, #7c8aa5, #5b677d);
}

.message-content {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
}

.message-row-member .message-content {
  align-items: flex-end;
}

.message-meta {
  display: flex;
  gap: 8px;
  color: #999;
  font-size: 12px;
}

.message-bubble {
  width: fit-content;
  max-width: min(calc(100% - 56px), 320px);
  min-width: 44px;
  padding: 11px 13px;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: normal;
  overflow-wrap: anywhere;
  position: relative;
}

.message-bubble-member {
  background: #95ec69;
  color: #1f2329;
}

.message-bubble-service {
  background: #fff;
  color: #1f2329;
}

.message-empty {
  margin-top: 48px;
}

.composer-bar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: flex-end;
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid rgba(33, 33, 33, 0.06);
  background: #f7f7f7;
}

.composer-input {
  border-radius: 8px;
  background: #fff;
}

.composer-input :deep(.van-field__control) {
  max-height: 120px;
}

.composer-input :deep(.van-field__body) {
  align-items: flex-end;
}

.composer-input :deep(.van-field__value) {
  padding: 8px 0;
}

.composer-bar :deep(.van-button) {
  min-width: 70px;
  --van-button-primary-border-color: #07c160;
}

@media (max-width: 360px) {
  .message-bubble {
    max-width: min(78%, 260px);
  }
}
</style>
