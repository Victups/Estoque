<template>
  <div>
    <Navbar />
    <v-main>
      <router-view />
    </v-main>
    <Footer />
    <UnauthorizedDialog
      v-model="unauthorizedStore.dialog"
      :message="unauthorizedStore.message"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useUnauthorizedStore } from '@/stores/unauthorized'

export default defineComponent({
  name: 'DefaultLayout',
  setup () {
    const unauthorizedStore = useUnauthorizedStore()
    return {
      unauthorizedStore,
    }
  },
})
</script>
