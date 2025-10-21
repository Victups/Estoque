<template>
  <div class="location-hierarchy">
    <!-- Formato Compacto -->
    <v-tooltip v-if="compact" max-width="350">
      <template #activator="{ props }">
        <div v-bind="props" class="location-compact">
          <v-chip class="mr-1" color="primary" size="x-small">
            {{ location.uf_sigla }}
          </v-chip>
          <span class="font-weight-medium">{{ location.deposito_nome }}</span>
          <div class="text-caption">
            {{ location.corredor }}-{{ location.prateleira }}-{{ location.secao }}
          </div>
        </div>
      </template>

      <!-- Tooltip com hierarquia completa -->
      <div class="pa-2">
        <div><strong>UF:</strong> {{ location.uf_nome }} ({{ location.uf_sigla }})</div>
        <div><strong>Município:</strong> {{ location.municipio_nome }}</div>
        <div><strong>Bairro:</strong> {{ location.municipio_bairro }}</div>
        <div class="mt-2"><strong>Depósito:</strong> {{ location.deposito_nome }}</div>
        <div><strong>Endereço:</strong> {{ location.endereco_completo }}</div>
        <div><strong>CEP:</strong> {{ location.endereco_cep }}</div>
        <div class="mt-2"><strong>Posição:</strong> {{ location.corredor }}-{{ location.prateleira }}-{{ location.secao }}</div>
      </div>
    </v-tooltip>

    <!-- Formato Completo -->
    <v-card v-else class="location-card" variant="outlined">
      <v-card-text>
        <!-- UF -->
        <div class="mb-2">
          <v-chip color="primary" size="small">
            <v-icon size="small" start>mdi-map-marker</v-icon>
            {{ location.uf_sigla }} - {{ location.uf_nome }}
          </v-chip>
        </div>

        <!-- Município -->
        <div class="ml-4 mb-1">
          <v-icon color="info" size="small">mdi-city</v-icon>
          <span class="ml-2">{{ location.municipio_nome }} - {{ location.municipio_bairro }}</span>
        </div>

        <!-- Endereço -->
        <div class="ml-4 mb-1 text-caption">
          <v-icon size="small">mdi-home</v-icon>
          <span class="ml-2">{{ location.endereco_completo }}</span>
          <v-chip class="ml-2" size="x-small" variant="outlined">{{ location.endereco_cep }}</v-chip>
        </div>

        <!-- Depósito -->
        <div class="ml-4 mb-1">
          <v-icon color="warning" size="small">mdi-warehouse</v-icon>
          <span class="ml-2 font-weight-bold">{{ location.deposito_nome }}</span>
        </div>

        <!-- Posição Física -->
        <div class="ml-4">
          <v-chip color="success" size="small">
            <v-icon size="small" start>mdi-grid</v-icon>
            Corredor {{ location.corredor }} - Prateleira {{ location.prateleira }} - Seção {{ location.secao }}
          </v-chip>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
  import type { LocationComplete } from '@/services'

  interface Props {
    location: LocationComplete
    compact?: boolean
  }

  withDefaults(defineProps<Props>(), {
    compact: true,
  })
</script>

<style scoped>
.location-hierarchy {
  width: 100%;
}

.location-compact {
  cursor: help;
}

.location-card {
  border-left: 3px solid rgb(var(--v-theme-primary));
}
</style>

