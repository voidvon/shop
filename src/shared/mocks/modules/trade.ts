import type {
  AfterSaleListPageData,
  CartPageData,
  CheckoutPreview,
  OrderCenterPageData,
  OrderDetailPageData,
  RefundDetailPageData,
  SubmitOrderCommand,
  SubmitOrderResult,
  VirtualOrderListPageData,
} from '@/shared/types/modules'

import { allowActions, createPageResult, getMockStore, mockAddresses, mockImageUrl, mockProducts } from './core'

function createAmountDetails(goodsAmount: number, shippingAmount: number, discountAmount: number) {
  return [
    { amount: goodsAmount, code: 'goods', direction: 'increase' as const, label: '商品金额' },
    { amount: shippingAmount, code: 'shipping', direction: 'increase' as const, label: '运费' },
    { amount: discountAmount, code: 'discount', direction: 'decrease' as const, label: '优惠' },
  ]
}

const cartProductA = mockProducts[0]
const cartProductB = mockProducts[1]
const cartProductC = mockProducts[2]

if (!cartProductA || !cartProductB || !cartProductC) {
  throw new Error('Missing mock products for trade data')
}

const cartStoreA = getMockStore(cartProductA.storeId)
const cartStoreB = getMockStore(cartProductB.storeId)
const cartStoreC = getMockStore(cartProductC.storeId)

if (!cartStoreA || !cartStoreB || !cartStoreC) {
  throw new Error('Missing mock stores for trade data')
}

const cartGoodsAmount = cartProductA.price * 1 + cartProductB.price * 2 + cartProductC.price * 1
const cartShippingAmount = 12
const cartDiscountAmount = 20

export const mockCartPageData: CartPageData = {
  actions: allowActions(['select-store', 'select-item', 'change-quantity', 'delete-item', 'claim-coupon', 'submit-order']),
  amountDetails: createAmountDetails(cartGoodsAmount, cartShippingAmount, cartDiscountAmount),
  groups: [
    {
      actions: allowActions(['select-store', 'claim-coupon']),
      amountDetails: createAmountDetails(cartProductA.price, 0, 20),
      couponEntryLabel: '领券减20',
      coupons: [
        { amount: 20, couponId: 'coupon-store-art-house', expiresAt: '2026-03-31 23:59:59', thresholdAmount: 199 },
      ],
      giftPromotionTip: '帆布包赠防尘袋',
      items: [
        {
          actions: allowActions(['select-item', 'change-quantity', 'delete-item']),
          addonDescription: '春季上新',
          gifts: [{ giftName: '防尘袋', quantity: 1 }],
          lineId: 'cart-line-1',
          productId: cartProductA.productId,
          productImageUrl: cartProductA.imageUrl,
          productName: cartProductA.productName,
          promotionTags: ['flash-sale'],
          quantity: 1,
          selected: true,
          skuId: cartProductA.skuList[0]?.skuId ?? null,
          specText: cartProductA.skuList[0]?.specText ?? null,
          stock: cartProductA.inventory,
          storeId: cartStoreA.storeId,
          subtotalAmount: cartProductA.price,
          unitPrice: cartProductA.price,
        },
      ],
      selected: true,
      shippingTip: '满99包邮',
      storeId: cartStoreA.storeId,
      storeName: cartStoreA.storeName,
    },
    {
      actions: allowActions(['select-store', 'claim-coupon']),
      amountDetails: createAmountDetails(cartProductB.price * 2 + cartProductC.price, 12, 0),
      couponEntryLabel: '店铺券',
      coupons: [
        { amount: 10, couponId: 'coupon-store-home-lab', expiresAt: '2026-03-31 23:59:59', thresholdAmount: 199 },
      ],
      giftPromotionTip: null,
      items: [
        {
          actions: allowActions(['select-item', 'change-quantity', 'delete-item']),
          addonDescription: '人气热卖',
          gifts: [],
          lineId: 'cart-line-2',
          productId: cartProductB.productId,
          productImageUrl: cartProductB.imageUrl,
          productName: cartProductB.productName,
          promotionTags: ['group-buy'],
          quantity: 2,
          selected: true,
          skuId: cartProductB.skuList[0]?.skuId ?? null,
          specText: cartProductB.skuList[0]?.specText ?? null,
          stock: cartProductB.inventory,
          storeId: cartStoreB.storeId,
          subtotalAmount: cartProductB.price * 2,
          unitPrice: cartProductB.price,
        },
        {
          actions: allowActions(['select-item', 'change-quantity', 'delete-item']),
          addonDescription: '节日礼遇',
          gifts: [],
          lineId: 'cart-line-3',
          productId: cartProductC.productId,
          productImageUrl: cartProductC.imageUrl,
          productName: cartProductC.productName,
          promotionTags: [],
          quantity: 1,
          selected: true,
          skuId: cartProductC.skuList[0]?.skuId ?? null,
          specText: cartProductC.skuList[0]?.specText ?? null,
          stock: cartProductC.inventory,
          storeId: cartStoreC.storeId,
          subtotalAmount: cartProductC.price,
          unitPrice: cartProductC.price,
        },
      ],
      selected: true,
      shippingTip: '普通快递 12 元',
      storeId: cartStoreB.storeId,
      storeName: cartStoreB.storeName,
    },
  ],
  isLoggedIn: true,
  selectedCount: 4,
  totalAmount: cartGoodsAmount + cartShippingAmount - cartDiscountAmount,
}

