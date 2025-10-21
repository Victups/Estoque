import { ref } from 'vue'

export type SnackbarColor = 'success' | 'error' | 'warning' | 'info'

export interface SnackbarOptions {
  text: string
  color?: SnackbarColor
  timeout?: number
}

/**
 * Composable para gerenciar snackbar/notificações
 */
export function useSnackbar () {
  const snackbar = ref<boolean>(false)
  const snackbarText = ref<string>('')
  const snackbarColor = ref<SnackbarColor>('success')
  const snackbarTimeout = ref<number>(4000)

  function showSnackbar (options: SnackbarOptions | string): void {
    if (typeof options === 'string') {
      snackbarText.value = options
      snackbarColor.value = 'success'
      snackbarTimeout.value = 4000
    } else {
      snackbarText.value = options.text
      snackbarColor.value = options.color ?? 'success'
      snackbarTimeout.value = options.timeout ?? 4000
    }
    snackbar.value = true
  }

  function showSuccess (text: string, timeout = 4000): void {
    showSnackbar({ text, color: 'success', timeout })
  }

  function showError (text: string, timeout = 4000): void {
    showSnackbar({ text, color: 'error', timeout })
  }

  function showWarning (text: string, timeout = 4000): void {
    showSnackbar({ text, color: 'warning', timeout })
  }

  function showInfo (text: string, timeout = 4000): void {
    showSnackbar({ text, color: 'info', timeout })
  }

  function hide (): void {
    snackbar.value = false
  }

  return {
    snackbar,
    snackbarText,
    snackbarColor,
    snackbarTimeout,
    showSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hide,
  }
}
