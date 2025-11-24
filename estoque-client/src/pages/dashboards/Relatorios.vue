<template>
  <div class="relatorios-page">
    <v-container class="py-8" fluid>
    <!-- Header -->
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <div class="d-flex align-center mb-2">
              <v-icon class="mr-2" size="28">mdi-chart-bar</v-icon>
              <h1 class="text-h5 font-weight-bold mb-0">
                Relatórios e Análises
              </h1>
            </div>
            <p class="text-body-1 text-medium-emphasis mb-0">
              Visualize estatísticas e métricas do seu estoque
            </p>
          </div>
          <v-btn
            color="primary"
            prepend-icon="mdi-refresh"
            variant="elevated"
            @click="loadData(true)"
          >
            Atualizar
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Loading -->
    <v-row v-if="loading">
      <v-col cols="12">
        <div class="text-center py-12">
          <v-progress-circular
            color="primary"
            indeterminate
            size="64"
          />
          <p class="text-h6 mt-4">Carregando relatórios...</p>
        </div>
      </v-col>
    </v-row>

    <!-- Conteúdo -->
    <template v-else>
      <!-- Filtros Avançados -->
      <v-row class="mb-6">
        <v-col cols="12">
          <FiltrosRelatorios
            v-model="filtros"
          />
        </v-col>
      </v-row>

      <!-- Cards de Estatísticas -->
      <ReportsStatsCards :stats="stockStats" />

      <!-- Alertas -->
      <v-row v-if="stockStats.lowStockProducts > 0 || stockStats.productsNearExpiration > 0" class="mt-2">
        <v-col cols="12" md="6">
          <v-alert
            v-if="stockStats.lowStockProducts > 0"
            color="error"
            icon="mdi-alert-circle"
            prominent
            variant="tonal"
          >
            <v-alert-title class="font-weight-bold">
              Atenção: Produtos com Estoque Baixo
            </v-alert-title>
            <div>
              {{ stockStats.lowStockProducts }} produto(s) estão abaixo do estoque mínimo.
              <v-btn
                class="ml-2"
                color="error"
                size="small"
                to="/produtos"
                variant="elevated"
              >
                Ver Produtos
              </v-btn>
            </div>
          </v-alert>
        </v-col>

        <v-col cols="12" md="6">
          <v-alert
            v-if="stockStats.productsNearExpiration > 0"
            color="warning"
            icon="mdi-calendar-alert"
            prominent
            variant="tonal"
          >
            <v-alert-title class="font-weight-bold">
              Atenção: Produtos Próximos ao Vencimento
            </v-alert-title>
            <div>
              {{ stockStats.productsNearExpiration }} lote(s) vencem nos próximos 30 dias.
              <v-btn
                class="ml-2"
                color="warning"
                size="small"
                to="/produtos"
                variant="elevated"
              >
                Verificar
              </v-btn>
            </div>
          </v-alert>
        </v-col>
      </v-row>

      <!-- Gráficos -->
      <v-row class="mt-4">
        <!-- Produtos por Categoria -->
        <v-col cols="12" md="6">
          <v-card class="chart-card" elevation="3" rounded="xl">
            <v-card-title class="chart-header">
              <v-icon class="mr-2" color="primary">mdi-chart-donut</v-icon>
              <span class="font-weight-bold">Produtos por Categoria</span>
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-6">
              <DonutChartCard
                :dados="donutChartData"
                legend-position="bottom"
                :size="300"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Movimentações -->
        <v-col cols="12" md="6">
          <v-card class="chart-card" elevation="3" rounded="xl">
            <v-card-title class="chart-header">
              <div class="d-flex align-center justify-space-between w-100">
                <div class="d-flex align-center">
                  <v-icon class="mr-2" color="success">mdi-swap-horizontal</v-icon>
                  <span class="font-weight-bold">Movimentações (Últimos 7 Dias)</span>
                </div>
                <div class="d-flex gap-2">
                  <v-chip color="success" size="small" variant="flat">
                    <v-icon size="12" start>mdi-circle</v-icon>
                    Entradas
                  </v-chip>
                  <v-chip color="error" size="small" variant="flat">
                    <v-icon size="12" start>mdi-circle</v-icon>
                    Saídas
                  </v-chip>
                </div>
              </div>
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-4">
              <GraficoBarrasCompleto
                :altura-fixa="340"
                :chart-options-override="movementsChartOptions"
                :data="movimentacoesBarrasData"
                direction="vertical"
                :show-legend="false"
                stacked
                x-axis-title=""
                y-axis-title="Quantidade"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Produtos com Estoque Baixo -->
        <v-col cols="12" md="6">
          <v-card class="chart-card" elevation="3" rounded="xl">
            <v-card-title class="chart-header">
              <v-icon class="mr-2" color="error">mdi-alert-circle</v-icon>
              <span class="font-weight-bold">Top 5 Produtos com Estoque Baixo</span>
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-6">
              <VueApexCharts
                v-if="topLowStockProducts.length > 0"
                height="340"
                :options="lowStockChartOptions"
                :series="lowStockChartSeries"
                type="bar"
              />
              <div v-else class="text-center py-12">
                <v-icon color="success" size="80">mdi-check-circle</v-icon>
                <p class="text-h6 font-weight-bold mt-4 mb-0">Todos os produtos estão com estoque adequado!</p>
                <p class="text-caption text-medium-emphasis mt-2">Nenhum produto abaixo do estoque mínimo</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Valor em Estoque por Categoria -->
        <v-col cols="12" md="6">
          <v-card class="chart-card" elevation="3" rounded="xl">
            <v-card-title class="chart-header">
              <v-icon class="mr-2" color="primary">mdi-cash-multiple</v-icon>
              <span class="font-weight-bold">Valor em Estoque por Categoria</span>
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-6">
              <VueApexCharts
                height="340"
                :options="valueChartOptions"
                :series="valueChartSeries"
                type="bar"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
    </v-container>
  </div>
