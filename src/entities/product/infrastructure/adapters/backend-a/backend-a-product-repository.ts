import type { ProductRepository } from '../../../domain/product-repository'
import type { BackendAProductDto } from '../../dto/backend-a-product.dto'
import { mapBackendAProductDto } from '../../mappers/product-dto-mapper'

const backendAFeaturedProducts: BackendAProductDto[] = [
  {
    sku: 'backend-a-trail-jacket',
    title: '城市机能风旅途夹克',
    groupName: '服饰',
    blurb: '防泼水面料与轻量收纳结构结合，适合差旅与通勤切换。',
    salePrice: 459,
    stockQty: 36,
    sales30d: 502,
    badges: ['机能', '差旅', '防泼水'],
    isListed: true,
  },
  {
    sku: 'backend-a-espresso-kit',
    title: '便携浓缩咖啡套组',
    groupName: '家居',
    blurb: '收纳盒、分享杯与旅行手冲配件一体，适合露营和办公桌。',
    salePrice: 199,
    stockQty: 64,
    sales30d: 388,
    badges: ['露营', '咖啡', '便携'],
    isListed: true,
  },
  {
    sku: 'backend-a-speaker',
    title: '织面桌面蓝牙音箱',
    groupName: '数码',
    blurb: '偏暖音色与木纹织面设计，适合桌面工作和居家氛围。',
    salePrice: 379,
    stockQty: 22,
    sales30d: 341,
    badges: ['桌面', '蓝牙', '氛围'],
    isListed: true,
  },
  {
    sku: 'backend-a-hidden-sku',
    title: '未上架测试商品',
    groupName: '隐藏',
    blurb: '用于演示 adapter 在进入领域层前裁剪不可售数据。',
    salePrice: 1,
    stockQty: 999,
    sales30d: 1,
    badges: ['internal'],
    isListed: false,
  },
]

export const backendAProductRepository: ProductRepository = {
  async getFeaturedProducts() {
    return Promise.resolve(
      backendAFeaturedProducts.filter((product) => product.isListed).map(mapBackendAProductDto),
    )
  },
}
