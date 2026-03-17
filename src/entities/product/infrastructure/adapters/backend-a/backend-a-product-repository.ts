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
