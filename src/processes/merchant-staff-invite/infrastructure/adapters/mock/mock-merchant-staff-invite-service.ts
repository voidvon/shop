import type {
  MerchantStaffBindResult,
  MerchantStaffInviteInfo,
  MerchantStaffInviteService,
} from '../../../domain/merchant-staff-invite-service'

function normalizeInviteToken(token: string) {
  const normalizedToken = token.trim()

  if (!normalizedToken) {
    throw new Error('缺少邀请标识')
  }

  return normalizedToken
}

export const mockMerchantStaffInviteService: MerchantStaffInviteService = {
  async bindInviteByToken(token: string): Promise<MerchantStaffBindResult> {
    normalizeInviteToken(token)

    return {
      successMessage: '模拟绑定成功，当前账号已成为商家员工',
    }
  },

  async getInviteByToken(token: string): Promise<MerchantStaffInviteInfo> {
    const normalizedToken = normalizeInviteToken(token)

    return {
      expiresAt: '2026-12-31 23:59:59',
      inviterName: '王店长',
      merchantId: '10001',
      merchantName: '御欣堂旗舰店',
      roleName: '商家员工',
      statusText: '待绑定',
      token: normalizedToken,
    }
  },
}
