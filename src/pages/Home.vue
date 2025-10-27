<script lang="ts">
  import { useAuthStore } from '../stores/auth'

  export default {
    name: 'HomePage',
    setup () {
      const auth = useAuthStore()
      return { auth }
    },
    data () {
      return {
        // Módulos principais do sistema
        modules: [
          {
          title: 'Produtos',
          description: 'Gerencie o catálogo de produtos e estoque',
          icon: 'mdi-package-variant',
          color: 'primary',
          route: '/produtos',
          stats: 'Cadastro completo',
        },
        {
          title: 'Movimentação',
          description: 'Registre entradas e saídas de estoque',
          icon: 'mdi-swap-horizontal',
          color: 'success',
          route: '/movimentacao',
          stats: 'Controle FIFO',
        },
        {
          title: 'Usuários',
          description: 'Gerencie usuários e permissões',
          icon: 'mdi-account-group',
          color: 'info',
          route: '/usuarios',
          stats: 'Administração',
        },
        {
          title: 'Relatórios',
          description: 'Visualize relatórios e análises',
          icon: 'mdi-chart-bar',
          color: 'warning',
          route: '/relatorios',
          stats: 'Em breve',
        },
      ],
      quickActions: [
        {
          title: 'Novo Produto',
          icon: 'mdi-plus-circle',
          color: 'primary',
          route: '/produtos/cadastrar',
        },
        {
          title: 'Entrada Estoque',
          icon: 'mdi-arrow-down-bold',
          color: 'success',
          route: '/movimentacao',
        },
        {
          title: 'Saída Estoque',
          icon: 'mdi-arrow-up-bold',
          color: 'error',
          route: '/movimentacao',
        },
        {
          title: 'Meu Perfil',
          icon: 'mdi-account-circle',
          color: 'info',
          route: '/perfil',
        },
      ],
      tips: [
        'Acompanhe produtos com validade próxima na página Produtos.',
        'Use o filtro por nome para encontrar itens rapidamente.',
        'Verifique o estoque mínimo para evitar rupturas.',
        'O sistema aplica FIFO automaticamente nas saídas.',
        ],
      }
  },
  computed: {
    greeting () {
      const hour = new Date().getHours()
      if (hour < 12) return 'Bom dia'
      if (hour < 18) return 'Boa tarde'
      return 'Boa noite'
    },
    displayName () {
      return this.auth.displayName || 'Usuário'
    },
    ufText () {
      return this.auth.ufLabel ?? 'UF não definida'
    },
  },
  methods: {
    navigateTo (route: string) {
      this.$router.push(route)
    },
  }
}
</script>

<template>
  <v-container class="py-8" fluid>
    <!-- Header de Boas-vindas -->
    <v-row>
      <v-col cols="12">
        <v-card class="rounded-xl gradient-card" elevation="4">
          <v-card-text class="pa-8">
            <div class="d-flex align-center justify-space-between flex-wrap">
              <div>
                <h2 class="text-h3 font-weight-bold mb-2 text-white">
                  {{ greeting }}, {{ displayName }}! 👋
                </h2>
                <p class="text-h6 text-white opacity-90">
                  Bem-vindo ao sistema de estoque
                </p>
                <v-chip class="mt-3" color="white" variant="flat">
                  <v-icon start>mdi-map-marker</v-icon>
                  {{ ufText }}
                </v-chip>
              </div>
              <v-avatar class="avatar-glow" color="white" size="80">
                <v-icon color="primary" size="50">mdi-warehouse</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Módulos Principais -->
    <v-row class="mt-6">
      <v-col cols="12">
        <h3 class="text-h5 font-weight-bold mb-4">
          <v-icon class="mr-2">mdi-view-dashboard</v-icon>
          Módulos do Sistema
        </h3>
      </v-col>

      <v-col
        v-for="module in modules"
        :key="module.route"
        cols="12"
        md="3"
        sm="6"
      >
        <v-card
          class="module-card rounded-xl"
          elevation="2"
          hover
          @click="navigateTo(module.route)"
        >
          <v-card-text class="pa-6 text-center">
            <v-avatar class="mb-4" :color="module.color" size="64">
              <v-icon color="white" size="36">{{ module.icon }}</v-icon>
            </v-avatar>
            <h4 class="text-h6 font-weight-bold mb-2">
              {{ module.title }}
            </h4>
            <p class="text-body-2 text-medium-emphasis mb-3">
              {{ module.description }}
            </p>
            <v-chip :color="module.color" size="small" variant="tonal">
              {{ module.stats }}
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Ações Rápidas -->
    <v-row class="mt-6">
      <v-col cols="12">
        <h3 class="text-h5 font-weight-bold mb-4">
          <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
          Ações Rápidas
        </h3>
      </v-col>

      <v-col
        v-for="action in quickActions"
        :key="action.title"
        cols="6"
        sm="3"
      >
        <v-card
          class="quick-action-card rounded-lg"
          elevation="1"
          hover
          @click="navigateTo(action.route)"
        >
          <v-card-text class="pa-4 text-center">
            <v-icon class="mb-2" :color="action.color" size="32">
              {{ action.icon }}
            </v-icon>
            <p class="text-body-2 font-weight-medium">
              {{ action.title }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dicas e Informações -->
    <v-row class="mt-6">
      <v-col cols="12" md="6">
        <v-card class="rounded-xl" elevation="2">
          <v-card-title class="bg-primary text-white">
            <v-icon class="mr-2">mdi-lightbulb-on</v-icon>
            Dicas Rápidas
          </v-card-title>
          <v-list density="comfortable">
            <v-list-item
              v-for="(tip, idx) in tips"
              :key="idx"
            >
              <template #prepend>
                <v-icon color="primary">mdi-check-circle</v-icon>
              </template>
              <v-list-item-title>{{ tip }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="rounded-xl" elevation="2">
          <v-card-title class="bg-success text-white">
            <v-icon class="mr-2">mdi-information</v-icon>
            Informações do Sistema
          </v-card-title>
          <v-card-text class="pa-6">
            <v-list density="comfortable">
              <v-list-item>
                <template #prepend>
                  <v-icon color="success">mdi-check-decagram</v-icon>
                </template>
                <v-list-item-title>Sistema 100% Frontend</v-list-item-title>
                <v-list-item-subtitle>Consumindo db.json</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon color="info">mdi-database</v-icon>
                </template>
                <v-list-item-title>Filtro por UF Ativo</v-list-item-title>
                <v-list-item-subtitle>{{ ufText }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon color="warning">mdi-truck-fast</v-icon>
                </template>
                <v-list-item-title>FIFO Automático</v-list-item-title>
                <v-list-item-subtitle>First-In, First-Out</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<route lang="yaml">
meta:
  layout: default
</route>

<style scoped>
/* Gradiente no card de boas-vindas */
.gradient-card {
  background: linear-gradient(135deg, #242525 0%, #38373a 100%);
}

/* Efeito de brilho no avatar */
.avatar-glow {
  box-shadow: 0 0 20px rgba(102, 98, 98, 0.5);
}

/* Cards de módulos com hover */
.module-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.module-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

/* Cards de ações rápidas */
.quick-action-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-action-card:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}
</style>
