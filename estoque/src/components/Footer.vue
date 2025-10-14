<template>
  <v-footer app class="footer-container">
    <v-container>
      <v-row align="center" justify="center">
        <v-col class="text-center" cols="12">
          <div class="d-flex align-center justify-center">
            <v-icon class="mr-2" color="primary" size="20">mdi-package-variant</v-icon>
            <span class="text-body-2 text-medium-emphasis">
              Sistema de Estoque by <span class="font-weight-bold text-primary">Norven</span>
            </span>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup lang="ts">
</script>

<style scoped>
.footer-container.dark {
  border-top-color: #B39DDB;
  background: linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%);
}
</style>
