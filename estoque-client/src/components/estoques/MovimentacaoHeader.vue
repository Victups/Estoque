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
        <div class="d-flex gap-3">
          <v-btn
            color="success"
            elevation="2"
            prepend-icon="mdi-plus-circle"
            size="large"
            @click="$emit('open-entrada-dialog')"
          >
            Nova Entrada
          </v-btn>
          <v-btn
            color="error"
            elevation="2"
            prepend-icon="mdi-minus-circle"
            size="large"
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

