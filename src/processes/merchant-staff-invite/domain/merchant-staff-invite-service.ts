export interface MerchantStaffInviteInfo {
  expiresAt: string | null
  inviterName: string | null
  merchantId: string | null
  merchantName: string | null
  roleName: string | null
  statusText: string | null
  token: string
}

export interface MerchantStaffBindResult {
  successMessage: string
}

export interface MerchantStaffInviteService {
  bindInviteByToken(token: string): Promise<MerchantStaffBindResult>
  getInviteByToken(token: string): Promise<MerchantStaffInviteInfo>
}
