<template>
  <v-dialog :model-value="modelValue" max-width="700" @update:model-value="$emit('update:modelValue', $event)">
    <v-card v-if="movement" elevation="8">
      <v-card-title class="bg-primary pa-4">
        <div class="d-flex justify-space-between align-center">
          <div class="d-flex align-center">
            <v-icon class="mr-2" icon="mdi-file-document" size="30" />
            <span class="text-h5">Detalhes da Movimentação</span>
          </div>
          <v-btn icon="mdi-close" variant="text" @click="$emit('update:modelValue', false)" />
        </div>
      </v-card-title>
      <v-card-text class="pa-6">
        <v-row>
          <v-col cols="12">
            <div class="text-center mb-4">
              <v-chip
                :color="movement.tipo_movimento === 'entrada' ? 'success' : 'error'"
                size="large"
                variant="flat"
              >
                <v-icon
                  class="mr-2"
                  :icon="movement.tipo_movimento === 'entrada' ? 'mdi-arrow-down' : 'mdi-arrow-up'"
                />
                {{ movement.tipo_movimento === 'entrada' ? 'ENTRADA' : 'SAÍDA' }}
              </v-chip>
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <v-list-item class="px-0">
              <template #prepend>
                <v-icon color="primary" icon="mdi-package" />
              </template>
              <v-list-item-title class="font-weight-bold">Produto</v-list-item-title>
              <v-list-item-subtitle>
                {{ movement.produto_nome || `ID: ${movement.id_produto}` }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-col>

          <v-col cols="12" md="6">
            <v-list-item class="px-0">
              <template #prepend>
                <v-icon color="primary" icon="mdi-barcode" />
              </template>
              <v-list-item-title class="font-weight-bold">Lote</v-list-item-title>
              <v-list-item-subtitle>
                {{ movement.lote_codigo || `ID: ${movement.id_lote}` }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-col>

          <v-col v-if="movement.tipo_movimento === 'entrada' && movement.localizacao_destino_nome" cols="12">
            <v-list-item class="px-0">
              <template #prepend>
                <v-icon color="success" icon="mdi-map-marker" />
              </template>
              <v-list-item-title class="font-weight-bold">Localização Destino</v-list-item-title>
              <v-list-item-subtitle>
                {{ movement.localizacao_destino_nome }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-col>

          <v-col v-if="movement.tipo_movimento === 'saida' && movement.localizacao_origem_nome" cols="12">
            <v-list-item class="px-0">
              <template #prepend>
                <v-icon color="error" icon="mdi-map-marker" />
              </template>
              <v-list-item-title class="font-weight-bold">Localização Origem</v-list-item-title>
              <v-list-item-subtitle>
                {{ movement.localizacao_origem_nome }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-col>

          <v-col cols="12" md="6">
            <v-list-item class="px-0">
              <template #prepend>
                <v-icon color="primary" icon="mdi-numeric" />
              </template>
              <v-list-item-title class="font-weight-bold">Quantidade</v-list-item-title>
              <v-list-item-subtitle>{{ formatNumber(movement.quantidade) }}</v-list-item-subtitle>
            </v-list-item>
          </v-col>

          <v-col cols="12" md="6">
            <v-list-item class="px-0">
              <template #prepend>
                <v-icon color="primary" icon="mdi-currency-usd" />
              </template>
              <v-list-item-title class="font-weight-bold">Preço Unitário</v-list-item-title>
              <v-list-item-subtitle>{{ formatCurrency(movement.preco_unitario) }}</v-list-item-subtitle>
            </v-list-item>
          </v-col>

          <v-col cols="12" md="6">
            <v-list-item class="px-0">
              <template #prepend>
                <v-icon color="primary" icon="mdi-calendar" />
              </template>
              <v-list-item-title class="font-weight-bold">Data</v-list-item-title>
              <v-list-item-subtitle>{{ formatDate(movement.data_mov) }}</v-list-item-subtitle>
            </v-list-item>
          </v-col>

          <v-col cols="12" md="6">
            <v-list-item class="px-0">
              <template #prepend>
                <v-icon color="success" icon="mdi-calculator" />
              </template>
              <v-list-item-title class="font-weight-bold">Valor Total</v-list-item-title>
              <v-list-item-subtitle class="text-h6 text-success">
                {{ formatCurrency(movement.valor_total ?? (movement.quantidade * (movement.preco_unitario ?? 0))) }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-col>

          <v-col v-if="movement.observacao" cols="12">
            <v-divider class="mb-4" />
            <v-list-item class="px-0">
              <template #prepend>
                <v-icon color="primary" icon="mdi-note-text" />
              </template>
              <v-list-item-title class="font-weight-bold">Observações</v-list-item-title>
              <v-list-item-subtitle>{{ movement.observacao }}</v-list-item-subtitle>
            </v-list-item>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import type { StockMovementEnriched } from '@/interfaces'

export default {
  name: 'ViewMovementDialog',
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    movement: {
      type: Object as () => StockMovementEnriched | null,
      default: null,
    },
  },
  emits: ['update:modelValue'],
  methods: {
    formatNumber (value: number): string {
      return value.toLocaleString('pt-BR')
    },
    formatCurrency (value?: number | null): string {
      const numeric = typeof value === 'number' ? value : 0
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(numeric)
    },
    formatDate (dateString?: string | null): string {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR')
    },
  },
}
</script>

