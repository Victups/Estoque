<template>
  <v-row class="mb-6">
    <v-col cols="12" md="3" sm="6">
      <v-card class="stat-card" elevation="3">
        <v-card-text>
          <div class="d-flex align-center">
            <v-avatar class="mr-4" color="primary" size="56">
              <v-icon icon="mdi-swap-horizontal" size="30" />
            </v-avatar>
            <div>
              <p class="text-caption text-grey mb-1">Total Movimentações</p>
              <h2 class="text-h4 font-weight-bold">{{ totalMovements }}</h2>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="3" sm="6">
      <v-card class="stat-card" elevation="3">
        <v-card-text>
          <div class="d-flex align-center">
            <v-avatar class="mr-4" color="success" size="56">
              <v-icon icon="mdi-arrow-down-circle" size="30" />
            </v-avatar>
            <div>
              <p class="text-caption text-grey mb-1">Entradas</p>
              <h2 class="text-h4 font-weight-bold">{{ entradasCount }}</h2>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="3" sm="6">
      <v-card class="stat-card" elevation="3">
        <v-card-text>
          <div class="d-flex align-center">
            <v-avatar class="mr-4" color="error" size="56">
              <v-icon icon="mdi-arrow-up-circle" size="30" />
            </v-avatar>
            <div>
              <p class="text-caption text-grey mb-1">Saídas</p>
              <h2 class="text-h4 font-weight-bold">{{ saidasCount }}</h2>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="3" sm="6">
      <v-card class="stat-card" elevation="3">
        <v-card-text>
          <div class="d-flex align-center">
            <v-avatar class="mr-4" color="info" size="56">
              <v-icon icon="mdi-calendar-today" size="30" />
            </v-avatar>
            <div>
              <p class="text-caption text-grey mb-1">Hoje</p>
              <h2 class="text-h4 font-weight-bold">{{ hojeMov }}</h2>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
export default {
  name: 'MovimentacaoStats',
  props: {
    totalMovements: {
      type: Number,
      required: true,
    },
    entradasCount: {
      type: Number,
      required: true,
    },
    saidasCount: {
      type: Number,
      required: true,
    },
    hojeMov: {
      type: Number,
      required: true,
    },
  },
}
</script>

<style scoped>
.stat-card {
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}
</style>

