import type { ProductRepository } from '../../../domain/product-repository'
import type { BackendAProductDetailDto } from '../../dto/backend-a-product.dto'
import {
  mapBackendAProductDetailDto,
  mapBackendAProductSummaryDto,
} from '../../mappers/product-dto-mapper'

const backendAProducts: BackendAProductDetailDto[] = [
  {
    sku: 'backend-a-trail-jacket',
    title: '城市机能风旅途夹克',
    groupName: '服饰',
    blurb: '防泼水面料与轻量收纳结构结合，适合差旅与通勤切换。',
    detailCopy:
      '使用轻量防泼水面料和可折叠收纳结构，适合城市通勤、差旅转场和轻户外场景。',
    salePrice: 459,
    stockQty: 36,
    sales30d: 502,
    badges: ['机能', '差旅', '防泼水'],
    coverImage: 'https://images.example.com/backend-a/trail-jacket-cover.jpg',
    galleryImages: [
      'https://images.example.com/backend-a/trail-jacket-cover.jpg',
      'https://images.example.com/backend-a/trail-jacket-side.jpg',
    ],
    highlights: ['可收纳帽兜', '轻量防泼水', '城市通勤剪裁'],
    serviceTags: ['7天无理由', '门店自提', '运费险'],
    specs: [
      { label: '面料', value: '88% 尼龙 / 12% 氨纶' },
      { label: '版型', value: '常规偏宽松' },
      { label: '适用场景', value: '通勤 / 差旅 / 周末出行' },
    ],
    isListed: true,
  },
  {
    sku: 'backend-a-espresso-kit',
    title: '便携浓缩咖啡套组',
    groupName: '家居',
    blurb: '收纳盒、分享杯与旅行手冲配件一体，适合露营和办公桌。',
    detailCopy:
      '围绕便携咖啡场景设计的套组，适合露营、办公桌和临时会客空间快速布置。',
    salePrice: 199,
    stockQty: 64,
    sales30d: 388,
    badges: ['露营', '咖啡', '便携'],
    coverImage: 'https://images.example.com/backend-a/espresso-kit-cover.jpg',
    galleryImages: [
      'https://images.example.com/backend-a/espresso-kit-cover.jpg',
      'https://images.example.com/backend-a/espresso-kit-open.jpg',
    ],
    highlights: ['套组一体收纳', '分享杯双只装', '露营和办公通用'],
    serviceTags: ['次日达', '破损包赔'],
    specs: [
      { label: '套装内容', value: '收纳盒 / 分享杯 / 滤杯 / 手冲配件' },
      { label: '材质', value: 'ABS / 陶瓷 / 不锈钢' },
      { label: '适用人数', value: '1-2 人' },
    ],
    isListed: true,
  },
  {
    sku: 'backend-a-speaker',
    title: '织面桌面蓝牙音箱',
    groupName: '数码',
    blurb: '偏暖音色与木纹织面设计，适合桌面工作和居家氛围。',
    detailCopy:
      '针对桌面环境优化的人声和轻音乐表现，搭配织面与木纹外观，适合工作和家居氛围。',
    salePrice: 379,
    stockQty: 22,
    sales30d: 341,
    badges: ['桌面', '蓝牙', '氛围'],
    coverImage: 'https://images.example.com/backend-a/speaker-cover.jpg',
    galleryImages: [
      'https://images.example.com/backend-a/speaker-cover.jpg',
      'https://images.example.com/backend-a/speaker-back.jpg',
    ],
    highlights: ['偏暖调音', '织面木纹外观', '蓝牙即连'],
    serviceTags: ['一年质保', '支持发票'],
    specs: [
      { label: '连接方式', value: '蓝牙 5.3 / AUX' },
      { label: '续航', value: '10 小时' },
      { label: '适用空间', value: '桌面 / 卧室 / 小客厅' },
    ],
    isListed: true,
  },
  {
    sku: 'backend-a-notebook-set',
    title: '城市纹理笔记本套装',
    groupName: '文具',
    blurb: '压纹封面与双本组合设计，适合会议记录和通勤手写。',
    detailCopy:
      '采用压纹纸封与平摊装订，适合会议纪要、灵感记录和日常通勤随写。',
    salePrice: 59,
    stockQty: 94,
    sales30d: 276,
    badges: ['纸品', '会议', '套装'],
    coverImage: 'https://images.example.com/backend-a/notebook-set-cover.jpg',
    galleryImages: [
      'https://images.example.com/backend-a/notebook-set-cover.jpg',
      'https://images.example.com/backend-a/notebook-set-inner.jpg',
    ],
    highlights: ['双本组合', '平摊装订', '压纹封面'],
    serviceTags: ['支持发票', '满额包邮'],
    specs: [
      { label: '规格', value: 'A5 / 双本装' },
      { label: '纸张', value: '100g 米白纸' },
      { label: '适用场景', value: '会议记录 / 日常手账' },
    ],
    isListed: true,
  },
  {
    sku: 'backend-a-silk-scarf',
    title: '湖岸印象真丝方巾',
    groupName: '配饰',
    blurb: '以湖岸线条为图案灵感，适合节日送礼和通勤穿搭。',
    detailCopy:
      '真丝斜纹材质搭配城市湖岸图案，适合轻通勤造型和节日礼赠场景。',
    salePrice: 219,
    stockQty: 28,
    sales30d: 162,
    badges: ['真丝', '礼赠', '通勤'],
    coverImage: 'https://images.example.com/backend-a/silk-scarf-cover.jpg',
    galleryImages: [
      'https://images.example.com/backend-a/silk-scarf-cover.jpg',
      'https://images.example.com/backend-a/silk-scarf-detail.jpg',
    ],
    highlights: ['城市图案', '真丝斜纹', '礼盒包装'],
    serviceTags: ['顺丰包邮', '支持礼袋'],
    specs: [
      { label: '尺寸', value: '88cm x 88cm' },
      { label: '材质', value: '16 姆米真丝斜纹' },
      { label: '适用场景', value: '通勤 / 节日送礼' },
    ],
    isListed: true,
  },
  {
    sku: 'backend-a-exhibition-pass',
    title: '城市光影展双人票',
    groupName: '票券',
    blurb: '支持线上预约与现场验码，适合周末同游和轻出行。',
    detailCopy:
      '面向周末出游和朋友同逛场景的双人票产品，支持线上预约与现场扫码核销。',
    salePrice: 128,
    stockQty: 999,
    sales30d: 641,
    badges: ['双人票', '周末', '体验'],
    coverImage: 'https://images.example.com/backend-a/exhibition-pass-cover.jpg',
    galleryImages: [
      'https://images.example.com/backend-a/exhibition-pass-cover.jpg',
      'https://images.example.com/backend-a/exhibition-pass-scene.jpg',
    ],
    highlights: ['双人同游', '线上预约', '现场验码'],
    serviceTags: ['极速出票', '随时退'],
    specs: [
      { label: '票种', value: '双人通票' },
      { label: '有效期', value: '下单后 30 天内' },
      { label: '核销方式', value: '线上预约 / 现场验码' },
    ],
    isListed: true,
  },
  {
    sku: 'backend-a-snack-box',
    title: '江城风味零食礼盒',
    groupName: '食品',
    blurb: '三种地方风味组合，适合办公室分享和节庆伴手礼。',
    detailCopy:
      '把地方风味零食组合进一盒，适合办公室分享、节庆伴手礼和团购场景。',
    salePrice: 99,
    stockQty: 86,
    sales30d: 434,
    badges: ['零食', '礼盒', '分享'],
    coverImage: 'https://images.example.com/backend-a/snack-box-cover.jpg',
    galleryImages: [
      'https://images.example.com/backend-a/snack-box-cover.jpg',
      'https://images.example.com/backend-a/snack-box-open.jpg',
    ],
    highlights: ['三种风味', '办公室分享', '节庆伴手礼'],
    serviceTags: ['企业采购', '支持礼袋'],
    specs: [
      { label: '规格', value: '10 袋 / 盒' },
      { label: '口味', value: '椒香藕片 / 糯米锅巴 / 桂花山楂' },
      { label: '适用场景', value: '分享 / 伴手礼' },
    ],
    isListed: true,
  },
  {
    sku: 'backend-a-hidden-sku',
    title: '未上架测试商品',
    groupName: '隐藏',
    blurb: '用于演示 adapter 在进入领域层前裁剪不可售数据。',
    detailCopy: '内部测试用，不应透出到前端领域层。',
    salePrice: 1,
    stockQty: 999,
    sales30d: 1,
    badges: ['internal'],
    coverImage: null,
    galleryImages: [],
    highlights: ['internal'],
    serviceTags: [],
    specs: [{ label: '状态', value: '未上架' }],
    isListed: false,
  },
]

export const backendAProductRepository: ProductRepository = {
  async getFeaturedProductSummaries() {
    return Promise.resolve(
      backendAProducts.filter((product) => product.isListed).map(mapBackendAProductSummaryDto),
    )
  },
  async getProductDetail(productId) {
    const product = backendAProducts.find(
      (candidate) => candidate.sku === productId && candidate.isListed,
    )

    return Promise.resolve(product ? mapBackendAProductDetailDto(product) : null)
  },
}
