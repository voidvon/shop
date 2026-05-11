import { computed, readonly, ref, type ComputedRef, type Ref } from 'vue'

const themeRegistry = {
  ocean: {
    className: 'theme-ocean',
    label: 'Ocean',
  },
  warm: {
    className: 'theme-warm',
    label: 'Warm',
  },
} as const

const themeStorageKey = 'shop.theme'

export type ThemeName = keyof typeof themeRegistry

export interface ThemeRuntime {
  availableThemes: readonly ThemeName[]
  currentTheme: Readonly<Ref<ThemeName>>
  currentThemeClass: ComputedRef<string>
  getThemeClass(theme?: ThemeName): string
  setTheme(theme: ThemeName): void
}

export const availableThemes = Object.keys(themeRegistry) as ThemeName[]

const defaultTheme: ThemeName = 'warm'
const themeClassNames = availableThemes.map((theme) => themeRegistry[theme].className)

function isThemeName(value: string): value is ThemeName {
  return value in themeRegistry
}

function resolveThemeName(value: string | null | undefined): ThemeName {
  if (!value) {
    return defaultTheme
  }

  return isThemeName(value) ? value : defaultTheme
}

function readStoredTheme() {
  if (typeof window === 'undefined') {
    return defaultTheme
  }

  try {
    return resolveThemeName(window.localStorage.getItem(themeStorageKey))
  } catch {
    return defaultTheme
  }
}

function persistTheme(theme: ThemeName) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(themeStorageKey, theme)
  } catch {
    // Ignore storage failures so theme switching still works in memory.
  }
}

function syncThemeRoot(theme: ThemeName) {
  if (typeof document === 'undefined') {
    return
  }

  // Mirror the theme on html so teleported Vant popups use the same variables.
  const rootElement = document.documentElement
  rootElement.classList.remove(...themeClassNames)
  rootElement.classList.add(themeRegistry[theme].className)
  rootElement.dataset.theme = theme
}

export function createThemeRuntime(): ThemeRuntime {
  const currentTheme = ref<ThemeName>(readStoredTheme())
  const currentThemeClass = computed(() => themeRegistry[currentTheme.value].className)

  function setTheme(theme: ThemeName) {
    currentTheme.value = theme
    syncThemeRoot(theme)
    persistTheme(theme)
  }

  syncThemeRoot(currentTheme.value)
  persistTheme(currentTheme.value)

  return {
    availableThemes,
    currentTheme: readonly(currentTheme),
    currentThemeClass,
    getThemeClass(theme = currentTheme.value) {
      return themeRegistry[theme].className
    },
    setTheme,
  }
}
