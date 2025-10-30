<template>
  <v-row class="mb-6">
    <v-col cols="12" md="3" sm="6">
      <StatCard
        label="Total de Usuários"
        :value="stats.totalUsers"
        color="primary"
        icon="mdi-account-multiple"
      />
    </v-col>
    <v-col cols="12" md="3" sm="6">
      <StatCard
        label="Ativos"
        :value="stats.activeUsersCount"
        color="success"
        icon="mdi-account-check"
      />
    </v-col>
    <v-col cols="12" md="3" sm="6">
      <StatCard
        label="Administradores"
        :value="stats.adminCount"
        color="warning"
        icon="mdi-shield-account"
      />
    </v-col>
    <v-col cols="12" md="3" sm="6">
      <StatCard
        label="Inativos"
        :value="stats.inactiveUsersCount"
        color="info"
        icon="mdi-account-clock"
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

