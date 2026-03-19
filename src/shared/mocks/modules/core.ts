import type { ActionPermission, CursorPageResult, PageResult } from '@/shared/types/modules'
import type { CatalogCategoryItem } from '@/shared/types/modules/catalog'

export interface MockStoreSeed {
  areaId: string
  benefitTips: string[]
  businessHours: string
  followerCount: number
  isOwnShop: boolean
  logoUrl: string
  phone: string
  storeId: string
  storeName: string
  address: string
}

export interface MockProductAttribute {
  label: string
  value: string
}

export interface MockProductSpecValueSeed {
  valueId: string
  valueLabel: string
}

export interface MockProductSpecGroupSeed {
  groupId: string
  groupLabel: string
  values: MockProductSpecValueSeed[]
}

export interface MockSkuSeed {
  skuId: string
  specText: string
  price: number
  marketPrice: number | null
  stock: number
}

export interface MockProductSeed {
  categoryId: string
  categoryName: string
  gallery: string[]
  htmlContent: string
  imageUrl: string
  inventory: number
  isFCode: boolean
  isFlashSale: boolean
  isGroupBuy: boolean
  isOwnShop: boolean
  isPresell: boolean
  isVirtual: boolean
  marketPrice: number | null
  monthlySales: number
  productId: string
  productName: string
  sellingPoints: string[]
  serviceLabels: string[]
  specs: MockProductSpecGroupSeed[]
  skuList: MockSkuSeed[]
  storeId: string
  subtitle: string
  summary: string
  price: number
  attributes: MockProductAttribute[]
}

export interface MockUserSeed {
  avatarUrl: string
  email: string
  mobile: string
  nickname: string
  userId: string
  username: string
}

export interface MockAddressSeed {
  address: string
  addressId: string
  isDefault: boolean
  recipientName: string
  recipientPhone: string
}

export const mockImageUrl = '/favicon.ico'

export const mockAreas = [
  { areaId: 'area-jianghan', areaName: '江汉区' },
  { areaId: 'area-wuchang', areaName: '武昌区' },
  { areaId: 'area-hanyang', areaName: '汉阳区' },
] as const

export const mockStores: MockStoreSeed[] = [
  {
    address: '武汉市江汉区青年路 99 号艺术创意园 A2',
    areaId: 'area-jianghan',
    benefitTips: ['满99包邮', '店主精选'],
    businessHours: '09:30-21:00',
    followerCount: 18732,
    isOwnShop: true,
    logoUrl: mockImageUrl,
    phone: '027-85551234',
    storeId: 'store-art-house',
    storeName: '艺境生活馆',
  },
  {
    address: '武汉市武昌区中北路 66 号生活方式中心 B1',
    areaId: 'area-wuchang',
    benefitTips: ['当日达', '会员95折'],
    businessHours: '10:00-22:00',
    followerCount: 9541,
    isOwnShop: false,
    logoUrl: mockImageUrl,
    phone: '027-87770666',
    storeId: 'store-home-lab',
    storeName: 'HomeLab 生活选物',
  },
  {
    address: '武汉市汉阳区鹦鹉大道 188 号特产馆 2F',
    areaId: 'area-hanyang',
    benefitTips: ['地方特色', '礼盒定制'],
    businessHours: '09:00-20:30',
    followerCount: 6320,
    isOwnShop: false,
    logoUrl: mockImageUrl,
    phone: '027-84668888',
    storeId: 'store-food-story',
    storeName: '楚食记',
  },
]

export const mockCategoryTree: CatalogCategoryItem[] = [
  {
    categoryId: 'cat-festival',
    categoryName: '节日慰问',
    children: [
      { categoryId: 'cat-festival-gift-box', categoryName: '节庆礼盒', children: [], imageUrl: null },
      { categoryId: 'cat-festival-culture', categoryName: '文化伴手礼', children: [], imageUrl: null },
    ],
    imageUrl: mockImageUrl,
  },
  {
    categoryId: 'cat-food',
    categoryName: '特色美食',
    children: [
      { categoryId: 'cat-food-tea', categoryName: '茶礼', children: [], imageUrl: null },
      { categoryId: 'cat-food-snack', categoryName: '风味零食', children: [], imageUrl: null },
    ],
    imageUrl: mockImageUrl,
  },
  {
    categoryId: 'cat-art',
    categoryName: '艺术藏品',
    children: [
      { categoryId: 'cat-art-ceramic', categoryName: '陶瓷器物', children: [], imageUrl: null },
      { categoryId: 'cat-art-scarf', categoryName: '丝巾配饰', children: [], imageUrl: null },
    ],
    imageUrl: mockImageUrl,
  },
  {
    categoryId: 'cat-culture',
    categoryName: '文创产品',
    children: [
      { categoryId: 'cat-culture-bag', categoryName: '通勤箱包', children: [], imageUrl: null },
      { categoryId: 'cat-culture-stationery', categoryName: '办公文具', children: [], imageUrl: null },
    ],
    imageUrl: mockImageUrl,
  },
  {
    categoryId: 'cat-home',
    categoryName: '居家潮品',
    children: [
      { categoryId: 'cat-home-lighting', categoryName: '灯具', children: [], imageUrl: null },
      { categoryId: 'cat-home-cup', categoryName: '杯具', children: [], imageUrl: null },
    ],
    imageUrl: mockImageUrl,
  },
  {
    categoryId: 'cat-travel',
    categoryName: '旅游玩乐',
    children: [
      { categoryId: 'cat-travel-ticket', categoryName: '体验票券', children: [], imageUrl: null },
      { categoryId: 'cat-travel-package', categoryName: '城市路线', children: [], imageUrl: null },
    ],
    imageUrl: mockImageUrl,
  },
  {
    categoryId: 'cat-training',
    categoryName: '艺术培训',
    children: [
      { categoryId: 'cat-training-pottery', categoryName: '陶艺课', children: [], imageUrl: null },
      { categoryId: 'cat-training-painting', categoryName: '绘画课', children: [], imageUrl: null },
    ],
    imageUrl: mockImageUrl,
  },
  {
    categoryId: 'cat-book',
    categoryName: '书籍文具',
    children: [
      { categoryId: 'cat-book-visual', categoryName: '视觉图书', children: [], imageUrl: null },
      { categoryId: 'cat-book-notebook', categoryName: '纸品本册', children: [], imageUrl: null },
    ],
    imageUrl: mockImageUrl,
  },
]

