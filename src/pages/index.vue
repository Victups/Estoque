<template>
  <div>
    <Home />
  </div>
</template>

<script lang="ts">
  import Home from './Home.vue'

  export default {
    name: 'IndexPage',
    components: {
      Home,
    },
  }
</script>

<route lang="yaml">
meta:
  layout: default
</route>
