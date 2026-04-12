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
const composerInputRef = useTemplateRef<HTMLDivElement>('composerInputRef')
const imageInputRef = useTemplateRef<HTMLInputElement>('imageInputRef')
const messageListRef = useTemplateRef<HTMLDivElement>('messageListRef')

const {
  appendImageMessage,
  appendMessage,
  conversation,
  errorMessage,
  hasMessages,
  isLoading,
  isSending,
  isUploadingImage,
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
const isComposerBusy = computed(() => isSending.value || isUploadingImage.value)
const markdownImagePattern = /^!\[([^\]]*)\]\(([^)]+)\)(?:\s*[\r\n]+([\s\S]+))?$/
const taggedImagePattern = /^【图片】\s*(\S+)(?:\s*[\r\n]+([\s\S]+))?$/

function normalizeImageSource(value: string) {
  const normalizedValue = value.trim()

  if (!normalizedValue) {
    return null
  }

  if (
    normalizedValue.startsWith('http://')
    || normalizedValue.startsWith('https://')
    || normalizedValue.startsWith('data:image/')
    || normalizedValue.startsWith('/')
    || normalizedValue.startsWith('./')
    || normalizedValue.startsWith('../')
  ) {
    return normalizedValue
  }

  return null
}

function resolveImageMessagePayload(content: string) {
  const normalizedContent = content.trim()

  if (!normalizedContent) {
    return null
  }

  const markdownMatch = normalizedContent.match(markdownImagePattern)

  if (markdownMatch) {
    const imageUrl = normalizeImageSource(markdownMatch[2] ?? '')

    if (!imageUrl) {
      return null
    }

    return {
      alt: markdownMatch[1]?.trim() || '聊天图片',
      caption: markdownMatch[3]?.trim() || null,
      url: imageUrl,
    }
  }

  const taggedMatch = normalizedContent.match(taggedImagePattern)

  if (taggedMatch) {
    const imageUrl = normalizeImageSource(taggedMatch[1] ?? '')

    if (!imageUrl) {
      return null
    }

    return {
      alt: '聊天图片',
      caption: taggedMatch[2]?.trim() || null,
      url: imageUrl,
    }
  }

  return null
}

function isImageMessage(content: string) {
  return Boolean(resolveImageMessagePayload(content))
}

function resolveImageMessageUrl(content: string) {
  return resolveImageMessagePayload(content)?.url ?? ''
}

function resolveImageMessageAlt(content: string) {
  return resolveImageMessagePayload(content)?.alt ?? '聊天图片'
}

function resolveImageMessageCaption(content: string) {
  return resolveImageMessagePayload(content)?.caption ?? ''
}

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

function openAttachmentPicker() {
  if (!canReply.value || isComposerBusy.value) {
    return
  }

  imageInputRef.value?.click()
}

function focusComposerInput() {
  if (!canReply.value) {
    return
  }

  const inputElement = composerInputRef.value?.querySelector('textarea, input') as
    | HTMLTextAreaElement
    | HTMLInputElement
    | null

  inputElement?.focus()
}

async function handleImageFileChange(event: Event) {
  if (!conversationId.value) {
    return
  }

  const inputElement = event.target as HTMLInputElement | null
  const selectedFile = inputElement?.files?.[0] ?? null

  if (!selectedFile) {
    return
  }

  if (inputElement) {
    inputElement.value = ''
  }

  if (!selectedFile.type.startsWith('image/')) {
    showToast('请选择图片文件')
    return
  }

  try {
    await appendImageMessage(conversationId.value, selectedFile)
    await scrollToBottom()
  } catch (error) {
    showFailToast(error instanceof Error ? error.message : '图片发送失败')
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
                  'message-bubble-image': isImageMessage(message.content),
                  'message-bubble-member': message.senderRole === 'member',
                  'message-bubble-service': message.senderRole !== 'member',
                }"
              >
                <template v-if="isImageMessage(message.content)">
                  <img
                    class="message-image"
                    :src="resolveImageMessageUrl(message.content)"
                    :alt="resolveImageMessageAlt(message.content)"
                  >
                  <p v-if="resolveImageMessageCaption(message.content)" class="message-image-caption">
                    {{ resolveImageMessageCaption(message.content) }}
                  </p>
                </template>
                <template v-else>
                  {{ message.content }}
                </template>
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
      <input
        ref="imageInputRef"
        class="composer-file-input"
        accept="image/*"
        type="file"
        @change="handleImageFileChange"
      >
      <button
        type="button"
        class="attachment-button"
        :disabled="!canReply || isComposerBusy"
        @click="openAttachmentPicker"
      >
        <van-loading v-if="isUploadingImage" size="18" />
        <van-icon v-else name="photograph" size="20" />
      </button>
      <div
        ref="composerInputRef"
        class="composer-input"
        @click="focusComposerInput"
      >
        <van-field
          v-model="draftMessage"
          autosize
          class="composer-input-field"
          maxlength="500"
          rows="1"
          type="textarea"
          :disabled="!canReply"
          :placeholder="footerPlaceholder"
          @keydown="handleMessageKeydown"
        />
      </div>
      <van-button
        color="#07c160"
        :disabled="!canReply || !draftMessage.trim() || isUploadingImage"
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
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  background: #ededed;
  overflow: hidden;
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
  flex: 1;
  min-width: 0;
  min-height: 0;
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

.message-bubble-image {
  min-width: 0;
  max-width: min(calc(100% - 56px), 248px);
  padding: 8px;
}

.message-bubble-member {
  background: #95ec69;
  color: #1f2329;
}

.message-bubble-service {
  background: #fff;
  color: #1f2329;
}

.message-image {
  display: block;
  width: 100%;
  max-width: 232px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.08);
  object-fit: cover;
}

.message-image-caption {
  margin: 8px 2px 2px;
  color: inherit;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-empty {
  margin-top: 48px;
}

.composer-bar {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 6px 12px calc(6px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid rgba(33, 33, 33, 0.06);
  background: #f7f7f7;
}

.composer-file-input {
  display: none;
}

.attachment-button {
  display: inline-flex;
  align-self: center;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #6b7280;
}

.attachment-button:disabled {
  opacity: 0.45;
}

.composer-input {
  display: flex;
  align-items: center;
  min-width: 0;
  width: 100%;
  min-height: 30px;
  border-radius: 6px;
  background: #fff;
  cursor: text;
}

.composer-input-field {
  flex: 1;
  min-width: 0;
  width: 100%;
}

.composer-input-field :deep(.van-cell) {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 30px;
  padding: 0 10px;
}

.composer-input-field :deep(.van-field__control) {
  width: 100%;
  max-width: none;
  max-height: 120px;
  min-height: 20px;
  padding: 0;
  line-height: 20px;
}

.composer-input-field :deep(.van-field__body) {
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
  width: 100%;
  min-height: 30px;
}

.composer-input-field :deep(.van-field__value) {
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
  width: 100%;
  padding: 2px 0;
}

.composer-bar :deep(.van-button) {
  align-self: center;
  height: 34px;
  min-width: 70px;
  --van-button-primary-border-color: #07c160;
}

@media (max-width: 360px) {
  .message-bubble {
    max-width: min(78%, 260px);
  }
}
</style>
