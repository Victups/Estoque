<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import { useAuthStore } from './stores/auth'

  export default defineComponent({
    name: 'App',
    mounted () {
      const auth = useAuthStore()
      auth.loadFromStorage()
    },
  })
</script>