export const mockCheckoutPreview: CheckoutPreview = {
  actions: allowActions(['select-address', 'select-coupon', 'change-payment', 'submit-order']),
  address: {
    address: mockAddresses[0]?.address ?? '',
    addressId: mockAddresses[0]?.addressId ?? 'addr-home',
    isDefault: mockAddresses[0]?.isDefault ?? true,
    recipientName: mockAddresses[0]?.recipientName ?? '陈琳',
    recipientPhone: mockAddresses[0]?.recipientPhone ?? '13800138000',
  },
  amountDetails: createAmountDetails(cartGoodsAmount, cartShippingAmount, cartDiscountAmount),
  availablePaymentChannels: ['recharge-card', 'predeposit', 'alipay', 'wechat-pay'],
  discountAmount: cartDiscountAmount,
  goodsAmount: cartGoodsAmount,
  payableAmount: cartGoodsAmount + cartShippingAmount - cartDiscountAmount,
  shippingAmount: cartShippingAmount,
  source: {
    cartLineIds: ['cart-line-1', 'cart-line-2', 'cart-line-3'],
    type: 'cart',
  },
  storeGroups: [
    {
      amountDetails: createAmountDetails(cartProductA.price, 0, 20),
      availableCoupons: [
        { amount: 20, couponId: 'coupon-store-art-house', couponName: '店铺满减券', selected: true, thresholdAmount: 199 },
      ],
      deliveryFee: 0,
      items: [
        {
          cartLineId: 'cart-line-1',
          productId: cartProductA.productId,
          productImageUrl: cartProductA.imageUrl,
          productName: cartProductA.productName,
          quantity: 1,
          skuId: cartProductA.skuList[0]?.skuId ?? null,
          specText: cartProductA.skuList[0]?.specText ?? null,
          subtotalAmount: cartProductA.price,
          unitPrice: cartProductA.price,
        },
      ],
      selectedCouponId: 'coupon-store-art-house',
      storeId: cartStoreA.storeId,
      storeName: cartStoreA.storeName,
    },
    {
      amountDetails: createAmountDetails(cartProductB.price * 2 + cartProductC.price, 12, 0),
      availableCoupons: [
        { amount: 10, couponId: 'coupon-store-home-lab', couponName: '店铺券', selected: false, thresholdAmount: 199 },
      ],
      deliveryFee: 12,
      items: [
        {
          cartLineId: 'cart-line-2',
          productId: cartProductB.productId,
          productImageUrl: cartProductB.imageUrl,
          productName: cartProductB.productName,
          quantity: 2,
          skuId: cartProductB.skuList[0]?.skuId ?? null,
          specText: cartProductB.skuList[0]?.specText ?? null,
          subtotalAmount: cartProductB.price * 2,
          unitPrice: cartProductB.price,
        },
        {
          cartLineId: 'cart-line-3',
          productId: cartProductC.productId,
          productImageUrl: cartProductC.imageUrl,
          productName: cartProductC.productName,
          quantity: 1,
          skuId: cartProductC.skuList[0]?.skuId ?? null,
          specText: cartProductC.skuList[0]?.specText ?? null,
          subtotalAmount: cartProductC.price,
          unitPrice: cartProductC.price,
        },
      ],
      selectedCouponId: null,
      storeId: cartStoreB.storeId,
      storeName: cartStoreB.storeName,
    },
  ],
}

