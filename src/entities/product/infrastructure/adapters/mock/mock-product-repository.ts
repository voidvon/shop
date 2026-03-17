import type { ProductRepository } from '../../../domain/product-repository'
import type { ProductDetail, ProductSummary } from '../../../domain/product'

const canvasBagSummary: ProductSummary = {
  id: 'sku-canvas-bag',
  name: '轻旅帆布通勤包',
  category: '箱包',
  summary: '适合城市通勤和周末出行的耐磨帆布包，内置笔记本分区。',
  price: 329,
  inventory: 42,
  monthlySales: 418,
  tags: ['通勤', '轻量', '耐磨'],
  coverImageUrl: null,
}

const ceramicCupSummary: ProductSummary = {
  id: 'sku-ceramic-cup',
  name: '手冲陶瓷分享杯',
  category: '家居',
  summary: '杯壁厚薄控制稳定，适合精品咖啡和茶饮场景。',
  price: 89,
  inventory: 120,
  monthlySales: 356,
  tags: ['手作', '咖啡', '家居'],
  coverImageUrl: null,
}

const linenShirtSummary: ProductSummary = {
  id: 'sku-linen-shirt',
  name: '亚麻立领衬衫',
  category: '服饰',
  summary: '适合春夏场景的轻薄亚麻衬衫，强调透气和版型平衡。',
  price: 269,
  inventory: 58,
  monthlySales: 332,
  tags: ['春夏', '透气', '基础款'],
  coverImageUrl: null,
}

const deskLampSummary: ProductSummary = {
  id: 'sku-desk-lamp',
  name: '折幕工作台灯',
  category: '家居',
  summary: '暖白双色调光，适合桌面办公与夜间阅读。',
  price: 219,
  inventory: 15,
  monthlySales: 280,
  tags: ['办公', '阅读', '氛围'],
  coverImageUrl: null,
}

const featuredProducts: ProductSummary[] = [
  canvasBagSummary,
  ceramicCupSummary,
  linenShirtSummary,
  deskLampSummary,
]

const productDetailsById: Record<string, ProductDetail> = {
  'sku-canvas-bag': {
    ...canvasBagSummary,
    detailDescription:
      '采用耐磨帆布和多分区结构，兼顾城市通勤与短途出行，适合 14 寸笔记本与随身文件整理。',
    gallery: [],
    sellingPoints: ['14 寸笔记本分区', '外层快取口袋', '帆布耐磨面料'],
    attributes: [
      { label: '材质', value: '高密度帆布' },
      { label: '容量', value: '18L' },
      { label: '适用场景', value: '通勤 / 周末出行' },
    ],
    serviceLabels: ['支持发票', '7天无理由'],
  },
  'sku-ceramic-cup': {
    ...ceramicCupSummary,
    detailDescription:
      '强调杯壁厚薄控制和分享感的手冲器具，适合精品咖啡、花茶和小型会客场景。',
    gallery: [],
    sellingPoints: ['杯壁厚薄均匀', '适合精品咖啡', '分享双杯场景'],
    attributes: [
      { label: '材质', value: '高温陶瓷' },
      { label: '容量', value: '220ml' },
      { label: '适用饮品', value: '咖啡 / 茶饮' },
    ],
    serviceLabels: ['破损包赔'],
  },
  'sku-linen-shirt': {
    ...linenShirtSummary,
    detailDescription:
      '围绕春夏通勤和轻度出游设计的亚麻衬衫，追求透气、轻量和不失体面的版型平衡。',
    gallery: [],
    sellingPoints: ['春夏透气', '立领版型', '通勤友好'],
    attributes: [
      { label: '材质', value: '55% 亚麻 / 45% 棉' },
      { label: '版型', value: '标准版' },
      { label: '季节', value: '春 / 夏' },
    ],
    serviceLabels: ['支持换码'],
  },
  'sku-desk-lamp': {
    ...deskLampSummary,
    detailDescription:
      '可折叠灯幕结构和双色调光设计，适合桌面办公、夜间阅读和柔和氛围补光。',
    gallery: [],
    sellingPoints: ['双色调光', '折幕结构', '桌面办公适配'],
    attributes: [
      { label: '色温', value: '3000K - 5000K' },
      { label: '供电', value: 'USB-C' },
      { label: '适用场景', value: '办公 / 阅读 / 夜灯' },
    ],
    serviceLabels: ['一年质保'],
  },
}

export const mockProductRepository: ProductRepository = {
  async getFeaturedProductSummaries() {
    return Promise.resolve(
      featuredProducts.map((product) => ({
        ...product,
        tags: [...product.tags],
      })),
    )
  },
  async getProductDetail(productId) {
    const product = productDetailsById[productId]

    if (!product) {
      return Promise.resolve(null)
    }

    return Promise.resolve({
      ...product,
      attributes: product.attributes.map((attribute) => ({ ...attribute })),
      gallery: [...product.gallery],
      sellingPoints: [...product.sellingPoints],
      serviceLabels: [...product.serviceLabels],
      tags: [...product.tags],
    })
  },
}
