<template>
  <div class="grafico-barras-completo">
    <!-- Filtros -->
    <div v-if="showFilter && filtersConfig && filtersConfig.length > 0" class="filters-section mb-4">
      <v-row>
        <v-col
          v-for="filtro in filtersConfig"
          :key="filtro.name"
          cols="12"
          md="4"
          sm="6"
        >
          <v-select
            v-if="filtro.type === 'select'"
            clearable
            density="compact"
            :items="filtro.options"
            :label="filtro.label"
            :model-value="localFiltros[filtro.name]"
            variant="outlined"
            @update:model-value="value => handleFilterInput(filtro.name, value)"
          />
          <v-text-field
            v-else-if="filtro.type === 'text'"
            clearable
            density="compact"
            :label="filtro.label"
            :model-value="localFiltros[filtro.name]"
            :placeholder="filtro.placeholder"
            variant="outlined"
            @update:model-value="value => handleFilterInput(filtro.name, value)"
          />
          <v-checkbox
            v-else-if="filtro.type === 'checkbox'"
            :label="filtro.label"
            :model-value="localFiltros[filtro.name]"
            @update:model-value="value => handleFilterInput(filtro.name, value)"
          />
        </v-col>
      </v-row>
    </div>

    <!-- Gráfico -->
    <div class="chart-container">
      <VueApexCharts
        :height="chartHeight"
        :options="chartOptions"
        :series="chartSeries"
        type="bar"
      />
    </div>

    <!-- Legenda -->
    <div v-if="showLegend && legendItems.length > 0" class="legend-section mt-4">
      <div class="legend-grid">
        <div
          v-for="item in legendItems"
          :key="item.name"
          class="legend-item"
        >
          <div
            class="legend-color"
            :style="{ backgroundColor: item.color }"
          />
          <span class="legend-label">{{ item.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import VueApexCharts from 'vue3-apexcharts'

  export interface FilterOption {
    value: string
    label: string
  }

  export interface FilterConfig {
    name: string
    label: string
    type: 'select' | 'text' | 'checkbox'
    options?: FilterOption[]
    placeholder?: string
  }

  export type DataItem = {
    nome: string
    valor: number
    cor?: string
  } & Record<string, unknown>

  export interface ChartData {
    categorias?: DataItem[] | Record<string, DataItem[]>
    categories?: string[]
    series?: Array<{ name: string, data: number[] }>
    totalProcedimentosRegistrados?: number
  }

  export interface Annotation {
    value: number
    text: string
  }

  export default {
    name: 'GraficoBarrasCompleto',
    components: {
      VueApexCharts,
    },
    props: {
      data: {
        type: Object as () => ChartData | null,
        default: null,
      },
      onChartClick: {
        type: Function,
        default: undefined,
      },
      annotation: {
        type: Object as () => Annotation | undefined,
        default: undefined,
      },
      showLegend: {
        type: Boolean,
        default: false,
      },
      legendMap: {
        type: Object as () => Record<string, { name: string, color: string }>,
        default: () => ({}),
      },
      showFilter: {
        type: Boolean,
        default: false,
      },
      xAxisTitle: {
        type: String,
        default: 'Quantidade de Registros',
      },
      yAxisTitle: {
        type: String,
        default: '',
      },
      chartOptionsOverride: {
        type: Object,
        default: () => ({}),
      },
      minBarHeight: {
        type: Number,
        default: 40,
      },
      chartPadding: {
        type: Number,
        default: 50,
      },
      direction: {
        type: String as () => 'horizontal' | 'vertical',
        default: 'horizontal',
      },
      stacked: {
        type: Boolean,
        default: false,
      },
      filtersConfig: {
        type: Array as () => FilterConfig[],
        default: () => [],
      },
      filtrosSelecionados: {
        type: Object,
        default: () => ({}),
      },
      escalaLog: {
        type: Boolean,
        default: false,
      },
      alturaFixa: {
        type: Number,
        default: undefined,
      },
    },
    emits: ['filter-change'],
    data () {
      return {
        localFiltros: { ...this.filtrosSelecionados },
      }
    },
    computed: {
      dadosFiltrados () {
        if (!this.data) return []
        if (this.stacked && this.data.categories) return this.data.categories

        let allItems: DataItem[] = []
        if (Array.isArray(this.data.categorias)) {
          allItems = this.data.categorias
        } else if (typeof this.data.categorias === 'object' && this.data.categorias !== null) {
          allItems = Object.values(this.data.categorias).flat() as DataItem[]
        }

        if (!Array.isArray(allItems)) return []
        if (!this.filtersConfig || this.filtersConfig.length === 0) return allItems

        const itemsFiltrados = allItems.filter(item => {
          if (!item) return false
          return this.filtersConfig.every(filtro => {
            const valor = this.localFiltros[filtro.name]
            if (!valor || valor === 'todos') return true

            if (!Object.prototype.hasOwnProperty.call(item, filtro.name)) return true

            if (filtro.type === 'select') {
              return String(item[filtro.name]) === String(valor)
            }
            if (filtro.type === 'text') {
              return String(item[filtro.name]).toLowerCase().includes(String(valor).toLowerCase())
            }
            return true
          })
        })

        if (this.localFiltros.mostrarTop10) {
          return itemsFiltrados
            .toSorted((a, b) => (b.valor || 0) - (a.valor || 0))
            .slice(0, 10)
        }

        return itemsFiltrados
      },
      labels () {
        if (this.stacked && this.data?.categories) return this.data.categories
        return this.dadosFiltrados.map(item => {
          if (typeof item === 'string') return item
          return item?.nome || ''
        })
      },
      valores () {
        return this.dadosFiltrados.map(item => {
          if (typeof item === 'string') return 0
          return item?.valor || 0
        })
      },
      cores () {
        return this.dadosFiltrados.map(item => {
          if (typeof item === 'string') return '#000'
          return item?.cor || '#000'
        })
      },
      chartHeight () {
        if (this.alturaFixa && this.alturaFixa > 0) return this.alturaFixa
        const finalCount = this.stacked
          ? (this.data?.categories?.length || 0)
          : this.dadosFiltrados.length
        return Math.max(300, finalCount * this.minBarHeight + this.chartPadding)
      },
      chartOptions () {
        const baseOptions = {
          chart: {
            type: 'bar' as const,
            toolbar: { show: false },
            stacked: this.stacked,
            events: this.onChartClick
              ? {
                dataPointSelection: (event: any, chartContext: any, config: any) => {
                  if (this.onChartClick) {
                    this.onChartClick(event, chartContext, config)
                  }
                },
              }
              : {},
          },
          plotOptions: {
            bar: {
              horizontal: this.direction === 'horizontal',
              borderRadius: 4,
              dataLabels: {
                position: 'top',
              },
            },
          },
          dataLabels: {
            enabled: false,
          },
          xaxis: {
            categories: this.labels,
            title: {
              text: this.direction === 'horizontal' ? this.xAxisTitle : this.yAxisTitle,
            },
            labels: {
              style: {
                colors: '#ffffff',
              },
            },
          },
          yaxis: {
            title: {
              text: this.direction === 'horizontal' ? this.yAxisTitle : this.xAxisTitle,
              style: {
                color: '#ffffff',
              },
            },
            logarithmic: this.escalaLog,
          },
          colors: this.cores,
          grid: {
            borderColor: '#404040',
            xaxis: {
              lines: {
                show: true,
              },
            },
            yaxis: {
              lines: {
                show: true,
              },
            },
          },
          tooltip: {
            theme: 'dark',
            y: {
              formatter: (val: number) => {
                return this.escalaLog ? val.toExponential(2) : val.toLocaleString('pt-BR')
              },
            },
          },
          legend: {
            show: false,
          },
          theme: {
            mode: 'dark' as const,
          },
        }

        // Aplicar anotação se fornecida
        if (this.annotation) {
          (baseOptions as any).annotations = {
            yaxis: [
              {
                y: this.annotation.value,
                borderColor: '#ff6b6b',
                borderWidth: 2,
                borderDashArray: 5,
                label: {
                  text: this.annotation.text,
                  style: {
                    color: '#ff6b6b',
                    background: 'transparent',
                  },
                },
              },
            ],
          }
        }

        // Mesclar com opções customizadas
        return { ...baseOptions, ...this.chartOptionsOverride }
      },
      chartSeries () {
        if (this.stacked && this.data?.series) {
          return this.data.series
        }
        return [
          {
            name: this.xAxisTitle,
            data: this.valores,
          },
        ]
      },
      legendItems () {
        if (!this.showLegend) return []

        if (this.stacked && this.data?.series) {
          return this.data.series.map(serie => ({
            name: serie.name,
            color: this.legendMap[serie.name]?.color || '#000',
          }))
        }

        return this.dadosFiltrados.map((item, index) => ({
          name: (item as any)?.nome || `Item ${index + 1}`,
          color: (item as any)?.cor || '#000',
        }))
      },
    },
    watch: {
      filtrosSelecionados: {
        handler (newVal) {
          this.localFiltros = { ...newVal }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      handleFilterInput (name: string, value: unknown) {
        this.localFiltros = { ...this.localFiltros, [name]: value }
        this.$emit('filter-change', { ...this.localFiltros })
      },
    },
  }
</script>

<style scoped>
.grafico-barras-completo {
  background: #1a1a1a;
  border-radius: 12px;
  padding: 20px;
  color: white;
}

.filters-section {
  background: #2a2a2a;
  border-radius: 8px;
  padding: 16px;
}

.chart-container {
  background: #1a1a1a;
  border-radius: 8px;
  padding: 16px;
}

.legend-section {
  background: #2a2a2a;
  border-radius: 8px;
  padding: 16px;
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
}

.legend-label {
  font-size: 14px;
  color: #ffffff;
}
</style>