export const mockSubmitOrderCommand: SubmitOrderCommand = {
  addressId: mockCheckoutPreview.address?.addressId ?? 'addr-home',
  paymentChannel: 'wechat-pay',
  settlements: [
    { buyerMessage: '请工作日送达。', couponId: 'coupon-store-art-house', storeId: cartStoreA.storeId },
    { buyerMessage: null, couponId: null, storeId: cartStoreB.storeId },
  ],
  source: mockCheckoutPreview.source,
}

export const mockSubmitOrderResult: SubmitOrderResult = {
  orderIds: ['order-20260319-001', 'order-20260319-002'],
  paymentSheet: {
    options: [
      { balanceAmount: 200, channel: 'recharge-card', enabled: true, passwordRequired: true },
      { balanceAmount: 368.5, channel: 'predeposit', enabled: true, passwordRequired: true },
      { balanceAmount: null, channel: 'alipay', enabled: true, passwordRequired: false },
      { balanceAmount: null, channel: 'wechat-pay', enabled: true, passwordRequired: false },
    ],
    orderIds: ['order-20260319-001', 'order-20260319-002'],
    payableAmount: mockCheckoutPreview.payableAmount,
  },
  redirectUrl: '/member/orders',
}

const physicalOrderCards = [
  {
    actions: allowActions(['pay', 'cancel']),
    amountDetails: createAmountDetails(cartProductA.price, 0, 20),
    itemCount: 1,
    items: [
      {
        actions: allowActions(['pay', 'cancel']),
        afterSaleStatus: null,
        orderItemId: 'order-item-1',
        productId: cartProductA.productId,
        productImageUrl: cartProductA.imageUrl,
        productName: cartProductA.productName,
        quantity: 1,
        skuDescription: cartProductA.skuList[0]?.specText ?? null,
        skuId: cartProductA.skuList[0]?.skuId ?? null,
        storeId: cartStoreA.storeId,
        subtotalAmount: cartProductA.price,
        unitPrice: cartProductA.price,
      },
    ],
    orderId: 'order-20260319-001',
    orderNo: 'NO20260319001',
    orderType: 'physical' as const,
    shippingAmount: 0,
    status: 'pending-payment' as const,
    statusText: '待付款',
    storeId: cartStoreA.storeId,
    storeName: cartStoreA.storeName,
    totalAmount: cartProductA.price - 20,
  },
  {
    actions: allowActions(['view-logistics', 'confirm-receipt', 'refund']),
    amountDetails: createAmountDetails(cartProductB.price * 2, 12, 0),
    itemCount: 2,
    items: [
      {
        actions: allowActions(['view-logistics', 'confirm-receipt', 'refund']),
        afterSaleStatus: null,
        orderItemId: 'order-item-2',
        productId: cartProductB.productId,
        productImageUrl: cartProductB.imageUrl,
        productName: cartProductB.productName,
        quantity: 2,
        skuDescription: cartProductB.skuList[0]?.specText ?? null,
        skuId: cartProductB.skuList[0]?.skuId ?? null,
        storeId: cartStoreB.storeId,
        subtotalAmount: cartProductB.price * 2,
        unitPrice: cartProductB.price,
      },
    ],
    orderId: 'order-20260318-002',
    orderNo: 'NO20260318002',
    orderType: 'physical' as const,
    shippingAmount: 12,
    status: 'pending-receipt' as const,
    statusText: '待收货',
    storeId: cartStoreB.storeId,
    storeName: cartStoreB.storeName,
    totalAmount: cartProductB.price * 2 + 12,
  },
]

