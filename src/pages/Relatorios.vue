<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import VueApexCharts from 'vue3-apexcharts'

  import DonutChartCard from '@/components/DonutChartCard.vue'
  import FiltrosRelatorios from '@/components/FiltrosRelatorios.vue'
  import GraficoBarrasCompleto from '@/components/GraficoBarrasCompleto.vue'
  import { CategoryService, LoteService, MovementService, ProductService } from '@/services'
  import { useAuthStore } from '@/stores/auth'

  const _auth = useAuthStore()
  const loading = ref(true)
  const filtros = ref({})

  // Dados
  const products = ref<any[]>([])
  const categories = ref<any[]>([])
  const movements = ref<any[]>([])
  const lotes = ref<any[]>([])

  // Estatísticas
  const totalProducts = computed(() => products.value.length)
  const _totalCategories = computed(() => categories.value.length)
  const totalStock = computed(() => {
    return lotes.value.reduce((sum, lote) => sum + (lote.quantidade || 0), 0)
  })
  const totalValue = computed(() => {
    return lotes.value.reduce((sum, lote) =>
      sum + ((lote.quantidade || 0) * (lote.custo_unitario || 0)), 0,
    )
  })

  // Produtos próximos ao vencimento (próximos 30 dias)
  const productsNearExpiration = computed(() => {
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

    return lotes.value.filter(lote => {
      const expDate = new Date(lote.data_validade)
      return expDate >= today && expDate <= thirtyDaysFromNow
    }).length
  })

  // Produtos com estoque baixo
  const lowStockProducts = computed(() => {
    return products.value.filter(product => {
      const productLotes = lotes.value.filter(l => l.id_produto === product.id)
      const totalQty = productLotes.reduce((sum, l) => sum + (l.quantidade || 0), 0)
      return totalQty < (product.estoque_minimo || 0)
    }).length
  })

  // ==================== GRÁFICO 1: Produtos por Categoria ====================
  const categoryChartOptions = computed(() => ({
    chart: {
      type: 'donut' as const,
      toolbar: { show: false },
    },
    labels: categories.value.map(c => c.nome),
    colors: ['#7B2CBF', '#9C4ED6', '#B39DDB', '#26A69A', '#66BB6A', '#FFA726', '#EF5350'],
    legend: {
      position: 'bottom' as const,
      fontSize: '14px',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              fontSize: '18px',
              fontWeight: 600,
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} produtos`,
      },
    },
  }))

  const categoryChartSeries = computed(() => {
    const productsByCategory: Record<number, number> = {}

    for (const product of products.value) {
      const catId = product.id_categoria
      productsByCategory[catId] = (productsByCategory[catId] || 0) + 1
    }

    return categories.value.map(cat => productsByCategory[cat.id] || 0)
  })

  // ==================== Dados para DonutChartCard ====================
  const donutChartData = computed(() => {
    const productsByCategory: Record<number, number> = {}
    const total = products.value.length

    if (total === 0) return null

    for (const product of products.value) {
      const catId = product.id_categoria
      productsByCategory[catId] = (productsByCategory[catId] || 0) + 1
    }

    const labels = categories.value.map(cat => cat.nome)
    const values = categories.value.map(cat => productsByCategory[cat.id] || 0)
    const series = values.map(val => Number(((val / total) * 100).toFixed(1)))
    const colors = ['#7B2CBF', '#9C4ED6', '#B39DDB', '#26A69A', '#66BB6A', '#FFA726', '#EF5350']

    return {
      titulo: 'Distribuição de Produtos',
      labels,
      series,
      colors,
    }
  })

  // ==================== GRÁFICO 2: Movimentações (Últimos 7 dias) ====================
  const movementChartOptions = computed(() => ({
    chart: {
      type: 'line' as const,
      toolbar: { show: true },
      zoom: { enabled: false },
    },
    colors: ['#66BB6A', '#EF5350'],
    stroke: {
      width: 3,
      curve: 'smooth' as const,
    },
    xaxis: {
      categories: getLast7Days(),
      labels: {
        style: {
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      title: {
        text: 'Quantidade',
      },
    },
    legend: {
      position: 'top' as const,
      fontSize: '14px',
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      shared: true,
      intersect: false,
    },
  }))

  const movementChartSeries = computed(() => {
    const last7Days = getLast7Days()
    const entradas: number[] = Array.from({ length: 7 }, () => 0)
    const saidas: number[] = Array.from({ length: 7 }, () => 0)

    for (const mov of movements.value) {
      const movDate = new Date(mov.data_mov).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      })
      const dayIndex = last7Days.indexOf(movDate)

      if (dayIndex !== -1) {
        if (mov.tipo_movimento === 'entrada') {
          entradas[dayIndex] += mov.quantidade || 0
        } else if (mov.tipo_movimento === 'saida') {
          saidas[dayIndex] += mov.quantidade || 0
        }
      }
    }

    return [
      { name: 'Entradas', data: entradas },
      { name: 'Saídas', data: saidas },
    ]
  })

  // ==================== Dados para GraficoBarrasCompleto (Movimentações) ====================
  const movimentacoesBarrasData = computed(() => {
    const last7Days = getLast7Days()
    const entradas: number[] = Array.from({ length: 7 }, () => 0)
    const saidas: number[] = Array.from({ length: 7 }, () => 0)

    for (const mov of movements.value) {
      const movDate = new Date(mov.data_mov).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      })
      const dayIndex = last7Days.indexOf(movDate)

      if (dayIndex !== -1) {
        if (mov.tipo_movimento === 'entrada') {
          entradas[dayIndex] += mov.quantidade || 0
        } else if (mov.tipo_movimento === 'saida') {
          saidas[dayIndex] += mov.quantidade || 0
        }
      }
    }

    return {
      categories: last7Days,
      series: [
        { name: 'Entradas', data: entradas },
        { name: 'Saídas', data: saidas },
      ],
    }
  })

  const movimentacoesLegendMap = computed(() => ({
    entradas: { name: 'Entradas', color: '#66BB6A' },
    saidas: { name: 'Saídas', color: '#EF5350' },
  }))

  function getLast7Days (): string[] {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }))
    }
    return days
  }

  // ==================== GRÁFICO 3: Top 5 Produtos com Estoque Baixo ====================
  const lowStockChartOptions = computed(() => ({
    chart: {
      type: 'bar' as const,
      toolbar: { show: false },
      background: 'transparent',
    },
    theme: {
      mode: 'dark' as const,
    },
    colors: ['#FF6B6B'],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        dataLabels: {
          position: 'top',
        },
        barHeight: '65%',
      },
    },
    dataLabels: {
      enabled: true,
      offsetX: 30,
      style: {
        fontSize: '13px',
        fontWeight: 600,
        colors: ['#ffffff'],
      },
      formatter: (val: number) => `${val} un`,
    },
    xaxis: {
      categories: getTopLowStockProducts().map(p => p.nome),
      title: {
        text: 'Quantidade em Estoque',
        style: {
          fontSize: '13px',
          fontWeight: 600,
          color: '#ffffff',
        },
      },
      labels: {
        style: {
          fontSize: '12px',
          colors: ['#ffffff'],
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '13px',
          fontWeight: 500,
          colors: ['#ffffff'],
        },
      },
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.1)',
      strokeDashArray: 4,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} unidades`,
      },
    },
  }))

  const lowStockChartSeries = computed(() => [{
    name: 'Estoque Atual',
    data: getTopLowStockProducts().map(p => p.currentStock),
  }])

  function getTopLowStockProducts () {
    const productsWithStock = products.value
      .map(product => {
        const productLotes = lotes.value.filter(l => l.id_produto === product.id)
        const currentStock = productLotes.reduce((sum, l) => sum + (l.quantidade || 0), 0)
        const stockMin = product.estoque_minimo || 0

        return {
          nome: product.nome,
          currentStock,
          stockMin,
          difference: stockMin - currentStock,
        }
      })
      .filter(p => p.currentStock < p.stockMin)
      .toSorted((a, b) => b.difference - a.difference)
      .slice(0, 5)

    return productsWithStock
  }

  // ==================== GRÁFICO 4: Valor em Estoque por Categoria ====================
  const valueChartOptions = computed(() => ({
    chart: {
      type: 'bar' as const,
      toolbar: { show: false },
      background: 'transparent',
    },
    theme: {
      mode: 'dark' as const,
    },
    colors: ['#9C4ED6'],
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '65%',
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => {
        if (val >= 1000) {
          return `R$ ${(val / 1000).toFixed(1)}k`
        }
        return `R$ ${val.toFixed(0)}`
      },
      offsetY: -25,
      style: {
        fontSize: '12px',
        fontWeight: 700,
        colors: ['#ffffff'],
      },
    },
    xaxis: {
      categories: categories.value.map(c => c.nome),
      labels: {
        style: {
          fontSize: '13px',
          fontWeight: 500,
          colors: ['#ffffff'],
        },
        rotate: -45,
        rotateAlways: false,
      },
    },
    yaxis: {
      title: {
        text: 'Valor (R$)',
        style: {
          fontSize: '13px',
          fontWeight: 600,
          color: '#ffffff',
        },
      },
      labels: {
        formatter: (val: number) => {
          if (val >= 1000) {
            return `R$ ${(val / 1000).toFixed(1)}k`
          }
          return `R$ ${val.toFixed(0)}`
        },
        style: {
          fontSize: '12px',
          colors: ['#ffffff'],
        },
      },
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.1)',
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      },
    },
  }))

  const valueChartSeries = computed(() => {
    const valueByCategory: Record<number, number> = {}

    for (const product of products.value) {
      const productLotes = lotes.value.filter(l => l.id_produto === product.id)
      const totalValue = productLotes.reduce((sum, l) =>
        sum + ((l.quantidade || 0) * (l.custo_unitario || 0)), 0,
      )

      const catId = product.id_categoria
      valueByCategory[catId] = (valueByCategory[catId] || 0) + totalValue
    }

    return [{
      name: 'Valor em Estoque',
      data: categories.value.map(cat => valueByCategory[cat.id] || 0),
    }]
  })

  // ==================== Carregar Dados ====================
  async function loadData () {
    loading.value = true
    try {
      const [productsData, categoriesData, movementsData, lotesData] = await Promise.all([
        ProductService.getAll(),
        CategoryService.getAll(),
        MovementService.getAll(),
        LoteService.getAll(),
      ])

      products.value = productsData
      categories.value = categoriesData
      movements.value = movementsData
      lotes.value = lotesData

      console.log('📊 Dados carregados:', {
        produtos: products.value.length,
        categorias: categories.value.length,
        movimentações: movements.value.length,
        lotes: lotes.value.length,
      })
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadData()
  })
