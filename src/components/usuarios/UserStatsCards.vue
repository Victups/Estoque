<template>
  <v-row class="mb-6">
    <v-col cols="12" md="3" sm="6">
      <StatCard
        color="primary"
        icon="mdi-account-multiple"
        label="Total de Usuários"
        :value="stats.totalUsers"
      />
    </v-col>
    <v-col cols="12" md="3" sm="6">
      <StatCard
        color="success"
        icon="mdi-account-check"
        label="Ativos"
        :value="stats.activeUsersCount"
      />
    </v-col>
    <v-col cols="12" md="3" sm="6">
      <StatCard
        color="warning"
        icon="mdi-shield-account"
        label="Administradores"
        :value="stats.adminCount"
      />
    </v-col>
    <v-col cols="12" md="3" sm="6">
      <StatCard
        color="info"
        icon="mdi-account-clock"
        label="Inativos"
        :value="stats.inactiveUsersCount"
      />
    </v-col>
  </v-row>
</template>

<script>
  import StatCard from './StatCard.vue'

  export default {
    name: 'UserStatsCards',
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