export const mockOrderCenterPageData: OrderCenterPageData = {
  orderPage: createPageResult(physicalOrderCards, 1, 10, 18),
  paymentSheet: mockSubmitOrderResult.paymentSheet,
  query: {
    keyword: '',
    orderType: 'physical',
    page: 1,
    pageSize: 10,
    status: 'all',
  },
}

export const mockVirtualOrderListPageData: VirtualOrderListPageData = {
  orderPage: createPageResult([
    {
      actions: allowActions(['pay', 'review']),
      amountDetails: createAmountDetails(99, 0, 0),
      itemCount: 1,
      items: [
        {
          actions: allowActions(['pay', 'review']),
          afterSaleStatus: null,
          orderItemId: 'order-item-v1',
          productId: 'prod-art-class',
          productImageUrl: mockImageUrl,
          productName: '周末陶艺体验课',
          quantity: 1,
          skuDescription: '周六场',
          skuId: 'sku-art-class-sat',
          storeId: 'store-art-house',
          subtotalAmount: 99,
          unitPrice: 99,
        },
      ],
      orderId: 'order-virtual-001',
      orderNo: 'VR20260319001',
      orderType: 'virtual',
      shippingAmount: 0,
      status: 'pending-use',
      statusText: '待使用',
      storeId: 'store-art-house',
      storeName: '艺境生活馆',
      totalAmount: 99,
    },
  ], 1, 10, 3),
  paymentSheet: null,
  query: {
    keyword: '',
    page: 1,
    pageSize: 10,
    status: 'all',
  },
}

export const mockOrderDetailPageDataById: Record<string, OrderDetailPageData> = {
  'order-20260319-001': {
    actions: allowActions(['pay', 'cancel', 'copy-order-no']),
    address: {
      address: mockAddresses[0]?.address ?? '',
      recipientName: mockAddresses[0]?.recipientName ?? '陈琳',
      recipientPhone: mockAddresses[0]?.recipientPhone ?? '13800138000',
    },
    amountDetails: createAmountDetails(cartProductA.price, 0, 20),
    buyerMessage: '请工作日送达。',
    deliveryRemark: null,
    gifts: [{ giftName: '防尘袋', quantity: 1 }],
    invoiceInfo: '个人电子发票',
    items: physicalOrderCards[0]?.items ?? [],
    logistics: null,
    orderId: 'order-20260319-001',
    orderNo: 'NO20260319001',
    orderType: 'physical',
    payableAmount: cartProductA.price - 20,
    paymentMethod: null,
    promotions: [{ description: '满199减20', label: '店铺券' }],
    shippingAmount: 0,
    status: 'pending-payment',
    statusHint: '订单已提交，请在30分钟内完成支付。',
    statusText: '待付款',
    storeId: cartStoreA.storeId,
    storeName: cartStoreA.storeName,
    timeline: {
      completedAt: null,
      createdAt: '2026-03-19 10:00:00',
      paidAt: null,
      shippedAt: null,
    },
  },
  'order-20260318-002': {
    actions: allowActions(['view-logistics', 'confirm-receipt', 'refund', 'copy-order-no']),
    address: {
      address: mockAddresses[1]?.address ?? '',
      recipientName: mockAddresses[1]?.recipientName ?? '陈琳',
      recipientPhone: mockAddresses[1]?.recipientPhone ?? '13900139000',
    },
    amountDetails: createAmountDetails(cartProductB.price * 2, 12, 0),
    buyerMessage: null,
    deliveryRemark: '已放置门卫室。',
    gifts: [],
    invoiceInfo: null,
    items: physicalOrderCards[1]?.items ?? [],
    logistics: {
      description: '快件已到达武昌投递站，正在派送。',
      title: '顺丰速运',
      updatedAt: '2026-03-18 14:30:00',
    },
    orderId: 'order-20260318-002',
    orderNo: 'NO20260318002',
    orderType: 'physical',
    payableAmount: cartProductB.price * 2 + 12,
    paymentMethod: '微信支付',
    promotions: [],
    shippingAmount: 12,
    status: 'pending-receipt',
    statusHint: '商品已发出，请注意查收。',
    statusText: '待收货',
    storeId: cartStoreB.storeId,
    storeName: cartStoreB.storeName,
    timeline: {
      completedAt: null,
      createdAt: '2026-03-18 09:00:00',
      paidAt: '2026-03-18 09:03:00',
      shippedAt: '2026-03-18 12:10:00',
    },
  },
}

