import type {
  MerchantDeductionScanResult,
  MerchantDeductionService,
  MerchantDeductionSubmitCommand,
  MerchantDeductionSummaryRow,
} from '../../../domain/merchant-deduction-service'

function normalizeMockRawCode(rawCode: string) {
  const normalizedRawCode = rawCode.trim()

  if (!normalizedRawCode) {
    throw new Error('未读取到付款码')
  }

  if (!normalizedRawCode.includes(',')) {
    return normalizedRawCode
  }

  const [, restValue = ''] = normalizedRawCode.split(',', 2)
  return restValue.trim() || normalizedRawCode
}

function buildMockSummaryRows(
  paymentToken: string | null,
  cardQrContent: string | null,
): MerchantDeductionSummaryRow[] {
  const rows: MerchantDeductionSummaryRow[] = [
    { label: '用户', value: '示例顾客' },
    { label: '手机号', value: '138****0000' },
    { label: '余额类型', value: '文旅储值余额' },
  ]

  if (paymentToken) {
    rows.push({ label: '付款码', value: paymentToken })
  }

  if (cardQrContent) {
    rows.push({ label: '二维码内容', value: cardQrContent })
  }

  return rows
}

function createMockScanResult(rawCode: string): MerchantDeductionScanResult {
  const normalizedRawCode = normalizeMockRawCode(rawCode)
  const looksLikeCard = normalizedRawCode.includes('=')

  return {
    balanceTypeId: '1',
    balanceTypeName: '文旅储值余额',
    cardNumber: looksLikeCard ? 'DG2026000001' : null,
    cardQrContent: looksLikeCard ? normalizedRawCode : null,
    payerMobile: '138****0000',
    payerName: '示例顾客',
    paymentToken: looksLikeCard ? null : normalizedRawCode,
    rawCode,
    summaryRows: buildMockSummaryRows(looksLikeCard ? null : normalizedRawCode, looksLikeCard ? normalizedRawCode : null),
  }
}

export const mockMerchantDeductionService: MerchantDeductionService = {
  async scanCode(rawCode: string) {
    return Promise.resolve(createMockScanResult(rawCode))
  },

  async submitDeduction(command: MerchantDeductionSubmitCommand) {
    if (!Number.isFinite(command.amount) || command.amount <= 0) {
      throw new Error('请输入正确的扣款金额')
    }

    if (!command.paymentToken && !command.cardQrContent) {
      throw new Error('请先扫描付款码')
    }

    return Promise.resolve({
      rawPayload: {
        amount: command.amount,
        merchant_id: command.merchantId,
        remark: command.remark ?? null,
      },
      successMessage: `已成功扣款 ¥${command.amount.toFixed(2)}`,
    })
  },

  async uploadImage(file) {
    const previewUrl = typeof window !== 'undefined' ? URL.createObjectURL(file) : ''

    return Promise.resolve({
      disk: 'mock',
      mimeType: file.type || 'image/jpeg',
      name: file.name,
      path: `mock/uploads/${Date.now()}-${file.name}`,
      previewUrl,
      size: file.size,
    })
  },
}
