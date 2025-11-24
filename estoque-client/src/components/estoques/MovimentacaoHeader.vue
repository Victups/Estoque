<template>
  <v-row class="mb-4">
    <v-col cols="12">
      <div class="d-flex justify-space-between align-center mb-4">
        <div>
          <div class="d-flex align-center mb-2">
            <v-icon class="mr-2" icon="mdi-swap-horizontal" size="28" />
            <h1 class="text-h5 font-weight-bold mb-0">
              Movimentação de Estoque
            </h1>
          </div>
          <p class="text-body-1 text-medium-emphasis mb-0">
            Registre entradas e saídas de produtos
          </p>
        </div>
        <div class="d-flex button-group">
          <v-btn
            color="success"
            prepend-icon="mdi-plus-circle"
            variant="elevated"
            @click="$emit('open-entrada-dialog')"
          >
            Nova Entrada
          </v-btn>
          <v-btn
            color="error"
            prepend-icon="mdi-minus-circle"
            variant="elevated"
            @click="$emit('open-saida-dialog')"
          >
            Nova Saída
          </v-btn>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
export default {
  name: 'MovimentacaoHeader',
  emits: ['open-entrada-dialog', 'open-saida-dialog'],
}
</script>

<style scoped>
.button-group {
  gap: 12px;
}

.button-group :deep(.v-btn) {
  padding-left: 16px !important;
  padding-right: 16px !important;
  min-width: auto !important;
}
</style>

