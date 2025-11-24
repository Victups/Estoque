<template>
  <div class="h-100">
    <div class="card-body d-flex flex-column">
      <!-- Título -->
      <h5 v-if="dados?.titulo" class="font-weight-bold mb-3 text-center">
        {{ dados.titulo }}
      </h5>

      <!-- Conteúdo do gráfico -->
      <div class="d-flex align-items-center justify-content-center w-100" :class="contentContainerClasses">
        <!-- Legenda (se posição for top ou left) -->
        <div v-if="legendPosition === 'top' || legendPosition === 'left'" class="p-2">
          <div v-if="legendContent" v-html="legendContent" />
        </div>

        <!-- Gráfico -->
        <div class="p-2">
          <div v-if="!isClient" class="d-flex flex-column align-items-center justify-content-center" style="min-height: 400px;">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Carregando...</span>
            </div>
            <p class="mt-2 text-muted">Carregando gráfico...</p>
          </div>
          <div v-else-if="criarGraficoDonut" :style="{ width: `${size}px`, height: `${size}px`, margin: '0 auto' }">
            <VueApexCharts
              :height="size"
              :options="criarGraficoDonut.options"
              :series="criarGraficoDonut.series"
              type="donut"
              :width="size"
            />
          </div>
          <div v-else class="d-flex flex-column align-items-center justify-content-center" style="min-height: 400px;">
            <div class="text-muted">
              <i class="fas fa-chart-pie fa-2x mb-2" />
              <p>Dados não disponíveis</p>
            </div>
          </div>
        </div>

        <!-- Legenda (se posição for bottom ou right) -->
        <div v-if="legendPosition === 'bottom' || legendPosition === 'right'" class="p-2">
          <div v-if="legendContent" v-html="legendContent" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import VueApexCharts from 'vue3-apexcharts'

  export interface DonutChartData {
    titulo?: string
    labels: string[]
    series: number[]
    colors: string[]
  }

  export default {
    name: 'DonutChartCard',
    components: {
      VueApexCharts,
    },
    props: {
      dados: {
        type: Object as () => DonutChartData | null,
        default: null,
      },
      legendPosition: {
        type: String as () => 'top' | 'bottom' | 'left' | 'right',
        default: 'bottom',
      },
      size: {
        type: Number,
        default: 160,
      },
    },
    data () {
      return {
        isClient: false,
      }
    },
    computed: {
      criarGraficoDonut () {
        if (!this.dados || !this.dados.labels || !this.dados.series) return null

        const options = {
          chart: {
            type: 'donut' as const,
            height: '100%',
            background: 'transparent',
            animations: {
              enabled: true,
              easing: 'easeinout',
              speed: 800,
            },
          },
          theme: {
            mode: 'dark' as const,
          },
          labels: this.dados.labels,
          colors: this.dados.colors,
          legend: {
            show: false,
          },
          dataLabels: {
            enabled: true,
            formatter: (val: number) => `${val.toFixed(1)}%`,
            style: {
              fontSize: '14px',
              fontWeight: 700,
              colors: ['#fff'],
            },
            dropShadow: {
              enabled: true,
              top: 1,
              left: 1,
              blur: 2,
              opacity: 0.8,
            },
          },
          plotOptions: {
            pie: {
              donut: {
                size: '65%',
                labels: {
                  show: true,
                  name: {
                    show: true,
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#ffffff',
                    offsetY: -10,
                  },
                  value: {
                    show: true,
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#ffffff',
                    offsetY: 16,
                    formatter: (val: string) => `${val}%`,
                  },
                  total: {
                    show: true,
                    showAlways: true,
                    label: 'Total',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#ffffff',
                    formatter: () => {
                      const total = this.dados?.series.reduce((acc, curr) => acc + curr, 0) || 0
                      return total.toString()
                    },
                  },
                },
              },
            },
          },
          stroke: {
            show: true,
            width: 2,
            colors: ['#1a1a1a'],
          },
          tooltip: {
            enabled: true,
            theme: 'dark',
            y: {
              formatter: (val: number) => `${val}%`,
            },
          },
          responsive: [
            {
              breakpoint: 480,
              options: {
                chart: {
                  width: 200,
                },
              },
            },
          ],
        }

        return {
          options,
          series: this.dados.series,
        }
      },
      legendContent () {
        if (!this.dados || !this.dados.labels || !this.dados.series) return null

        const numItems = this.dados.labels.length
        const itemFontSize = numItems > 6 ? '0.75rem' : '0.875rem'
        let containerClasses = 'd-flex'

        if (this.legendPosition === 'bottom' || this.legendPosition === 'top') {
          containerClasses += numItems > 2 ? ' flex-wrap justify-content-center gap-x-4 gap-y-2' : ' flex-column align-items-center'
        } else {
          containerClasses += ' flex-column align-items-start'
        }

        const legendItems = this.dados.labels.map((label, index) => `
          <div class="d-flex align-items-center gap-2 mb-1" style="font-size: ${itemFontSize}">
            <span class="rounded-circle" style="width: 12px; height: 12px; background-color: ${this.dados?.colors[index]}; flex-shrink: 0;"></span>
            <span style="text-align: left;">${label} (${this.dados?.series[index]}%)</span>
          </div>
        `).join('')

        return `<div class="${containerClasses}">${legendItems}</div>`
      },
      contentContainerClasses () {
        let classes = 'd-flex align-items-center justify-content-center w-100'

        switch (this.legendPosition) {
          case 'top': {
            classes += ' flex-column'
            break
          }
          case 'bottom': {
            classes += ' flex-column'
            break
          }
          case 'left': {
            classes += ' flex-row'
            break
          }
          case 'right': {
            classes += ' flex-row'
            break
          }
          default: {
            classes += ' flex-column'
          }
        }

        return classes
      },
    },
    mounted () {
      this.isClient = true
    },
  }
</script>

<style scoped>
.card-body {
  background: #1a1a1a;
  border-radius: 12px;
  color: white;
}

.text-muted {
  color: #6c757d !important;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.3em;
}

.fas {
  color: #6c757d;
}
</style>
