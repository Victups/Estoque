<script setup lang="ts">
  import { computed } from 'vue'
  import { useAuthStore } from '../stores/auth'

  const auth = useAuthStore()

  const greeting = computed(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  })

  const displayName = computed(() => auth.displayName || 'Usuário')
  const ufText = computed(() => auth.ufLabel ?? 'UF não definida')

  const tips = [
    'Acompanhe produtos com validade próxima na página Produtos.',
    'Use o filtro por nome para encontrar itens rapidamente.',
    'Verifique o estoque mínimo para evitar rupturas.',
  ]
</script>

<template>
  <v-container class="py-8" fluid>
    <v-row>
      <v-col cols="12">
        <v-card class="rounded-lg" elevation="1">
          <v-card-text class="pa-8">
            <div class="d-flex align-center justify-space-between">
              <div>
                <h2 class="text-h4 font-weight-bold mb-1">
                  {{ greeting }}, {{ displayName }}!
                </h2>
                <p class="text-medium-emphasis">
                  Bem-vindo ao sistema de estoque — sessão atual: {{ ufText }}
                </p>
              </div>
              <v-avatar color="primary" size="64">
                <v-icon color="white" size="36">mdi-warehouse</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-6" dense>
      <v-col cols="12" md="4">
        <v-card class="rounded-lg" elevation="1">
          <v-list density="compact">
            <v-list-subheader>Dicas rápidas</v-list-subheader>
            <v-list-item v-for="(tip, idx) in tips" :key="idx">
              <template #prepend>
                <v-icon color="primary">mdi-lightbulb-on</v-icon>
              </template>
              <v-list-item-title>{{ tip }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="8">
        <v-card class="rounded-lg" elevation="1">
          <v-card-title class="pb-0">Atalhos</v-card-title>
          <v-card-text>
            <div class="d-flex flex-wrap ga-3">
              <RouterLink to="/produtos">
                <v-btn color="primary" prepend-icon="mdi-package-variant" variant="tonal">
                  Produtos
                </v-btn>
              </RouterLink>
              <RouterLink to="/movimentacao">
                <v-btn color="primary" prepend-icon="mdi-swap-horizontal" variant="tonal">
                  Movimentação
                </v-btn>
              </RouterLink>
              <RouterLink to="/perfil">
                <v-btn color="primary" prepend-icon="mdi-account" variant="tonal">
                  Perfil
                </v-btn>
              </RouterLink>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<route lang="yaml">
meta:
  layout: default
</route>

<style scoped>

</style>
