import { ref } from 'vue'

import { usePageContentGateway, type HomePageData } from '@/shared/page-content'

const emptyHomePageData: HomePageData = {
  banners: [],
  featuredProducts: [],
  quickCategories: [],
}

export function useHomePageModel() {
  const gateway = usePageContentGateway()

  const homePageData = ref<HomePageData>(emptyHomePageData)
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)

  async function loadHomePage() {
    isLoading.value = true
    errorMessage.value = null

    try {
      homePageData.value = await gateway.getHomePageData()
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '首页数据加载失败'
    } finally {
      isLoading.value = false
    }
  }

  return {
    errorMessage,
    homePageData,
    isLoading,
    loadHomePage,
  }
}