</template>

<script lang="ts">
  import type { Category, Product, ProductLote, StockMovement } from '@/interfaces'
  import VueApexCharts from 'vue3-apexcharts'
  import DonutChartCard from '@/components/dashboards/DonutChartCard.vue'
  import GraficoBarrasCompleto from '@/components/dashboards/GraficoBarrasCompleto.vue'
  import ReportsStatsCards from '@/components/dashboards/ReportsStatsCards.vue'
  import FiltrosRelatorios from '@/components/shared/FiltrosRelatorios.vue'
  import { useDataCacheStore } from '@/stores/dataCache'
  import {
    calculateStockStats,
    getTopLowStockProducts,
    prepareDonutChartData,
    prepareLowStockChartOptions,
    prepareLowStockChartSeries,
    prepareMovementsChartData,
    prepareValueByCategoryChartData,
    prepareValueChartOptions,
  } from '@/utils/tramposes/reports'

  export default {
    setup () {
      const dataCache = useDataCacheStore()
      return { dataCache }
    },
    name: 'RelatoriosPage',
    components: {
      VueApexCharts,
      DonutChartCard,
      FiltrosRelatorios,
      GraficoBarrasCompleto,
      ReportsStatsCards,
    },
    data () {
      return {
        loading: true,
        filtros: {},
        products: [] as Product[],
        categories: [] as Category[],
        movements: [] as StockMovement[],
        lotes: [] as ProductLote[],
        movementsChartOptions: {
          colors: ['#4CAF50', '#F44336'],
          chart: {
            toolbar: { show: false },
            background: 'transparent',
          },
          theme: {
            mode: 'dark',
          },
          plotOptions: {
            bar: {
              columnWidth: '70%',
              borderRadius: 6,
            },
          },
          dataLabels: {
            enabled: false,
          },
          grid: {
            borderColor: 'rgba(255, 255, 255, 0.1)',
            strokeDashArray: 4,
          },
          xaxis: {
            labels: {
              style: {
                fontSize: '13px',
                fontWeight: 600,
                colors: ['#ffffff'],
              },
            },
          },
          yaxis: {
            labels: {
              style: {
                fontSize: '12px',
                colors: ['#ffffff'],
              },
            },
          },
        },
      }
    },
    computed: {
      stockStats () {
        return calculateStockStats(this.products, this.lotes)
      },
      donutChartData () {
        return prepareDonutChartData(this.products, this.categories)
      },
      movimentacoesBarrasData () {
        return prepareMovementsChartData(this.movements)
      },
      topLowStockProducts () {
        return getTopLowStockProducts(this.products, this.lotes, 5)
      },
      lowStockChartOptions () {
        return prepareLowStockChartOptions(this.topLowStockProducts)
      },
      lowStockChartSeries () {
        return prepareLowStockChartSeries(this.topLowStockProducts)
      },
      valueChartData () {
        return prepareValueByCategoryChartData(this.products, this.categories, this.lotes)
      },
      valueChartOptions () {
        return prepareValueChartOptions(this.categories)
      },
      valueChartSeries () {
        const data = this.valueChartData?.series?.[0]?.data ?? []
        return [
          {
            name: 'Valor em Estoque',
            data,
          },
        ]
      },
    },
    mounted () {
      this.loadData()
    },
    methods: {
      async loadData (forceRefresh = false) {
        // Verifica se já tem dados no cache
        const cachedProducts = this.dataCache.getProducts()
        const cachedCategories = this.dataCache.getCategories()
        const cachedMovements = this.dataCache.getMovements()
        const cachedLotes = this.dataCache.getLotes()

        // Se tem dados válidos no cache e não é refresh forçado, usa do cache
        if (!forceRefresh && cachedProducts && cachedCategories && cachedMovements && cachedLotes) {
          this.products = cachedProducts
          this.categories = cachedCategories
          this.movements = cachedMovements as any[]
          this.lotes = cachedLotes
          this.loading = false
          return
        }

        // Carrega do cache store (que vai buscar da API se necessário)
        this.loading = true
        try {
          const [productsData, categoriesData, movementsData, lotesData] = await Promise.all([
            this.dataCache.fetchProducts(forceRefresh),
            this.dataCache.fetchCategories(forceRefresh),
            this.dataCache.fetchMovements(forceRefresh),
            this.dataCache.fetchLotes(forceRefresh),
          ])

          this.products = productsData
          this.categories = categoriesData
          this.movements = movementsData as any[]
          this.lotes = lotesData

          console.log('📊 Dados carregados:', {
            produtos: this.products.length,
            categorias: this.categories.length,
            movimentações: this.movements.length,
            lotes: this.lotes.length,
          })
        } catch (error) {
          console.error('Erro ao carregar dados:', error)
        } finally {
          this.loading = false
        }
      },
    },
  }
