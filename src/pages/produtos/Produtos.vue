<template>
  <v-container class="pa-6" fluid>
    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card class="rounded-lg" elevation="0">
          <v-card-title class="d-flex align-center justify-space-between pa-6">
            <div class="d-flex align-center">
              <v-icon class="mr-3" color="primary" icon="mdi-package-variant" size="32" />
              <div>
                <h1 class="text-h4 font-weight-bold mb-1">
                  Gerenciamento de Produtos
                </h1>
                <p class="text-subtitle-2 text-medium-emphasis mb-0">
                  Gerencie todos os produtos e estoque do sistema
                </p>
              </div>
            </div>
            <div>
              <v-btn
                color="primary"
                prepend-icon="mdi-package-variant-plus"
                variant="elevated"
                :to="{ name: 'CadastroProdutos' }"
              >
                Cadastrar Produto
              </v-btn>
            </div>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <!-- Content -->
    <v-row>
      <v-col cols="12">
        <v-card class="rounded-lg" elevation="2">
          <v-card-text class="pa-6">
            <!-- Loading State -->
            <div v-if="loading" class="text-center py-8">
              <v-progress-circular color="primary" indeterminate size="64" />
              <p class="text-subtitle-1 mt-4">
                Carregando produtos...
              </p>
            </div>

            <!-- Error State -->
            <v-alert
              v-if="error"
              class="mb-4"
              closable
              type="error"
              variant="tonal"
            >
              {{ error }}
            </v-alert>

            <!-- Products Table -->
            <v-data-table
              v-if="!loading && !error"
              class="elevation-1 rounded-lg"
              :headers="headers"
              :items="displayProducts"
              items-per-page-text="Produtos por página"
              :loading="loading"
              loading-text="Carregando produtos..."
              no-data-text="Nenhum produto encontrado"
            >
              <!-- Product Name -->
              <template #[`item.nome`]="{ item }">
                <div class="d-flex align-center py-2">
                  <v-avatar class="mr-3" color="primary" size="40">
                    <v-icon>mdi-package-variant</v-icon>
                  </v-avatar>
                  <span class="font-weight-medium">{{ item.nome }}</span>
                </div>
              </template>

              <!-- Total Quantity -->
              <template #[`item.totalQuantity`]="{ item }">
                <div class="d-flex align-center">
                  <v-icon class="mr-2 text-medium-emphasis" icon="mdi-package-variant-closed" size="small" />
                  <span class="font-weight-medium">{{ item.totalQuantity }}</span>
                </div>
              </template>

              <!-- Nearest Expiry -->
              <template #[`item.nearestExpiry`]="{ item }">
                <div class="d-flex align-center">
                  <v-icon class="mr-2 text-medium-emphasis" icon="mdi-calendar" size="small" />
                  <span>{{ item.nearestExpiry }}</span>
                </div>
              </template>

              <!-- Status -->
              <template #[`item.status`]="{ item }">
                <v-chip
                  :color="getStatusColor(item.status)"
                  size="small"
                  variant="flat"
                >
                  <v-icon
                    :icon="getStatusIcon(item.status)"
                    size="small"
                    start
                  />
                  {{ item.status }}
                </v-chip>
              </template>

              <!-- Loading Template -->
              <template #loading>
                <v-skeleton-loader type="table-row@5" />
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { getApiBaseUrl } from '@/utils/env'

export default {
  name: 'ProdutosPage',
  data () {
    return {
      allProducts: [],
      allProductLots: [],
      loading: false,
      error: null,
      headers: [
        { title: 'Produto', key: 'nome', sortable: true },
        { title: 'Estoque Total', key: 'totalQuantity', sortable: true },
        { title: 'Validade Próxima', key: 'nearestExpiry', sortable: false },
        { title: 'Status', key: 'status', sortable: true },
      ],
      API_BASE: getApiBaseUrl(),
    }
  },
  computed: {
    displayProducts () {
      const lotMap = new Map()
      for (const lot of this.allProductLots) {
        const lots = lotMap.get(lot.id_produto) || []
        lots.push(lot)
        lotMap.set(lot.id_produto, lots)
      }

      return this.allProducts.map(product => {
        const lots = lotMap.get(product.id) || []
        const totalQuantity = lots.reduce((sum, lot) => sum + lot.quantidade, 0)
        const validLots = lots.filter(lot => new Date(lot.data_validade) > new Date())
        const sortedLots = validLots.slice().sort((a, b) => new Date(a.data_validade).getTime() - new Date(b.data_validade).getTime())
        const nearestExpiryLot = sortedLots[0]
        const nearestExpiry = nearestExpiryLot ? new Date(nearestExpiryLot.data_validade).toLocaleDateString('pt-BR') : 'N/A'

        let status = 'OK'
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

        if (totalQuantity < product.estoque_minimo) {
          status = 'Estoque Baixo'
        } else if (nearestExpiryLot && new Date(nearestExpiryLot.data_validade) < thirtyDaysFromNow) {
          status = 'Vencimento Próximo'
        }

        return {
          id: product.id,
          nome: product.nome,
          totalQuantity,
          nearestExpiry,
          status,
        }
      })
    },
  },
  mounted () {
    this.fetchData()
  },
  methods: {
    async fetchData () {
      this.loading = true
      this.error = null
      try {
        const [productsRes, lotsRes] = await Promise.all([
          fetch(`${this.API_BASE}/produtos`),
          fetch(`${this.API_BASE}/produto_lotes`),
        ])
        if (!productsRes.ok) throw new Error('Falha ao carregar produtos')
        if (!lotsRes.ok) throw new Error('Falha ao carregar lotes de produtos')

        const productsData = await productsRes.json()
        const lotsData = await lotsRes.json()

        this.allProducts = Array.isArray(productsData[0]) ? productsData[0] : productsData
        this.allProductLots = Array.isArray(lotsData[0]) ? lotsData[0] : lotsData
      } catch (error_) {
        this.error = error_.message || 'Ocorreu um erro desconhecido'
      } finally {
        this.loading = false
      }
    },
    getStatusColor (status) {
      switch (status) {
        case 'Estoque Baixo':
          return 'warning'
        case 'Vencimento Próximo':
          return 'error'
        default:
          return 'success'
      }
    },
    getStatusIcon (status) {
      switch (status) {
        case 'Estoque Baixo':
          return 'mdi-alert-circle'
        case 'Vencimento Próximo':
          return 'mdi-clock-alert'
        default:
          return 'mdi-check-circle'
      }
    },
  },
}
</script>

<route lang="yaml">
meta:
  layout: default
  requiresAuth: true
</route>

<style scoped>
.v-card {
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.v-data-table {
  border-radius: 8px;
}

:deep(.v-data-table__th) {
  font-weight: 600 !important;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

:deep(.v-data-table__td) {
  font-size: 0.875rem;
}
</style>
