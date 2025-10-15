<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue'
  import { useAuthStore } from './stores/auth'

  // Carregar dados de autenticação ao iniciar o app
  const auth = useAuthStore()
  onMounted(() => {
    auth.loadFromStorage()
  })
</script>
