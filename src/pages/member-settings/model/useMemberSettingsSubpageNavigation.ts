import { useRouter } from 'vue-router'

export function useMemberSettingsSubpageNavigation() {
  const router = useRouter()

  function goBackToMemberSettings() {
    if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
      router.back()
      return
    }

    void router.push({ name: 'member-settings' })
  }

  return {
    goBackToMemberSettings,
  }
}
