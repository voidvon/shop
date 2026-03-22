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
  {
    attributes: [
      { label: '规格', value: 'A5 / 2 本装' },
      { label: '纸张', value: '100g 米白道林纸' },
      { label: '适用场景', value: '会议记录 / 日常手账' },
    ],
    categoryId: 'cat-book-notebook',
    categoryName: '纸品本册',
    gallery: [mockImageUrl, mockImageUrl],
    htmlContent: '<p>城市纹理手账本采用压纹封面与平摊装订，适合会议记录与日常随手书写。</p>',
    imageUrl: mockImageUrl,
    inventory: 96,
    isFCode: false,
    isFlashSale: false,
    isGroupBuy: false,
    isOwnShop: true,
    isPresell: false,
    isVirtual: false,
    marketPrice: 69,
    monthlySales: 214,
    price: 52,
    productId: 'prod-city-notebook',
    productName: '城市纹理手账本',
    sellingPoints: ['压纹封面', '平摊装订', '双本组合'],
    serviceLabels: ['支持发票', '满99包邮'],
    skuList: [
      { marketPrice: 69, price: 52, skuId: 'sku-notebook-sand', specText: '砂岩灰 / 双本装', stock: 54 },
      { marketPrice: 69, price: 52, skuId: 'sku-notebook-green', specText: '苔绿 / 双本装', stock: 42 },
    ],
    specs: [
      {
        groupId: 'spec-color',
        groupLabel: '颜色',
        values: [
          { valueId: 'sand', valueLabel: '砂岩灰' },
          { valueId: 'green', valueLabel: '苔绿' },
        ],
      },
    ],
    storeId: 'store-art-house',
    subtitle: '适合会议记录和日常手写的平摊手账本',
    summary: '压纹封面与平摊装订结合，兼顾会议记录和日常手写。',
  },
  {
    attributes: [
      { label: '材质', value: '16姆米真丝斜纹' },
      { label: '尺寸', value: '88cm x 88cm' },
      { label: '搭配场景', value: '通勤 / 节日送礼' },
    ],
    categoryId: 'cat-art-scarf',
    categoryName: '丝巾配饰',
    gallery: [mockImageUrl, mockImageUrl, mockImageUrl],
    htmlContent: '<p>湖岸印象真丝方巾以城市湖岸线条为灵感，适合通勤穿搭与节日赠礼。</p>',
    imageUrl: mockImageUrl,
    inventory: 38,
    isFCode: false,
    isFlashSale: true,
    isGroupBuy: false,
    isOwnShop: false,
    isPresell: false,
    isVirtual: false,
    marketPrice: 269,
    monthlySales: 143,
    price: 219,
    productId: 'prod-silk-scarf',
    productName: '湖岸印象真丝方巾',
    sellingPoints: ['城市湖岸图案', '真丝斜纹', '礼盒包装'],
    serviceLabels: ['支持礼袋', '顺丰包邮'],
    skuList: [
      { marketPrice: 269, price: 219, skuId: 'sku-scarf-blue', specText: '湖蓝', stock: 20 },
      { marketPrice: 269, price: 219, skuId: 'sku-scarf-amber', specText: '琥珀', stock: 18 },
    ],
    specs: [
      {
        groupId: 'spec-color',
        groupLabel: '颜色',
        values: [
          { valueId: 'blue', valueLabel: '湖蓝' },
          { valueId: 'amber', valueLabel: '琥珀' },
        ],
      },
    ],
    storeId: 'store-home-lab',
    subtitle: '以城市湖岸为灵感的真丝方巾',
    summary: '真丝斜纹与城市湖岸图案结合，适合通勤搭配和节日送礼。',
  },
  {
    attributes: [
      { label: '内容', value: '双人展览通票' },
      { label: '有效期', value: '下单后 30 天内使用' },
      { label: '核销方式', value: '线上预约 / 到店验码' },
    ],
    categoryId: 'cat-travel-ticket',
    categoryName: '体验票券',
    gallery: [mockImageUrl, mockImageUrl],
    htmlContent: '<p>光影展双人体验票支持线上预约与现场验码，适合周末出游和朋友同逛。</p>',
    imageUrl: mockImageUrl,
    inventory: 999,
    isFCode: false,
    isFlashSale: false,
    isGroupBuy: true,
    isOwnShop: false,
    isPresell: false,
    isVirtual: true,
    marketPrice: 168,
    monthlySales: 507,
    price: 128,
    productId: 'prod-exhibition-ticket',
    productName: '光影展双人体验票',
    sellingPoints: ['双人同游', '线上预约', '周末可用'],
    serviceLabels: ['随时退', '极速出票'],
    skuList: [
      { marketPrice: 168, price: 128, skuId: 'sku-ticket-weekday', specText: '平日票', stock: 999 },
      { marketPrice: 188, price: 148, skuId: 'sku-ticket-weekend', specText: '周末票', stock: 999 },
    ],
    specs: [
      {
        groupId: 'spec-session',
        groupLabel: '场次',
        values: [
          { valueId: 'weekday', valueLabel: '平日票' },
          { valueId: 'weekend', valueLabel: '周末票' },
        ],
      },
    ],
    storeId: 'store-art-house',
    subtitle: '适合朋友同逛与周末出游的双人体验票',
    summary: '支持线上预约与到店验码的双人体验票，适合周末轻出游。',
  },
  {
    attributes: [
      { label: '规格', value: '10 袋 / 盒' },
      { label: '口味', value: '椒香藕片 / 糯米锅巴 / 桂花山楂' },
      { label: '适合场景', value: '办公室分享 / 节庆伴手礼' },
    ],
    categoryId: 'cat-food-snack',
    categoryName: '风味零食',
    gallery: [mockImageUrl, mockImageUrl, mockImageUrl],
    htmlContent: '<p>江城风味零食盒收录三种地方风味小食，适合办公室分享和节庆伴手礼。</p>',
    imageUrl: mockImageUrl,
    inventory: 88,
    isFCode: false,
    isFlashSale: false,
    isGroupBuy: false,
    isOwnShop: false,
    isPresell: false,
    isVirtual: false,
    marketPrice: 129,
    monthlySales: 324,
    price: 99,
    productId: 'prod-snack-box',
    productName: '江城风味零食盒',
    sellingPoints: ['三种风味组合', '办公室分享', '伴手礼友好'],
    serviceLabels: ['支持礼袋', '企业采购'],
    skuList: [
      { marketPrice: 129, price: 99, skuId: 'sku-snack-classic', specText: '经典组合', stock: 56 },
      { marketPrice: 149, price: 119, skuId: 'sku-snack-festival', specText: '节庆组合', stock: 32 },
    ],
    specs: [
      {
        groupId: 'spec-package',
        groupLabel: '组合',
        values: [
          { valueId: 'classic', valueLabel: '经典组合' },
          { valueId: 'festival', valueLabel: '节庆组合' },
        ],
      },
    ],
    storeId: 'store-food-story',
    subtitle: '适合办公室分享和节庆伴手礼的风味零食盒',
    summary: '三种地方风味小食组合成盒，适合办公室分享和节庆伴手礼。',
  },
  {
    attributes: [
      { label: '材质', value: '原竹纤维 / 软木底座' },
      { label: '规格', value: '12W 双音腔' },
      { label: '适用场景', value: '桌面办公 / 居家听音' },
    ],
    categoryId: 'cat-home-cup',
    categoryName: '杯具',
    gallery: [mockImageUrl, mockImageUrl],
    htmlContent: '<p>竹纹蓝牙音响杯垫组合把桌面音响与杯垫底座结合，适合办公和轻居家听音场景。</p>',
    imageUrl: mockImageUrl,
    inventory: 44,
    isFCode: false,
    isFlashSale: false,
    isGroupBuy: false,
    isOwnShop: false,
    isPresell: false,
    isVirtual: false,
    marketPrice: 189,
    monthlySales: 198,
    price: 149,
    productId: 'prod-bamboo-speaker-pad',
    productName: '竹纹蓝牙音响杯垫组合',
    sellingPoints: ['桌面双用', '原竹纹理', '蓝牙即连'],
    serviceLabels: ['一年质保', '支持发票'],
    skuList: [
      { marketPrice: 189, price: 149, skuId: 'sku-bamboo-natural', specText: '原木色', stock: 24 },
      { marketPrice: 189, price: 149, skuId: 'sku-bamboo-walnut', specText: '胡桃色', stock: 20 },
    ],
    specs: [
      {
        groupId: 'spec-color',
        groupLabel: '颜色',
        values: [
          { valueId: 'natural', valueLabel: '原木色' },
          { valueId: 'walnut', valueLabel: '胡桃色' },
        ],
      },
    ],
    storeId: 'store-home-lab',
    subtitle: '把桌面音响与杯垫结合的轻桌面小物',
    summary: '兼顾杯垫与桌面音响功能，适合办公和轻居家场景。',
  },
  {
    attributes: [
      { label: '材质', value: '铝合金 / 牛皮纸套' },
      { label: '规格', value: '0.5mm 黑芯 3 支装' },
      { label: '适用场景', value: '签字 / 手账 / 会议记录' },
    ],
    categoryId: 'cat-culture-stationery',
    categoryName: '办公文具',
    gallery: [mockImageUrl, mockImageUrl],
    htmlContent: '<p>城市线稿签字笔组采用轻磨砂金属笔杆，适合会议记录和日常随写。</p>',
    imageUrl: mockImageUrl,
    inventory: 130,
    isFCode: false,
    isFlashSale: false,
    isGroupBuy: false,
    isOwnShop: true,
    isPresell: false,
    isVirtual: false,
    marketPrice: 49,
    monthlySales: 312,
    price: 36,
    productId: 'prod-city-pen-set',
    productName: '城市线稿签字笔组',
    sellingPoints: ['轻磨砂笔杆', '三支组合', '书写顺滑'],
    serviceLabels: ['支持发票', '满99包邮'],
    skuList: [
      { marketPrice: 49, price: 36, skuId: 'sku-pen-black', specText: '曜石黑', stock: 68 },
      { marketPrice: 49, price: 36, skuId: 'sku-pen-silver', specText: '雾银', stock: 62 },
    ],
    specs: [
      {
        groupId: 'spec-color',
        groupLabel: '颜色',
        values: [
          { valueId: 'black', valueLabel: '曜石黑' },
          { valueId: 'silver', valueLabel: '雾银' },
        ],
      },
    ],
    storeId: 'store-art-house',
    subtitle: '适合会议记录与日常随写的金属签字笔组',
    summary: '轻磨砂金属笔杆与顺滑黑芯结合，适合日常办公与手账。',
  },
  {
    attributes: [
      { label: '材质', value: '陶土 / 釉彩' },
      { label: '时长', value: '90 分钟' },
      { label: '适合人群', value: '零基础体验' },
    ],
    categoryId: 'cat-training-pottery',
    categoryName: '陶艺课',
    gallery: [mockImageUrl, mockImageUrl],
    htmlContent: '<p>周末陶艺体验课适合零基础上手，从拉坯到上釉完成一套入门流程。</p>',
    imageUrl: mockImageUrl,
    inventory: 60,
    isFCode: false,
    isFlashSale: false,
    isGroupBuy: true,
    isOwnShop: true,
    isPresell: false,
    isVirtual: true,
    marketPrice: 168,
    monthlySales: 146,
    price: 128,
    productId: 'prod-pottery-workshop',
    productName: '周末陶艺体验课',
    sellingPoints: ['零基础可学', '含基础材料', '周末场次'],
    serviceLabels: ['随时退', '预约制'],
    skuList: [
      { marketPrice: 168, price: 128, skuId: 'sku-pottery-am', specText: '上午场', stock: 28 },
      { marketPrice: 168, price: 128, skuId: 'sku-pottery-pm', specText: '下午场', stock: 32 },
    ],
    specs: [
      {
        groupId: 'spec-session',
        groupLabel: '场次',
        values: [
          { valueId: 'am', valueLabel: '上午场' },
          { valueId: 'pm', valueLabel: '下午场' },
        ],
      },
    ],
    storeId: 'store-art-house',
    subtitle: '适合零基础的周末陶艺入门体验课',
    summary: '从拉坯到上釉的完整入门流程，适合周末体验和朋友同学。',
  },
  {
    attributes: [
      { label: '材质', value: '棉麻混纺 / 防泼水内衬' },
      { label: '容量', value: '13L' },
      { label: '适用场景', value: '通勤 / 轻出游' },
    ],
    categoryId: 'cat-culture-bag',
    categoryName: '通勤箱包',
    gallery: [mockImageUrl, mockImageUrl, mockImageUrl],
    htmlContent: '<p>湖岸斜挎邮差包采用棉麻混纺外层与防泼水内衬，适合城市通勤和周末轻出游。</p>',
    imageUrl: mockImageUrl,
    inventory: 51,
    isFCode: false,
    isFlashSale: true,
    isGroupBuy: false,
    isOwnShop: true,
    isPresell: false,
    isVirtual: false,
    marketPrice: 299,
    monthlySales: 221,
    price: 249,
    productId: 'prod-lake-messenger-bag',
    productName: '湖岸斜挎邮差包',
    sellingPoints: ['棉麻混纺', '防泼水内衬', '轻通勤版型'],
    serviceLabels: ['支持发票', '7天无理由'],
    skuList: [
      { marketPrice: 299, price: 249, skuId: 'sku-messenger-sand', specText: '砂岩灰', stock: 27 },
      { marketPrice: 299, price: 249, skuId: 'sku-messenger-olive', specText: '橄榄绿', stock: 24 },
    ],
    specs: [
      {
        groupId: 'spec-color',
        groupLabel: '颜色',
        values: [
          { valueId: 'sand', valueLabel: '砂岩灰' },
          { valueId: 'olive', valueLabel: '橄榄绿' },
        ],
      },
    ],
    storeId: 'store-art-house',
    subtitle: '适合城市通勤和周末轻出游的斜挎包',
    summary: '轻通勤版型搭配防泼水内衬，兼顾日常和周末轻出游。',
  },
  {
    attributes: [
      { label: '材质', value: '高硼硅玻璃 / 软木盖' },
      { label: '容量', value: '480ml' },
      { label: '适用场景', value: '办公桌 / 居家饮水' },
    ],
    categoryId: 'cat-home-cup',
    categoryName: '杯具',
    gallery: [mockImageUrl, mockImageUrl],
    htmlContent: '<p>晨光玻璃冷泡壶适合冷泡茶、果饮和日常办公饮水，采用高硼硅玻璃与软木盖组合。</p>',
    imageUrl: mockImageUrl,
    inventory: 73,
    isFCode: false,
    isFlashSale: false,
    isGroupBuy: false,
    isOwnShop: false,
    isPresell: false,
    isVirtual: false,
    marketPrice: 89,
    monthlySales: 258,
    price: 66,
    productId: 'prod-cold-brew-bottle',
    productName: '晨光玻璃冷泡壶',
    sellingPoints: ['高硼硅玻璃', '软木杯盖', '适合冷泡茶'],
    serviceLabels: ['破损包赔'],
    skuList: [
      { marketPrice: 89, price: 66, skuId: 'sku-bottle-clear', specText: '透明款', stock: 41 },
      { marketPrice: 89, price: 66, skuId: 'sku-bottle-smoke', specText: '烟灰款', stock: 32 },
    ],
    specs: [
      {
        groupId: 'spec-color',
        groupLabel: '颜色',
        values: [
          { valueId: 'clear', valueLabel: '透明款' },
          { valueId: 'smoke', valueLabel: '烟灰款' },
        ],
      },
    ],
    storeId: 'store-home-lab',
    subtitle: '适合办公桌和居家饮水的冷泡壶',
    summary: '高硼硅玻璃与软木盖组合，适合冷泡茶和日常办公饮水。',
  },
  {
    attributes: [
      { label: '规格', value: '12 张明信片 + 收纳夹' },
      { label: '工艺', value: '局部烫银 / 厚卡纸' },
      { label: '适用场景', value: '礼赠 / 收藏 / 书桌陈列' },
    ],
    categoryId: 'cat-festival-culture',
    categoryName: '文化伴手礼',
    gallery: [mockImageUrl, mockImageUrl],
    htmlContent: '<p>城景烫银明信片礼盒收录 12 张城市主题画面，适合收藏和节庆送礼。</p>',
    imageUrl: mockImageUrl,
    inventory: 82,
    isFCode: false,
    isFlashSale: false,
    isGroupBuy: false,
    isOwnShop: true,
    isPresell: false,
    isVirtual: false,
    marketPrice: 79,
    monthlySales: 173,
    price: 58,
    productId: 'prod-postcard-gift-box',
    productName: '城景烫银明信片礼盒',
    sellingPoints: ['局部烫银', '12 张套装', '节庆送礼'],
    serviceLabels: ['支持礼袋', '支持发票'],
    skuList: [
      { marketPrice: 79, price: 58, skuId: 'sku-postcard-standard', specText: '标准礼盒', stock: 82 },
    ],
    specs: [
      {
        groupId: 'spec-package',
        groupLabel: '规格',
        values: [{ valueId: 'standard', valueLabel: '标准礼盒' }],
      },
    ],
    storeId: 'store-art-house',
    subtitle: '适合收藏与送礼的城市主题明信片礼盒',
    summary: '12 张城市主题画面搭配局部烫银工艺，适合收藏与礼赠。',
  },
  {
    attributes: [
      { label: '时长', value: '2 天 1 夜' },
      { label: '内容', value: '路线手册 / 门票建议 / 美食地图' },
      { label: '适用场景', value: '周末轻旅行' },
    ],
    categoryId: 'cat-travel-package',
    categoryName: '城市路线',
    gallery: [mockImageUrl, mockImageUrl],
    htmlContent: '<p>周末城市漫游路线包整合了路线手册、门票建议和美食地图，适合轻旅行规划。</p>',
    imageUrl: mockImageUrl,
    inventory: 999,
    isFCode: false,
    isFlashSale: false,
    isGroupBuy: true,
    isOwnShop: false,
    isPresell: false,
    isVirtual: true,
    marketPrice: 99,
    monthlySales: 289,
    price: 69,
    productId: 'prod-city-route-pack',
    productName: '周末城市漫游路线包',
    sellingPoints: ['2天1夜路线', '美食地图', '轻旅行规划'],
    serviceLabels: ['随时退', '即时发货'],
    skuList: [
      { marketPrice: 99, price: 69, skuId: 'sku-route-east', specText: '东湖线', stock: 999 },
      { marketPrice: 99, price: 69, skuId: 'sku-route-oldtown', specText: '老城线', stock: 999 },
    ],
    specs: [
      {
        groupId: 'spec-route',
        groupLabel: '路线',
        values: [
          { valueId: 'east', valueLabel: '东湖线' },
          { valueId: 'oldtown', valueLabel: '老城线' },
        ],
      },
    ],
    storeId: 'store-home-lab',
    subtitle: '适合周末轻旅行的城市路线规划包',
    summary: '把路线、门票建议和美食地图整合在一起，适合周末轻旅行。',
  },
  {
    attributes: [
      { label: '材质', value: '木柄 / 合成纤维笔头' },
      { label: '课时', value: '120 分钟' },
      { label: '适合人群', value: '零基础体验' },
    ],
    categoryId: 'cat-training-painting',
    categoryName: '绘画课',
    gallery: [mockImageUrl, mockImageUrl],
    htmlContent: '<p>水彩风景入门课适合零基础体验，围绕城市湖岸主题完成一幅作品。</p>',
    imageUrl: mockImageUrl,
    inventory: 48,
    isFCode: false,
    isFlashSale: false,
    isGroupBuy: true,
    isOwnShop: true,
    isPresell: false,
    isVirtual: true,
    marketPrice: 188,
    monthlySales: 119,
    price: 149,
    productId: 'prod-watercolor-class',
    productName: '水彩风景入门课',
    sellingPoints: ['零基础友好', '含工具材料', '主题作品带走'],
    serviceLabels: ['预约制', '可改期'],
    skuList: [
      { marketPrice: 188, price: 149, skuId: 'sku-watercolor-weekday', specText: '工作日场', stock: 20 },
      { marketPrice: 188, price: 149, skuId: 'sku-watercolor-weekend', specText: '周末场', stock: 28 },
    ],
    specs: [
      {
        groupId: 'spec-session',
        groupLabel: '场次',
        values: [
          { valueId: 'weekday', valueLabel: '工作日场' },
          { valueId: 'weekend', valueLabel: '周末场' },
        ],
      },
    ],
    storeId: 'store-art-house',
    subtitle: '适合零基础体验的水彩风景课程',
    summary: '围绕城市湖岸主题完成作品，适合零基础和周末体验。',
  },
  {
    attributes: [
      { label: '材质', value: '再生纸 / 锁线装订' },
      { label: '页数', value: '192 页' },
      { label: '适用场景', value: '阅读 / 收藏 / 桌面陈列' },
    ],
    categoryId: 'cat-book-visual',
    categoryName: '视觉图书',
    gallery: [mockImageUrl, mockImageUrl, mockImageUrl],
    htmlContent: '<p>城市影像画册收录多组城市主题影像和短文，适合阅读、收藏和陈列。</p>',
    imageUrl: mockImageUrl,
    inventory: 57,
    isFCode: false,
    isFlashSale: false,
    isGroupBuy: false,
    isOwnShop: true,
    isPresell: false,
    isVirtual: false,
    marketPrice: 139,
    monthlySales: 94,
    price: 108,
    productId: 'prod-city-photo-book',
    productName: '城市影像画册',
    sellingPoints: ['锁线装订', '主题影像', '适合收藏'],
    serviceLabels: ['支持发票', '满99包邮'],
    skuList: [
      { marketPrice: 139, price: 108, skuId: 'sku-photobook-standard', specText: '标准版', stock: 57 },
    ],
    specs: [
      {
        groupId: 'spec-edition',
        groupLabel: '版本',
        values: [{ valueId: 'standard', valueLabel: '标准版' }],
      },
    ],
    storeId: 'store-art-house',
    subtitle: '适合阅读和收藏的城市主题影像画册',
    summary: '多组城市主题影像与短文编排成册，适合阅读和收藏。',
  },
  {
    attributes: [
      { label: '规格', value: '6 枚 / 盒' },
      { label: '口味', value: '桂花米酿 / 乌梅山楂 / 茉莉青提' },
      { label: '适用场景', value: '下午茶 / 节庆分享' },
    ],
    categoryId: 'cat-festival-gift-box',
    categoryName: '节庆礼盒',
    gallery: [mockImageUrl, mockImageUrl],
    htmlContent: '<p>花果茶点礼盒收录 6 枚花果风味茶点，适合下午茶和节庆分享。</p>',
    imageUrl: mockImageUrl,
    inventory: 67,
    isFCode: false,
    isFlashSale: true,
    isGroupBuy: false,
    isOwnShop: false,
    isPresell: false,
    isVirtual: false,
    marketPrice: 159,
    monthlySales: 205,
    price: 129,
    productId: 'prod-flower-dessert-box',
    productName: '花果茶点礼盒',
    sellingPoints: ['三种花果口味', '下午茶友好', '礼盒包装'],
    serviceLabels: ['支持礼袋', '企业团购'],
    skuList: [
      { marketPrice: 159, price: 129, skuId: 'sku-dessert-standard', specText: '标准礼盒', stock: 67 },
    ],
    specs: [
      {
        groupId: 'spec-package',
        groupLabel: '规格',
        values: [{ valueId: 'standard', valueLabel: '标准礼盒' }],
      },
    ],
    storeId: 'store-food-story',
    subtitle: '适合下午茶和节庆分享的花果茶点礼盒',
    summary: '三种花果风味茶点装盒，适合下午茶与节庆分享。',
  },
  {
    attributes: [
      { label: '材质', value: '陶瓷 / 硅胶防滑底' },
      { label: '容量', value: '350ml' },
      { label: '适用场景', value: '办公桌 / 居家咖啡' },
    ],
    categoryId: 'cat-art-ceramic',
    categoryName: '陶瓷器物',
    gallery: [mockImageUrl, mockImageUrl],
    htmlContent: '<p>弧面拿铁马克杯采用宽耳把和防滑底设计，适合办公桌和居家咖啡场景。</p>',
    imageUrl: mockImageUrl,
    inventory: 89,
    isFCode: false,
    isFlashSale: false,
    isGroupBuy: false,
    isOwnShop: false,
    isPresell: false,
    isVirtual: false,
    marketPrice: 99,
    monthlySales: 241,
    price: 76,
    productId: 'prod-latte-mug',
    productName: '弧面拿铁马克杯',
    sellingPoints: ['宽耳把设计', '硅胶防滑底', '350ml 容量'],
    serviceLabels: ['破损包赔'],
    skuList: [
      { marketPrice: 99, price: 76, skuId: 'sku-mug-cream', specText: '奶油白', stock: 45 },
      { marketPrice: 99, price: 76, skuId: 'sku-mug-green', specText: '鼠尾草绿', stock: 44 },
    ],
    specs: [
      {
        groupId: 'spec-color',
        groupLabel: '颜色',
        values: [
          { valueId: 'cream', valueLabel: '奶油白' },
          { valueId: 'green', valueLabel: '鼠尾草绿' },
        ],
      },
    ],
    storeId: 'store-home-lab',
    subtitle: '适合办公桌和居家咖啡的陶瓷马克杯',
    summary: '宽耳把与防滑底设计结合，适合日常咖啡和办公桌使用。',
  },
  {
    attributes: [
      { label: '香型', value: '雪松 / 白茶 / 柑橘' },
      { label: '燃烧时长', value: '约 36 小时' },
      { label: '适用场景', value: '卧室 / 书房 / 玄关' },
    ],
    categoryId: 'cat-home-lighting',
    categoryName: '灯具',
    gallery: [mockImageUrl, mockImageUrl],
    htmlContent: '<p>暮色香氛蜡烛采用复合植物蜡与玻璃杯体，适合卧室、书房和玄关氛围布置。</p>',
    imageUrl: mockImageUrl,
    inventory: 64,
    isFCode: false,
    isFlashSale: false,
    isGroupBuy: false,
    isOwnShop: false,
    isPresell: false,
    isVirtual: false,
    marketPrice: 119,
    monthlySales: 183,
    price: 89,
    productId: 'prod-aroma-candle',
    productName: '暮色香氛蜡烛',
    sellingPoints: ['复合植物蜡', '玻璃杯体', '家居氛围友好'],
    serviceLabels: ['支持发票'],
    skuList: [
      { marketPrice: 119, price: 89, skuId: 'sku-candle-cedar', specText: '雪松白茶', stock: 34 },
      { marketPrice: 119, price: 89, skuId: 'sku-candle-citrus', specText: '柑橘清晨', stock: 30 },
    ],
    specs: [
      {
        groupId: 'spec-scent',
        groupLabel: '香型',
        values: [
          { valueId: 'cedar', valueLabel: '雪松白茶' },
          { valueId: 'citrus', valueLabel: '柑橘清晨' },
        ],
      },
    ],
    storeId: 'store-home-lab',
    subtitle: '适合卧室和书房氛围布置的香氛蜡烛',
    summary: '复合植物蜡搭配玻璃杯体，适合卧室、书房和玄关布置。',
  },
  {
    attributes: [
      { label: '材质', value: '陶瓷 / 竹制收纳盒' },
      { label: '人数', value: '2 人份' },
      { label: '适用场景', value: '露营 / 办公室分享茶' },
    ],
    categoryId: 'cat-food-tea',
    categoryName: '茶礼',
    gallery: [mockImageUrl, mockImageUrl],
    htmlContent: '<p>旅途便携茶具组整合双杯、茶仓与收纳盒，适合露营、出差和办公室分享茶。</p>',
    imageUrl: mockImageUrl,
    inventory: 39,
    isFCode: false,
    isFlashSale: false,
    isGroupBuy: false,
    isOwnShop: false,
    isPresell: false,
    isVirtual: false,
    marketPrice: 229,
    monthlySales: 127,
    price: 179,
    productId: 'prod-travel-tea-set',
    productName: '旅途便携茶具组',
    sellingPoints: ['双杯随行', '竹盒收纳', '适合分享茶'],
    serviceLabels: ['支持礼袋', '顺丰包邮'],
    skuList: [
      { marketPrice: 229, price: 179, skuId: 'sku-teaset-sand', specText: '砂白款', stock: 21 },
      { marketPrice: 229, price: 179, skuId: 'sku-teaset-ink', specText: '墨灰款', stock: 18 },
    ],
    specs: [
      {
        groupId: 'spec-color',
        groupLabel: '颜色',
        values: [
          { valueId: 'sand', valueLabel: '砂白款' },
          { valueId: 'ink', valueLabel: '墨灰款' },
        ],
      },
    ],
    storeId: 'store-food-story',
    subtitle: '适合露营和办公室分享茶的便携茶具组',
    summary: '双杯、茶仓与收纳盒整合在一起，适合露营、出差和分享茶。',
  },
  {
    attributes: [
      { label: '规格', value: '6 枚 / 盒' },
      { label: '材质', value: '马口铁 + 软磁' },
      { label: '适用场景', value: '冰箱贴 / 办公隔板 / 收藏' },
    ],
    categoryId: 'cat-festival-culture',
    categoryName: '文化伴手礼',
    gallery: [mockImageUrl, mockImageUrl],
    htmlContent: '<p>城市地标磁贴礼盒收录 6 枚地标主题磁贴，适合冰箱陈列和伴手礼收藏。</p>',
    imageUrl: mockImageUrl,
    inventory: 104,
    isFCode: false,
    isFlashSale: false,
    isGroupBuy: false,
    isOwnShop: true,
    isPresell: false,
    isVirtual: false,
    marketPrice: 59,
    monthlySales: 294,
    price: 45,
    productId: 'prod-city-magnet-set',
    productName: '城市地标磁贴礼盒',
    sellingPoints: ['6 枚套装', '地标主题', '伴手礼友好'],
    serviceLabels: ['支持礼袋', '支持发票'],
    skuList: [
      { marketPrice: 59, price: 45, skuId: 'sku-magnet-standard', specText: '标准礼盒', stock: 104 },
    ],
    specs: [
      {
        groupId: 'spec-package',
        groupLabel: '规格',
        values: [{ valueId: 'standard', valueLabel: '标准礼盒' }],
      },
    ],
    storeId: 'store-art-house',
    subtitle: '适合收藏和送礼的城市地标磁贴礼盒',
    summary: '6 枚城市地标主题磁贴装盒，适合伴手礼和桌面陈列。',
  },
  {
    attributes: [
      { label: '材质', value: '高密碰击布' },
      { label: '功能', value: '三折防晒 / 防泼水' },
      { label: '适用场景', value: '通勤 / 突发阵雨' },
    ],
    categoryId: 'cat-culture-bag',
    categoryName: '通勤箱包',
    gallery: [mockImageUrl, mockImageUrl],
    htmlContent: '<p>晴雨轻折防晒伞采用高密碰击布和三折结构，适合通勤随包携带。</p>',
    imageUrl: mockImageUrl,
    inventory: 86,
    isFCode: false,
    isFlashSale: true,
    isGroupBuy: false,
    isOwnShop: true,
    isPresell: false,
    isVirtual: false,
    marketPrice: 79,
    monthlySales: 367,
    price: 59,
    productId: 'prod-folding-umbrella',
    productName: '晴雨轻折防晒伞',
    sellingPoints: ['三折轻便', '防晒防泼水', '适合通勤'],
    serviceLabels: ['7天无理由'],
    skuList: [
      { marketPrice: 79, price: 59, skuId: 'sku-umbrella-cream', specText: '奶油白', stock: 42 },
      { marketPrice: 79, price: 59, skuId: 'sku-umbrella-blue', specText: '湖蓝', stock: 44 },
    ],
    specs: [
      {
        groupId: 'spec-color',
        groupLabel: '颜色',
        values: [
          { valueId: 'cream', valueLabel: '奶油白' },
          { valueId: 'blue', valueLabel: '湖蓝' },
        ],
      },
    ],
    storeId: 'store-art-house',
    subtitle: '适合通勤包里常备的轻折防晒伞',
    summary: '三折轻便结构搭配防晒防泼水面料，适合通勤常备。',
  },
  {
    attributes: [
      { label: '材质', value: '胡桃木 / 静音机芯' },
      { label: '规格', value: '桌面摆放' },
      { label: '适用场景', value: '书桌 / 床头 / 办公室' },
    ],
    categoryId: 'cat-home-lighting',
    categoryName: '灯具',
    gallery: [mockImageUrl, mockImageUrl],
    htmlContent: '<p>胡桃木静音小座钟采用木质外壳和静音机芯，适合书桌、床头和办公室摆放。</p>',
    imageUrl: mockImageUrl,
    inventory: 47,
    isFCode: false,
    isFlashSale: false,
    isGroupBuy: false,
    isOwnShop: false,
    isPresell: false,
    isVirtual: false,
    marketPrice: 149,
    monthlySales: 88,
    price: 118,
    productId: 'prod-wood-desk-clock',
    productName: '胡桃木静音小座钟',
    sellingPoints: ['木质外壳', '静音机芯', '桌面友好'],
    serviceLabels: ['一年质保'],
    skuList: [
      { marketPrice: 149, price: 118, skuId: 'sku-clock-walnut', specText: '胡桃木', stock: 47 },
    ],
    specs: [
      {
        groupId: 'spec-material',
        groupLabel: '材质',
        values: [{ valueId: 'walnut', valueLabel: '胡桃木' }],
      },
    ],
    storeId: 'store-home-lab',
    subtitle: '适合书桌和床头摆放的静音小座钟',
    summary: '胡桃木外壳和静音机芯结合，适合书桌、床头和办公室。',
  },
  {
    attributes: [
      { label: '材质', value: '防泼水帆布' },
      { label: '版型', value: '可调节系带' },
      { label: '适用场景', value: '烘焙 / 手作 / 花艺' },
    ],
    categoryId: 'cat-culture-stationery',
    categoryName: '办公文具',
    gallery: [mockImageUrl, mockImageUrl],
    htmlContent: '<p>手作帆布围裙采用防泼水帆布和前置工具口袋，适合烘焙、手作和花艺场景。</p>',
    imageUrl: mockImageUrl,
    inventory: 58,
    isFCode: false,
    isFlashSale: false,
    isGroupBuy: false,
    isOwnShop: true,
    isPresell: false,
    isVirtual: false,
    marketPrice: 129,
    monthlySales: 96,
    price: 98,
    productId: 'prod-canvas-apron',
    productName: '手作帆布围裙',
    sellingPoints: ['工具口袋', '防泼水帆布', '可调节系带'],
    serviceLabels: ['支持发票'],
    skuList: [
      { marketPrice: 129, price: 98, skuId: 'sku-apron-khaki', specText: '卡其', stock: 31 },
      { marketPrice: 129, price: 98, skuId: 'sku-apron-charcoal', specText: '炭灰', stock: 27 },
    ],
    specs: [
      {
        groupId: 'spec-color',
        groupLabel: '颜色',
        values: [
          { valueId: 'khaki', valueLabel: '卡其' },
          { valueId: 'charcoal', valueLabel: '炭灰' },
        ],
      },
    ],
    storeId: 'store-art-house',
    subtitle: '适合烘焙和手作场景的帆布围裙',
    summary: '前置工具口袋和防泼水帆布结合，适合烘焙、手作和花艺。',
  },
  {
    attributes: [
      { label: '规格', value: '0.38mm 5 支装' },
      { label: '墨色', value: '黑 / 蓝黑 / 灰' },
      { label: '适用场景', value: '会议记录 / 手账 / 精细书写' },
    ],
    categoryId: 'cat-culture-stationery',
    categoryName: '办公文具',
    gallery: [mockImageUrl, mockImageUrl],
    htmlContent: '<p>微针中性笔套装适合精细书写和会议记录，提供 5 支常用色组合。</p>',
    imageUrl: mockImageUrl,
    inventory: 146,
    isFCode: false,
    isFlashSale: false,
    isGroupBuy: false,
    isOwnShop: true,
    isPresell: false,
    isVirtual: false,
    marketPrice: 39,
    monthlySales: 428,
    price: 29,
    productId: 'prod-ink-gel-pen',
    productName: '微针中性笔套装',
    sellingPoints: ['精细书写', '5 支常用色', '会议记录友好'],
    serviceLabels: ['支持发票', '满99包邮'],
    skuList: [
      { marketPrice: 39, price: 29, skuId: 'sku-gel-neutral', specText: '经典组合', stock: 146 },
    ],
    specs: [
      {
        groupId: 'spec-package',
        groupLabel: '组合',
        values: [{ valueId: 'neutral', valueLabel: '经典组合' }],
      },
    ],
    storeId: 'store-art-house',
    subtitle: '适合精细书写和会议记录的中性笔套装',
    summary: '5 支常用色组合，适合会议记录、手账和精细书写。',
  },
  {
    attributes: [
      { label: '规格', value: '12 包 / 盒' },
      { label: '口味', value: '陈皮普洱 / 桂花乌龙 / 玫瑰红茶' },
      { label: '适用场景', value: '办公室冲泡 / 居家茶饮' },
    ],
    categoryId: 'cat-food-tea',
    categoryName: '茶礼',
    gallery: [mockImageUrl, mockImageUrl],
    htmlContent: '<p>草本花茶随手包适合办公室和居家冲泡，收录 3 种常用风味茶饮。</p>',
    imageUrl: mockImageUrl,
    inventory: 112,
    isFCode: false,
    isFlashSale: false,
    isGroupBuy: false,
    isOwnShop: false,
    isPresell: false,
    isVirtual: false,
    marketPrice: 69,
    monthlySales: 261,
    price: 52,
    productId: 'prod-herbal-tea-pack',
    productName: '草本花茶随手包',
    sellingPoints: ['3 种风味', '办公室冲泡友好', '独立小袋装'],
    serviceLabels: ['支持礼袋'],
    skuList: [
      { marketPrice: 69, price: 52, skuId: 'sku-herbal-standard', specText: '标准盒装', stock: 112 },
    ],
    specs: [
      {
        groupId: 'spec-package',
        groupLabel: '规格',
        values: [{ valueId: 'standard', valueLabel: '标准盒装' }],
      },
    ],
    storeId: 'store-food-story',
    subtitle: '适合办公室和居家冲泡的花茶随手包',
    summary: '3 种常用风味茶饮装进独立小袋，适合办公室和居家冲泡。',
  },
  {
    attributes: [
      { label: '材质', value: '原木画框 / 艺术微喷' },
      { label: '尺寸', value: '30cm x 40cm' },
      { label: '适用场景', value: '客厅 / 玄关 / 书桌背景' },
    ],
    categoryId: 'cat-book-visual',
    categoryName: '视觉图书',
    gallery: [mockImageUrl, mockImageUrl],
    htmlContent: '<p>城市晨雾装饰画采用原木画框与艺术微喷画芯，适合玄关、客厅和书桌背景。</p>',
    imageUrl: mockImageUrl,
    inventory: 33,
    isFCode: false,
    isFlashSale: false,
    isGroupBuy: false,
    isOwnShop: true,
    isPresell: false,
    isVirtual: false,
    marketPrice: 169,
    monthlySales: 74,
    price: 136,
    productId: 'prod-art-poster-frame',
    productName: '城市晨雾装饰画',
    sellingPoints: ['原木画框', '艺术微喷', '家居氛围提升'],
    serviceLabels: ['支持发票', '顺丰包邮'],
    skuList: [
      { marketPrice: 169, price: 136, skuId: 'sku-poster-oak', specText: '橡木框', stock: 33 },
    ],
    specs: [
      {
        groupId: 'spec-frame',
        groupLabel: '画框',
        values: [{ valueId: 'oak', valueLabel: '橡木框' }],
      },
    ],
    storeId: 'store-art-house',
    subtitle: '适合玄关和客厅陈列的城市主题装饰画',
    summary: '原木画框搭配城市晨雾主题画芯，适合玄关、客厅和书桌背景。',
  },
  {
    attributes: [
      { label: '材质', value: '厚磅帆布' },
      { label: '容量', value: '8L' },
      { label: '适用场景', value: '午休出门 / 商场逛街 / 随身小包' },
    ],
    categoryId: 'cat-culture-bag',
    categoryName: '通勤箱包',
    gallery: [mockImageUrl, mockImageUrl],
    htmlContent: '<p>轻便午休托特包采用厚磅帆布和短手提设计，适合午休出门和短途随身携带。</p>',
    imageUrl: mockImageUrl,
    inventory: 92,
    isFCode: false,
    isFlashSale: true,
    isGroupBuy: false,
    isOwnShop: true,
    isPresell: false,
    isVirtual: false,
    marketPrice: 99,
    monthlySales: 317,
    price: 72,
    productId: 'prod-mini-tote-bag',
    productName: '轻便午休托特包',
    sellingPoints: ['厚磅帆布', '午休出门友好', '短手提设计'],
    serviceLabels: ['7天无理由', '支持发票'],
    skuList: [
      { marketPrice: 99, price: 72, skuId: 'sku-tote-cream', specText: '奶油白', stock: 46 },
      { marketPrice: 99, price: 72, skuId: 'sku-tote-navy', specText: '海军蓝', stock: 46 },
    ],
    specs: [
      {
        groupId: 'spec-color',
        groupLabel: '颜色',
        values: [
          { valueId: 'cream', valueLabel: '奶油白' },
          { valueId: 'navy', valueLabel: '海军蓝' },
        ],
      },
    ],
    storeId: 'store-art-house',
    subtitle: '适合午休出门和短途随身携带的托特包',
    summary: '厚磅帆布和短手提设计结合，适合午休出门和短途携带。',
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
