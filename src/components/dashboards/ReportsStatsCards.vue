<template>
  <v-row>
    <v-col cols="12" md="3" sm="6">
      <StatCard
        color="primary"
        icon="mdi-package-variant"
        label="Total de Produtos"
        :value="stats.totalProducts"
      />
    </v-col>
    <v-col cols="12" md="3" sm="6">
      <StatCard
        color="success"
        format="locale"
        icon="mdi-cube"
        label="Estoque Total"
        :value="stats.totalStock"
      />
    </v-col>
    <v-col cols="12" md="3" sm="6">
      <StatCard
        color="info"
        format="currency"
        icon="mdi-cash-multiple"
        label="Valor Total"
        :value="stats.totalValue"
      />
    </v-col>
    <v-col cols="12" md="3" sm="6">
      <StatCard
        color="error"
        icon="mdi-alert-circle"
        label="Estoque Baixo"
        :value="stats.lowStockProducts"
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