export const mockAfterSaleListPageData: AfterSaleListPageData = {
  query: {
    page: 1,
    pageSize: 10,
    type: 'refund',
  },
  refundPage: createPageResult([
    {
      actions: allowActions(['view-detail']),
      appliedAt: '2026-03-17 16:00:00',
      orderId: 'order-20260318-002',
      orderItemId: 'order-item-2',
      productImageUrl: cartProductB.imageUrl,
      productName: cartProductB.productName,
      quantity: 1,
      refundAmount: cartProductB.price,
      refundId: 'refund-001',
      skuDescription: cartProductB.skuList[0]?.specText ?? null,
      status: 'processing',
      statusText: '退款处理中',
      storeId: cartStoreB.storeId,
      storeName: cartStoreB.storeName,
      unitPrice: cartProductB.price,
    },
  ], 1, 10, 2),
  returnPage: createPageResult([
    {
      actions: allowActions(['view-detail', 'delay', 'ship-return']),
      appliedAt: '2026-03-15 12:00:00',
      orderId: 'order-20260318-002',
      orderItemId: 'order-item-2',
      productImageUrl: cartProductB.imageUrl,
      productName: cartProductB.productName,
      quantity: 2,
      refundAmount: cartProductB.price * 2,
      refundId: 'return-001',
      returnQuantity: 1,
      skuDescription: cartProductB.skuList[0]?.specText ?? null,
      status: 'awaiting-shipment',
      statusText: '待退货发货',
      storeId: cartStoreB.storeId,
      storeName: cartStoreB.storeName,
      unitPrice: cartProductB.price,
    },
  ], 1, 10, 1),
}

export const mockRefundDetailPageDataById: Record<string, RefundDetailPageData> = {
  'refund-001': {
    actions: allowActions(['view-detail']),
    amountDetail: {
      onlineRefundAmount: cartProductB.price,
      paymentMethod: '微信支付',
      predepositRefundAmount: 0,
      rechargeCardRefundAmount: 0,
    },
    description: '希望调整订单数量，先退一件。',
    evidenceImages: [{ imageUrl: mockImageUrl }],
    merchantProcess: { remark: '已收到申请，正在核验库存。', status: 'processing' },
    orderId: 'order-20260318-002',
    orderItemId: 'order-item-2',
    platformProcess: { remark: '平台审核中', status: 'pending' },
    reason: '拍错商品',
    refundAmount: cartProductB.price,
    refundId: 'refund-001',
    status: 'processing',
    statusText: '退款处理中',
  },
}

export const mockTradeData = {
  afterSaleListPageData: mockAfterSaleListPageData,
  cartPageData: mockCartPageData,
  checkoutPreview: mockCheckoutPreview,
  orderCenterPageData: mockOrderCenterPageData,
  orderDetailPageDataById: mockOrderDetailPageDataById,
  refundDetailPageDataById: mockRefundDetailPageDataById,
  submitOrderCommand: mockSubmitOrderCommand,
  submitOrderResult: mockSubmitOrderResult,
  virtualOrderListPageData: mockVirtualOrderListPageData,
}
