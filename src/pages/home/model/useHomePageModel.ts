import { ref } from 'vue'

import { useStorefrontQuery, type HomePageData } from '@/processes/storefront'

const emptyHomePageData: HomePageData = {
  banners: [],
  featuredProducts: [],
  quickCategories: [],
}

export function useHomePageModel() {
  const storefrontQuery = useStorefrontQuery()

  const homePageData = ref<HomePageData>(emptyHomePageData)
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)

  async function loadHomePage() {
    isLoading.value = true
    errorMessage.value = null

    try {
      homePageData.value = await storefrontQuery.getHomePageData()
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
