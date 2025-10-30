<template>
  <v-footer app class="footer-container">
    <v-container>
      <v-row align="center" justify="center">
        <v-col class="text-center" cols="12">
          <div class="d-flex align-center justify-center">
            <!-- Ícone de Copyright -->
            <v-icon class="mr-2" color="grey-darken-2" size="20">mdi-copyright</v-icon>

            <!-- Texto com ano dinâmico -->
            <span class="text-body-2" style="color: #3a3a3a;">
              {{ currentYear }} - Sistema de Estoque by
              <span class="font-weight-bold" style="color: #3a3a3a;">Norven</span>
            </span>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'

  export default defineComponent({
    name: 'Footer',
    data () {
      return {
        currentYear: new Date().getFullYear(),
      }
    },
  })
</script>

<style scoped>
.footer-container.dark {
  border-top-color: #0f0e0e;
  background: linear-gradient(135deg, #5f5d5d 0%, #2A2A2A 100%);
}
</style>