export const mockProducts: MockProductSeed[] = [
  {
    attributes: [
      { label: '材质', value: '高密度帆布' },
      { label: '容量', value: '18L' },
      { label: '适用场景', value: '通勤 / 周末出行' },
    ],
    categoryId: 'cat-culture-bag',
    categoryName: '通勤箱包',
    gallery: [mockImageUrl, mockImageUrl, mockImageUrl],
    htmlContent: '<p>轻旅帆布通勤包采用双层帆布与分区收纳设计，适合日常通勤与短途出行。</p>',
    imageUrl: mockImageUrl,
    inventory: 42,
    isFCode: false,
    isFlashSale: true,
    isGroupBuy: false,
    isOwnShop: true,
    isPresell: false,
    isVirtual: false,
    marketPrice: 399,
    monthlySales: 418,
    price: 329,
    productId: 'prod-canvas-bag',
    productName: '轻旅帆布通勤包',
    sellingPoints: ['14寸笔记本分区', '轻量耐磨', '外层快取口袋'],
    serviceLabels: ['支持发票', '7天无理由'],
    skuList: [
      { marketPrice: 399, price: 329, skuId: 'sku-canvas-khaki', specText: '卡其 / 标准', stock: 18 },
      { marketPrice: 399, price: 329, skuId: 'sku-canvas-black', specText: '黑色 / 标准', stock: 24 },
    ],
    specs: [
      {
        groupId: 'spec-color',
        groupLabel: '颜色',
        values: [
          { valueId: 'khaki', valueLabel: '卡其' },
          { valueId: 'black', valueLabel: '黑色' },
        ],
      },
    ],
    storeId: 'store-art-house',
    subtitle: '适合城市通勤和周末出行的耐磨帆布包',
    summary: '适合城市通勤和周末出行的耐磨帆布包，内置笔记本分区。',
  },
  {
    attributes: [
      { label: '材质', value: '高温陶瓷' },
      { label: '容量', value: '220ml' },
      { label: '适用饮品', value: '咖啡 / 茶饮' },
    ],
    categoryId: 'cat-art-ceramic',
    categoryName: '陶瓷器物',
    gallery: [mockImageUrl, mockImageUrl],
    htmlContent: '<p>手冲陶瓷分享杯强调杯壁厚薄控制和分享感，适合精品咖啡与茶饮场景。</p>',
    imageUrl: mockImageUrl,
    inventory: 120,
    isFCode: false,
    isFlashSale: false,
    isGroupBuy: true,
    isOwnShop: false,
    isPresell: false,
    isVirtual: false,
    marketPrice: 109,
    monthlySales: 356,
    price: 89,
    productId: 'prod-ceramic-cup',
    productName: '手冲陶瓷分享杯',
    sellingPoints: ['手作器型', '杯壁厚薄均匀', '分享双杯场景'],
    serviceLabels: ['破损包赔'],
    skuList: [
      { marketPrice: 109, price: 89, skuId: 'sku-cup-cream', specText: '米白', stock: 68 },
      { marketPrice: 109, price: 89, skuId: 'sku-cup-ink', specText: '墨灰', stock: 52 },
    ],
    specs: [
      {
        groupId: 'spec-color',
        groupLabel: '颜色',
        values: [
          { valueId: 'cream', valueLabel: '米白' },
          { valueId: 'ink', valueLabel: '墨灰' },
        ],
      },
    ],
    storeId: 'store-home-lab',
    subtitle: '适合精品咖啡和茶饮场景的手作分享杯',
    summary: '杯壁厚薄控制稳定，适合精品咖啡和茶饮场景。',
  },
  {
    attributes: [
      { label: '规格', value: '8枚 / 盒' },
      { label: '口味', value: '茉莉龙井 / 桂花乌龙' },
      { label: '保质期', value: '180天' },
    ],
    categoryId: 'cat-food-tea',
    categoryName: '茶礼',
    gallery: [mockImageUrl, mockImageUrl, mockImageUrl],
    htmlContent: '<p>轻焙茶香礼盒包含两款风味茶点，适合节庆慰问与商务送礼。</p>',
    imageUrl: mockImageUrl,
    inventory: 76,
    isFCode: false,
    isFlashSale: false,
    isGroupBuy: false,
    isOwnShop: false,
    isPresell: false,
    isVirtual: false,
    marketPrice: 199,
    monthlySales: 267,
    price: 159,
    productId: 'prod-tea-gift-box',
    productName: '轻焙茶香礼盒',
    sellingPoints: ['节日慰问', '礼盒包装', '双口味搭配'],
    serviceLabels: ['支持礼袋', '企业团购'],
    skuList: [
      { marketPrice: 199, price: 159, skuId: 'sku-tea-standard', specText: '标准礼盒', stock: 76 },
    ],
    specs: [
      {
        groupId: 'spec-package',
        groupLabel: '规格',
        values: [{ valueId: 'standard', valueLabel: '标准礼盒' }],
      },
    ],
    storeId: 'store-food-story',
    subtitle: '适合节庆慰问与商务送礼的茶香礼盒',
    summary: '轻焙茶香与风味点心搭配的礼盒，适合节庆和商务场景。',
  },
  {
    attributes: [
      { label: '色温', value: '3000K - 5000K' },
      { label: '供电', value: 'USB-C' },
      { label: '适用场景', value: '办公 / 阅读 / 夜灯' },
    ],
    categoryId: 'cat-home-lighting',
    categoryName: '灯具',
    gallery: [mockImageUrl, mockImageUrl],
    htmlContent: '<p>折幕工作台灯支持双色调光和无极亮度调节，适合阅读与桌面办公。</p>',
    imageUrl: mockImageUrl,
    inventory: 15,
    isFCode: false,
    isFlashSale: false,
    isGroupBuy: false,
    isOwnShop: false,
    isPresell: true,
    isVirtual: false,
    marketPrice: 259,
    monthlySales: 280,
    price: 219,
    productId: 'prod-desk-lamp',
    productName: '折幕工作台灯',
    sellingPoints: ['双色调光', '桌面办公适配', '可折叠灯幕'],
    serviceLabels: ['一年质保'],
    skuList: [
      { marketPrice: 259, price: 219, skuId: 'sku-lamp-white', specText: '暖白款', stock: 9 },
      { marketPrice: 259, price: 229, skuId: 'sku-lamp-pro', specText: '专业款', stock: 6 },
    ],
    specs: [
      {
        groupId: 'spec-version',
        groupLabel: '版本',
        values: [
          { valueId: 'white', valueLabel: '暖白款' },
          { valueId: 'pro', valueLabel: '专业款' },
        ],
      },
    ],
    storeId: 'store-home-lab',
    subtitle: '适合办公与夜间阅读的双色调光台灯',
    summary: '暖白双色调光，适合桌面办公与夜间阅读。',
  },
]

