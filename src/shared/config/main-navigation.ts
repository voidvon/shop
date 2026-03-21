export type MainNavigationKey = 'home' | 'category' | 'cart' | 'member'

export interface MainNavigationItem {
  icon: string
  key: MainNavigationKey
  label: string
  to: string
}

export interface TopBarMenuItem {
  color?: string
  disabled?: boolean
  icon?: string
  key: string
  label: string
  to?: string
}

export const mainNavigationItems: MainNavigationItem[] = [
  { key: 'home', label: '首页', to: '/', icon: 'home-o' },
  { key: 'category', label: '分类', to: '/category', icon: 'apps-o' },
  { key: 'cart', label: '购物车', to: '/cart', icon: 'shopping-cart-o' },
  { key: 'member', label: '我的', to: '/member', icon: 'contact-o' },
]

export function createMainNavigationMenuItems(): TopBarMenuItem[] {
  return mainNavigationItems.map(({ icon, key, label, to }) => ({
    icon,
    key,
    label,
    to,
  }))
}
