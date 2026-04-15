import { computed, ref } from 'vue'

const backendAAuthRecovering = ref(false)

export function startBackendAAuthRecovery() {
  backendAAuthRecovering.value = true
}

export function finishBackendAAuthRecovery() {
  backendAAuthRecovering.value = false
}

export function useBackendAAuthRecoveryState() {
  return computed(() => backendAAuthRecovering.value)
}

export function isBackendAAuthRecovering() {
  return backendAAuthRecovering.value
}
