import type { RouteRecordRaw } from 'vue-router'

import { AboutPage } from '@/pages/about'
import { HomePage } from '@/pages/home'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: {
      title: '架构首页',
      description: 'FSD + DDD 项目骨架与商品目录示例',
    },
  },
  {
    path: '/about',
    name: 'about',
    component: AboutPage,
    meta: {
      title: '架构说明',
      description: '职责边界、依赖方向与迁移约束',
    },
  },
]
