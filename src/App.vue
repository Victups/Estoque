<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script lang="ts">
  import { defineComponent, onMounted } from 'vue'

  import { useAuthStore } from './stores/auth'

  export default defineComponent({
    name: 'App',
    setup () {
      const auth = useAuthStore()
      
      onMounted(() => {
        auth.loadFromStorage()
      })

      return {}
    },
  })
</script>

