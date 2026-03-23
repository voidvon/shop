import { reactive, ref } from 'vue'

import { useMemberPayPasswordChange } from '@/features/member-pay-password-change'

export function useMemberPayPasswordPageModel() {
  const { changeMemberPayPassword } = useMemberPayPasswordChange()
  const isSubmitting = ref(false)
  const form = reactive({
    confirmPassword: '',
    currentPassword: '',
    newPassword: '',
  })

  async function submitMemberPayPasswordForm() {
    isSubmitting.value = true

    try {
      await changeMemberPayPassword({
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
    submitMemberPayPasswordForm,
  }
}
