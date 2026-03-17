import type { ProductRepository } from '../../../domain/product-repository'

const featuredProducts = [
  {
    id: 'sku-canvas-bag',
    name: '轻旅帆布通勤包',
    category: '箱包',
    description: '适合城市通勤和周末出行的耐磨帆布包，内置笔记本分区。',
    price: 329,
    inventory: 42,
    monthlySales: 418,
    tags: ['通勤', '轻量', '耐磨'],
  },
  {
    id: 'sku-ceramic-cup',
    name: '手冲陶瓷分享杯',
    category: '家居',
    description: '杯壁厚薄控制稳定，适合精品咖啡和茶饮场景。',
    price: 89,
    inventory: 120,
    monthlySales: 356,
    tags: ['手作', '咖啡', '家居'],
  },
  {
    id: 'sku-linen-shirt',
    name: '亚麻立领衬衫',
    category: '服饰',
    description: '适合春夏场景的轻薄亚麻衬衫，强调透气和版型平衡。',
    price: 269,
    inventory: 58,
    monthlySales: 332,
    tags: ['春夏', '透气', '基础款'],
  },
  {
    id: 'sku-desk-lamp',
    name: '折幕工作台灯',
    category: '家居',
    description: '暖白双色调光，适合桌面办公与夜间阅读。',
    price: 219,
    inventory: 15,
    monthlySales: 280,
    tags: ['办公', '阅读', '氛围'],
  },
] as const

export const mockProductRepository: ProductRepository = {
  async getFeaturedProducts() {
    return Promise.resolve(featuredProducts.map((product) => ({ ...product, tags: [...product.tags] })))
  },
}
