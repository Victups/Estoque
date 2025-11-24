import { useUnauthorizedStore } from '@/stores/unauthorized'

export function useUnauthorized () {
  const store = useUnauthorizedStore()

  const showUnauthorized = (message?: string) => {
    store.show(message)
  }

  const hideUnauthorized = () => {
    store.hide()
  }

  return {
    unauthorizedDialog: store.dialog,
    unauthorizedMessage: store.message,
    showUnauthorized,
    hideUnauthorized,
  }
}

