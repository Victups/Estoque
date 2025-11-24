<template>
  <v-row>
    <v-col cols="12">
      <v-card class="main-card" elevation="3">
        <v-card-title class="bg-primary pa-4">
          <v-icon class="mr-2" icon="mdi-history" />
          <span class="text-h5">Histórico de Movimentações</span>
        </v-card-title>

        <v-card-text class="pa-6">
          <!-- Filters -->
          <v-row class="mb-4">
            <v-col cols="12" md="4">
              <v-text-field
                v-model="localSearch"
                clearable
                density="comfortable"
                hide-details
                label="Buscar"
                placeholder="Produto, lote, observação..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="localFilterType"
                clearable
                density="comfortable"
                hide-details
                :items="['Todos', 'Entrada', 'Saída']"
                label="Tipo"
                prepend-inner-icon="mdi-filter"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="localFilterDate"
                clearable
                density="comfortable"
                hide-details
                label="Data"
                prepend-inner-icon="mdi-calendar"
                type="date"
                variant="outlined"
              />
            </v-col>
            <v-col class="d-flex align-center" cols="12" md="2">
              <v-btn
                block
                color="grey-darken-1"
                prepend-icon="mdi-refresh"
                variant="outlined"
                @click="$emit('refresh')"
              >
                Atualizar
              </v-btn>
            </v-col>
          </v-row>

          <!-- Data Table -->
          <v-data-table
            class="elevation-1"
            :headers="headers"
            :items="filteredMovements"
            :items-per-page="15"
            :loading="loading"
            loading-text="Carregando movimentações..."
            :search="localSearch"
          >
            <template #[`item.tipo_movimento`]="{ item }">
              <v-chip
                :color="item.tipo_movimento === 'entrada' ? 'success' : 'error'"
                size="small"
                variant="flat"
              >
                <v-icon
                  class="mr-1"
                  :icon="item.tipo_movimento === 'entrada' ? 'mdi-arrow-down' : 'mdi-arrow-up'"
                  size="small"
                />
                {{ item.tipo_movimento === 'entrada' ? 'Entrada' : 'Saída' }}
              </v-chip>
            </template>

            <template #[`item.quantidade`]="{ item }">
              <span class="font-weight-bold">
                {{ formatNumber(item.quantidade) }}
              </span>
            </template>

            <template #[`item.preco_unitario`]="{ item }">
              {{ formatCurrency(item.preco_unitario) }}
            </template>

            <template #[`item.valor_total`]="{ item }">
              <span class="font-weight-bold text-primary">
                {{ formatCurrency(item.quantidade * item.preco_unitario) }}
              </span>
            </template>

            <template #[`item.localizacao`]="{ item }">
              <div v-if="item.tipo_movimento === 'entrada' && item.localizacao_destino_nome">
                <v-chip color="success" size="small" variant="tonal">
                  <v-icon class="mr-1" icon="mdi-arrow-right" size="small" />
                  {{ item.localizacao_destino_nome }}
                </v-chip>
              </div>
              <div v-else-if="item.tipo_movimento === 'saida' && item.localizacao_origem_nome">
                <v-chip color="error" size="small" variant="tonal">
                  <v-icon class="mr-1" icon="mdi-arrow-left" size="small" />
                  {{ item.localizacao_origem_nome }}
                </v-chip>
              </div>
              <span v-else class="text-grey">-</span>
            </template>

            <template #[`item.data_mov`]="{ item }">
              {{ formatDate(item.data_mov) }}
            </template>

            <template #[`item.actions`]="{ item }">
              <v-tooltip location="top" text="Ver detalhes">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    color="info"
                    icon="mdi-eye"
                    size="small"
                    variant="tonal"
                    @click="$emit('view-movement', item)"
                  />
                </template>
              </v-tooltip>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import type { StockMovementEnriched } from '@/interfaces'

export default {
  name: 'MovimentacaoTable',
  props: {
    movements: {
      type: Array as () => StockMovementEnriched[],
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    search: {
      type: String,
      default: '',
    },
    filterType: {
      type: String,
      default: 'Todos',
    },
    filterDate: {
      type: String,
      default: '',
    },
  },
  emits: ['refresh', 'view-movement', 'update:search', 'update:filterType', 'update:filterDate'],
  data () {
    return {
      headers: [
        { title: 'ID', key: 'id', width: '80px' },
        { title: 'Tipo', key: 'tipo_movimento', width: '120px' },
        { title: 'Produto', key: 'produto_nome' },
        { title: 'Lote', key: 'lote_codigo' },
        { title: 'Quantidade', key: 'quantidade' },
        { title: 'Preço Unit.', key: 'preco_unitario' },
        { title: 'Valor Total', key: 'valor_total' },
        { title: 'Localização', key: 'localizacao' },
        { title: 'Data', key: 'data_mov' },
        { title: 'Ações', key: 'actions', sortable: false, width: '100px' },
      ],
    }
  },
  computed: {
    localSearch: {
      get (): string {
        return this.search
      },
      set (value: string) {
        this.$emit('update:search', value)
      },
    },
    localFilterType: {
      get (): string {
        return this.filterType
      },
      set (value: string) {
        this.$emit('update:filterType', value)
      },
    },
    localFilterDate: {
      get (): string {
        return this.filterDate
      },
      set (value: string) {
        this.$emit('update:filterDate', value)
      },
    },
    filteredMovements (): StockMovementEnriched[] {
      return this.movements.filter((mov: StockMovementEnriched) => {
        const typeMatch = this.filterType === 'Todos'
          || (this.filterType === 'Entrada' && mov.tipo_movimento === 'entrada')
          || (this.filterType === 'Saída' && mov.tipo_movimento === 'saida')

        const dateMatch = !this.filterDate || mov.data_mov.startsWith(this.filterDate)

        return typeMatch && dateMatch
      })
    },
  },
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

<style scoped>
.main-card {
  border-radius: 12px;
}
</style>