</script>

<route lang="yaml">
meta:
  layout: default
</route>

<style scoped>
.relatorios-page {
  background: #000000;
  min-height: 100vh;
}

h1 {
  color: #ffffff;
}

p.text-body-1 {
  color: rgba(255, 255, 255, 0.7);
}

.chart-card {
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(123, 44, 191, 0.3) !important;
  border-color: rgba(123, 44, 191, 0.4);
}

.chart-header {
  background: linear-gradient(135deg, #2d2d2d 0%, #3a3a3a 100%);
  font-weight: 600;
  font-size: 16px;
  padding: 20px 24px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.chart-header .v-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.gap-2 {
  gap: 0.5rem;
}

.w-100 {
  width: 100%;
}

:deep(.apexcharts-text) {
  font-family: 'Roboto', sans-serif !important;
  fill: #ffffff !important;
}

:deep(.apexcharts-legend-text) {
  color: #ffffff !important;
  font-size: 14px !important;
  font-weight: 500 !important;
}

:deep(.apexcharts-datalabel) {
  font-weight: 600 !important;
  fill: #ffffff !important;
}

:deep(.apexcharts-gridline) {
  stroke: rgba(255, 255, 255, 0.1);
}

:deep(.apexcharts-xaxis-label) {
  fill: #ffffff !important;
}

:deep(.apexcharts-yaxis-label) {
  fill: #ffffff !important;
}

:deep(.apexcharts-tooltip) {
  border-radius: 8px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5) !important;
  background: #2d2d2d !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
}

:deep(.apexcharts-tooltip-title) {
  background: #1a1a1a !important;
  color: #ffffff !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}
</style>