export const mockUser: MockUserSeed = {
  avatarUrl: mockImageUrl,
  email: 'chenlin@example.com',
  mobile: '13800138000',
  nickname: '晨林',
  userId: 'user-chenlin',
  username: 'chenlin',
}

export const mockAddresses: MockAddressSeed[] = [
  {
    address: '武汉市江汉区青年路 99 号 2 栋 1602',
    addressId: 'addr-home',
    isDefault: true,
    recipientName: '陈琳',
    recipientPhone: '13800138000',
  },
  {
    address: '武汉市武昌区中北路 66 号 5 栋 803',
    addressId: 'addr-office',
    isDefault: false,
    recipientName: '陈琳',
    recipientPhone: '13900139000',
  },
]

export function getMockStore(storeId: string) {
  return mockStores.find((store) => store.storeId === storeId) ?? null
}

export function getMockProduct(productId: string) {
  return mockProducts.find((product) => product.productId === productId) ?? null
}

export function createPageResult<T>(list: T[], page = 1, pageSize = list.length, total = list.length): PageResult<T> {
  return {
    hasMore: page * pageSize < total,
    list,
    page,
    pageSize,
    total,
  }
}

export function createCursorPageResult<T>(list: T[], nextCursor: string | null = null): CursorPageResult<T> {
  return {
    hasMore: nextCursor !== null,
    list,
    nextCursor,
  }
}

export function allowActions<Action extends string>(keys: readonly Action[]): ActionPermission<Action>[] {
  return keys.map((key) => ({
    enabled: true,
    key,
    reason: null,
  }))
}

export function denyAction<Action extends string>(key: Action, reason: string): ActionPermission<Action> {
  return {
    enabled: false,
    key,
    reason,
  }
}
