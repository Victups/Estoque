<template>
  <v-row>
    <v-col cols="12" md="3" sm="6">
      <StatCard
        label="Total de Produtos"
        :value="stats.totalProducts"
        color="primary"
        icon="mdi-package-variant"
      />
    </v-col>
    <v-col cols="12" md="3" sm="6">
      <StatCard
        label="Estoque Total"
        :value="stats.totalStock"
        color="success"
        icon="mdi-cube"
        format="locale"
      />
    </v-col>
    <v-col cols="12" md="3" sm="6">
      <StatCard
        label="Valor Total"
        :value="stats.totalValue"
        color="info"
        icon="mdi-cash-multiple"
        format="currency"
      />
    </v-col>
    <v-col cols="12" md="3" sm="6">
      <StatCard
        label="Estoque Baixo"
        :value="stats.lowStockProducts"
        color="error"
        icon="mdi-alert-circle"
      />
    </v-col>
  </v-row>
</template>

<script>
import StatCard from '@/components/shared/StatCard.vue'

export default {
  name: 'ReportsStatsCards',
  components: {
    StatCard,
  },
  props: {
    stats: {
      type: Object,
      required: true,
    },
  },
}
</script>

