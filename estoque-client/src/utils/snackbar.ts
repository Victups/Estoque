export type SnackbarColor = 'success' | 'error' | 'warning' | 'info'

export interface SnackbarOptions {
  text: string
  color?: SnackbarColor
  timeout?: number
}

/**
 * Mixin para gerenciar snackbar/notificações
 */
export const snackbarMixin = {
  data () {
    return {
      snackbar: false,
      snackbarText: '',
      snackbarColor: 'success' as SnackbarColor,
      snackbarTimeout: 4000,
    }
  },
  methods: {
    showSnackbar (options: SnackbarOptions | string): void {
      if (typeof options === 'string') {
        (this as any).snackbarText = options
        ;(this as any).snackbarColor = 'success'
        ;(this as any).snackbarTimeout = 4000
      } else {
        ;(this as any).snackbarText = options.text
        ;(this as any).snackbarColor = options.color ?? 'success'
        ;(this as any).snackbarTimeout = options.timeout ?? 4000
      }
      ;(this as any).snackbar = true
    },

    showSuccess (text: string, timeout = 4000): void {
      this.showSnackbar({ text, color: 'success', timeout })
    },

    showError (text: string, timeout = 4000): void {
      this.showSnackbar({ text, color: 'error', timeout })
    },

    showWarning (text: string, timeout = 4000): void {
      this.showSnackbar({ text, color: 'warning', timeout })
    },

    showInfo (text: string, timeout = 4000): void {
      this.showSnackbar({ text, color: 'info', timeout })
    },

    hide (): void {
      ;(this as any).snackbar = false
    },
  },
}
