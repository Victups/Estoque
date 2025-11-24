<script lang="ts">
  import { defineComponent } from 'vue'
  import { useAuthStore } from '@/stores/auth'

  export default defineComponent({
    name: 'HomePage',
    data () {
      return {
        // Módulos principais do sistema
        modules: [
          {
            title: 'Gerenciamento de Produtos',
            description: 'Gerencie todos os produtos e estoque do sistema',
            icon: 'mdi-package-variant',
            color: 'primary',
            route: '/produtos',
            stats: 'Cadastro completo',
          },
          {
            title: 'Movimentação de Estoque',
            description: 'Registre entradas e saídas de produtos',
            icon: 'mdi-swap-horizontal',
            color: 'success',
            route: '/movimentacao',
            stats: 'Controle FIFO',
          },
          {
            title: 'Gerenciamento de Usuários',
            description: 'Visualize e gerencie todos os usuários do sistema',
            icon: 'mdi-account-group',
            color: 'info',
            route: '/usuarios',
            stats: 'Administração',
          },
          {
            title: 'Relatórios e Análises',
            description: 'Visualize estatísticas e métricas do seu estoque',
            icon: 'mdi-chart-bar',
            color: 'warning',
            route: '/relatorios',
            stats: 'BI',
          },
        ],
      }
    },
    computed: {
      auth () {
        return useAuthStore()
      },
    },
    methods: {
      navigateTo (route: string) {
        this.$router.push(route)
      },
    },
  })
</script>

<template>
  <div class="home-page">
    <v-container class="py-8" fluid>
      <!-- Módulos Principais -->
      <v-row class="mt-4">
        <v-col cols="12">
          <div class="d-flex align-center mb-4">
            <v-icon class="mr-2" color="primary" size="28">mdi-view-dashboard</v-icon>
            <h1 class="text-h5 font-weight-bold mb-0">
              Módulos do Sistema
            </h1>
          </div>
          <p class="text-body-1 text-medium-emphasis mb-6">
            Acesse rapidamente os principais recursos do sistema
          </p>
        </v-col>

        <v-col
          v-for="module in modules"
          :key="module.route"
          cols="12"
          md="6"
          lg="3"
          sm="12"
        >
          <v-card
            class="module-card rounded-xl"
            elevation="3"
            hover
            @click="navigateTo(module.route)"
          >
            <v-card-text class="pa-8 text-center">
              <v-avatar class="mb-6" :color="module.color" size="80">
                <v-icon color="white" size="48">{{ module.icon }}</v-icon>
              </v-avatar>
              <h4 class="text-h6 font-weight-bold mb-3">
                {{ module.title }}
              </h4>
              <p class="text-body-1 text-medium-emphasis mb-4">
                {{ module.description }}
              </p>
              <v-chip :color="module.color" size="small" variant="flat">
                {{ module.stats }}
              </v-chip>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<route lang="yaml">
meta:
  layout: default
</route>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #000000;
}

/* Cards de módulos com hover */
.module-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #1a1a1a !important;
}

.module-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3) !important;
  border-color: rgba(255, 255, 255, 0.2);
}

.module-card h4 {
  font-size: 1.1rem;
  line-height: 1.4;
  min-height: 3em;
  display: flex;
  align-items: center;
  justify-content: center;
}

.module-card p {
  font-size: 0.95rem;
  line-height: 1.5;
  min-height: 3em;
}

h1 {
  color: #ffffff;
}

p.text-body-1 {
  color: rgba(255, 255, 255, 0.7);
}
</style>
