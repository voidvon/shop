import type {
  MerchantDeductionLogItem,
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

let mockDeductionLogs: MerchantDeductionLogItem[] = Array.from({ length: 36 }, (_, index) => {
  const sequence = index + 1
  const status = sequence % 6 === 0
    ? 'failed'
    : sequence % 4 === 0
      ? 'processing'
      : 'success'
  const paySource = sequence % 3 === 0 ? 'stored-value-card' : 'user-balance'

  return {
    amount: 28 + sequence * 3.6,
    balanceTypeName: paySource === 'stored-value-card' ? '文旅储值卡' : '文旅储值余额',
    canRefund: status === 'success',
    cardNumber: paySource === 'stored-value-card' ? `DG2026${String(sequence).padStart(6, '0')}` : null,
    createdAt: `2026-04-${String((sequence % 9) + 2).padStart(2, '0')} ${String((sequence % 10) + 9).padStart(2, '0')}:12:00`,
    failureReason: status === 'failed' ? '账户余额不足' : null,
    id: String(sequence),
    merchantName: '御欣堂旗舰店',
    paidAt: status === 'success'
      ? `2026-04-${String((sequence % 9) + 2).padStart(2, '0')} ${String((sequence % 10) + 9).padStart(2, '0')}:15:00`
      : null,
    paySource,
    paySourceLabel: paySource === 'stored-value-card' ? '储值卡' : '用户余额',
    paymentNo: `OFF20260411${String(sequence).padStart(4, '0')}`,
    remark: sequence % 5 === 0 ? '门店消费扣款' : null,
    refundNo: null,
    refundedAt: null,
    status,
    statusLabel: status === 'failed' ? '支付失败' : status === 'processing' ? '处理中' : '支付成功',
    userMobile: '138****0000',
    userName: `示例顾客${sequence}`,
  }
})

export const mockMerchantDeductionService: MerchantDeductionService = {
  async getDeductionLogs(query) {
    const page = Number.isFinite(query.page) && query.page > 0 ? Math.trunc(query.page) : 1
    const pageSize = Number.isFinite(query.pageSize) && query.pageSize > 0 ? Math.trunc(query.pageSize) : 20
    const start = (page - 1) * pageSize
    const list = mockDeductionLogs.slice(start, start + pageSize)

    return Promise.resolve({
      hasMore: start + pageSize < mockDeductionLogs.length,
      list,
      page,
      pageSize,
      total: mockDeductionLogs.length,
    })
  },

  async scanCode(rawCode: string) {
    return Promise.resolve(createMockScanResult(rawCode))
  },

  async refundDeduction(logId: string) {
    const targetLog = mockDeductionLogs.find((item) => item.id === logId) ?? null

    if (!targetLog) {
      throw new Error('未找到对应的线下付款流水')
    }

    if (!targetLog.canRefund) {
      throw new Error('当前流水暂不支持退款')
    }

    const refundedAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
    const refundNo = `REF${Date.now()}`

    mockDeductionLogs = mockDeductionLogs.map((item) =>
      item.id === logId
        ? {
            ...item,
            canRefund: false,
            refundNo,
            refundedAt,
            status: 'refunded',
            statusLabel: '已退款',
          }
        : item,
    )

    return Promise.resolve({
      rawPayload: {
        id: logId,
        refund_no: refundNo,
        refunded_at: refundedAt,
      },
      successMessage: '退款成功',
    })
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
