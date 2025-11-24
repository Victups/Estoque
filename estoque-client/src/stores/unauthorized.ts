import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUnauthorizedStore = defineStore('unauthorized', () => {
  const dialog = ref(false)
  const message = ref('')

  function show (customMessage?: string) {
    message.value = customMessage || 'Você não tem autorização para acessar esta funcionalidade. Entre em contato com um administrador do sistema para solicitar as permissões necessárias.'
    dialog.value = true
  }

  function hide () {
    dialog.value = false
    message.value = ''
  }

  return {
    dialog,
    message,
    show,
    hide,
  }
})

