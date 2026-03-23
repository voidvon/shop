import { reactive, ref } from 'vue'

import { useMemberPasswordChange } from '@/features/member-password-change'

export function useMemberPasswordPageModel() {
  const { changeMemberLoginPassword } = useMemberPasswordChange()
  const isSubmitting = ref(false)
  const form = reactive({
    confirmPassword: '',
    currentPassword: '',
    newPassword: '',
  })

  async function submitMemberPasswordForm() {
    isSubmitting.value = true

    try {
      await changeMemberLoginPassword({
        confirmPassword: form.confirmPassword,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    form,
    isSubmitting,
    submitMemberPasswordForm,
  }
}
