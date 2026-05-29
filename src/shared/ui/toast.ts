import { showToast } from 'vant'

interface AppTextToastOptions {
  duration?: number
  forbidClick?: boolean
  wordBreak?: 'break-all' | 'break-word' | 'normal'
}

export function showAppTextToast(message: string, options: AppTextToastOptions = {}) {
  return showToast({
    className: 'app-text-toast',
    duration: options.duration ?? 3000,
    forbidClick: options.forbidClick,
    message,
    type: 'text',
    wordBreak: options.wordBreak ?? 'break-word',
  })
}

export function showAppErrorToast(message: string, options: AppTextToastOptions = {}) {
  return showAppTextToast(message, {
    duration: options.duration ?? 3200,
    forbidClick: options.forbidClick,
    wordBreak: options.wordBreak,
  })
}
