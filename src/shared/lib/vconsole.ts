declare global {
  interface Window {
    __shopVConsole__?: object
    __shopVConsoleLoading__?: Promise<object | null>
  }
}

export async function enableVConsole() {
  if (typeof window === 'undefined') {
    return null
  }

  if (window.__shopVConsole__) {
    return window.__shopVConsole__
  }

  if (window.__shopVConsoleLoading__) {
    return window.__shopVConsoleLoading__
  }

  window.__shopVConsoleLoading__ = import('vconsole')
    .then(({ default: VConsole }) => {
      const instance = new VConsole()
      window.__shopVConsole__ = instance
      return instance
    })
    .finally(() => {
      window.__shopVConsoleLoading__ = undefined
    })

  return window.__shopVConsoleLoading__
}