</script>

<template>
  <v-container class="py-8" fluid>
    <!-- Header -->
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-6">
          <div>
            <h1 class="text-h3 font-weight-bold mb-2">
              <v-icon class="mr-2" size="40">mdi-chart-bar</v-icon>
              Relatórios e Análises
            </h1>
            <p class="text-h6 text-medium-emphasis">
              Visualize estatísticas e métricas do seu estoque
            </p>
          </div>
          <v-btn
            color="primary"
            prepend-icon="mdi-refresh"
            variant="elevated"
            @click="loadData"
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
      <v-row>
        <v-col cols="12" md="3" sm="6">
          <v-card class="stat-card" elevation="2">
            <v-card-text>
              <div class="d-flex align-center justify-space-between">
                <div>
                  <p class="text-caption text-medium-emphasis mb-1">Total de Produtos</p>
                  <h2 class="text-h4 font-weight-bold text-primary">
                    {{ totalProducts }}
                  </h2>
                </div>
                <v-avatar class="stat-icon" color="primary" size="56">
                  <v-icon color="white" size="28">mdi-package-variant</v-icon>
                </v-avatar>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="3" sm="6">
          <v-card class="stat-card" elevation="2">
            <v-card-text>
              <div class="d-flex align-center justify-space-between">
                <div>
                  <p class="text-caption text-medium-emphasis mb-1">Estoque Total</p>
                  <h2 class="text-h4 font-weight-bold text-success">
                    {{ totalStock.toLocaleString('pt-BR') }}
                  </h2>
                </div>
                <v-avatar class="stat-icon" color="success" size="56">
                  <v-icon color="white" size="28">mdi-cube</v-icon>
                </v-avatar>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="3" sm="6">
          <v-card class="stat-card" elevation="2">
            <v-card-text>
              <div class="d-flex align-center justify-space-between">
                <div>
                  <p class="text-caption text-medium-emphasis mb-1">Valor Total</p>
                  <h2 class="text-h4 font-weight-bold text-info">
                    {{ totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                  </h2>
                </div>
                <v-avatar class="stat-icon" color="info" size="56">
                  <v-icon color="white" size="28">mdi-cash-multiple</v-icon>
                </v-avatar>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="3" sm="6">
          <v-card class="stat-card" elevation="2">
            <v-card-text>
              <div class="d-flex align-center justify-space-between">
                <div>
                  <p class="text-caption text-medium-emphasis mb-1">Estoque Baixo</p>
                  <h2 class="text-h4 font-weight-bold text-error">
                    {{ lowStockProducts }}
                  </h2>
                </div>
                <v-avatar class="stat-icon" color="error" size="56">
                  <v-icon color="white" size="28">mdi-alert-circle</v-icon>
                </v-avatar>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Alertas -->
      <v-row v-if="lowStockProducts > 0 || productsNearExpiration > 0" class="mt-2">
        <v-col cols="12" md="6">
          <v-alert
            v-if="lowStockProducts > 0"
            color="error"
            icon="mdi-alert-circle"
            prominent
            variant="tonal"
          >
            <v-alert-title class="font-weight-bold">
              Atenção: Produtos com Estoque Baixo
            </v-alert-title>
            <div>
              {{ lowStockProducts }} produto(s) estão abaixo do estoque mínimo.
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
            v-if="productsNearExpiration > 0"
            color="warning"
            icon="mdi-calendar-alert"
            prominent
            variant="tonal"
          >
            <v-alert-title class="font-weight-bold">
              Atenção: Produtos Próximos ao Vencimento
            </v-alert-title>
            <div>
              {{ productsNearExpiration }} lote(s) vencem nos próximos 30 dias.
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
        <!-- Produtos por Categoria (Novo Componente) -->
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

        <!-- Produtos por Categoria (ApexCharts Original - Backup) -->
        <v-col v-if="false" cols="12" md="6">
          <v-card class="chart-card" elevation="2">
            <v-card-title class="chart-title">
              <v-icon class="mr-2">mdi-chart-donut</v-icon>
              Produtos por Categoria
            </v-card-title>
            <v-card-text>
              <VueApexCharts
                height="300"
                :options="categoryChartOptions"
                :series="categoryChartSeries"
                type="donut"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Movimentações (Novo Componente) -->
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
                :chart-options-override="{
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
                }"
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

        <!-- Movimentações (ApexCharts Original - Backup) -->
        <v-col v-if="false" cols="12" md="6">
          <v-card class="chart-card" elevation="2">
            <v-card-title class="chart-title">
              <v-icon class="mr-2">mdi-chart-line</v-icon>
              Movimentações (Últimos 7 Dias)
            </v-card-title>
            <v-card-text>
              <VueApexCharts
                height="300"
                :options="movementChartOptions"
                :series="movementChartSeries"
                type="line"
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
                v-if="getTopLowStockProducts().length > 0"
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
</template>

<route lang="yaml">
meta:
  layout: default
</route>

<style scoped>
/* Cards de estatísticas com gradiente */
.stat-card {
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.02) 100%);
  pointer-events: none;
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15) !important;
}

.stat-icon {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1);
}

/* Cards de gráficos com tema escuro */
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

/* Utilitários */
.gap-2 {
  gap: 0.5rem;
}

.w-100 {
  width: 100%;
}

/* Melhorar legibilidade dos gráficos - tema escuro */
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

/* Grid dos gráficos - tema escuro */
:deep(.apexcharts-gridline) {
  stroke: rgba(255, 255, 255, 0.1);
}

:deep(.apexcharts-xaxis-label) {
  fill: #ffffff !important;
}

:deep(.apexcharts-yaxis-label) {
  fill: #ffffff !important;
}

/* Tooltips - tema escuro */
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
