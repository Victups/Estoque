<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import VueApexCharts from 'vue3-apexcharts'

  interface DonutChartData {
    titulo?: string
    labels: string[]
    series: number[]
    colors: string[]
  }

  interface Props {
    dados: DonutChartData | null
    legendPosition?: 'top' | 'bottom' | 'left' | 'right'
    size?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    legendPosition: 'bottom',
    size: 160,
  })

  const isClient = ref(false)

  onMounted(() => {
    isClient.value = true
  })

  const criarGraficoDonut = computed(() => {
    if (!props.dados || !props.dados.labels || !props.dados.series) return null

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
      labels: props.dados.labels,
      colors: props.dados.colors,
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
                fontSize: '16px',
                fontWeight: 600,
                color: '#ffffff',
              },
              value: {
                show: true,
                fontSize: '28px',
                fontWeight: 700,
                color: '#9C4ED6',
                formatter: (val: string) => `${val}%`,
              },
              total: {
                show: true,
                label: 'Total',
                fontSize: '14px',
                fontWeight: 600,
                color: '#cccccc',
                formatter: () => {
                  const total = props.dados!.series.reduce((a, b) => a + b, 0)
                  return `${total.toFixed(0)}%`
                },
              },
            },
          },
        },
      },
      stroke: {
        width: 2,
        colors: ['#2d2d2d'],
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: (val: number) => `${val.toFixed(1)}%`,
        },
        style: {
          fontSize: '14px',
        },
        theme: 'dark',
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
      series: props.dados.series,
    }
  })

  const legendConfig = computed(() => {
    if (!props.dados || !props.dados.labels || !props.dados.series) return null

    const numItems = props.dados.labels.length
    const itemFontSize = numItems > 6 ? '0.85rem' : '0.95rem'

    let containerClasses = 'd-flex'
    if (props.legendPosition === 'bottom' || props.legendPosition === 'top') {
      containerClasses += numItems > 2
        ? ' flex-wrap justify-content-center gap-x-4 gap-y-2'
        : ' flex-column align-items-center'
    } else {
      containerClasses += ' flex-column align-items-start'
    }

    return {
      containerClasses,
      itemFontSize,
    }
  })

  const contentContainerClasses = computed(() => {
    let classes = 'd-flex align-items-center justify-content-center w-100'

    classes += props.legendPosition === 'top' || props.legendPosition === 'bottom' ? ' flex-column' : ' flex-row'

    return classes
  })

  const shouldShowLegendFirst = computed(() => {
    return props.legendPosition === 'top' || props.legendPosition === 'left'
  })
</script>

<template>
  <div class="h-100">
    <!-- Sem dados -->
    <div
      v-if="!dados || !dados.labels || !dados.series || !dados.colors"
      class="card-body d-flex flex-column align-items-center justify-content-center"
      style="min-height: 400px"
    >
      <div class="text-muted text-center">
        <v-icon color="grey" size="48">mdi-chart-pie</v-icon>
        <p class="mt-2">Dados não disponíveis</p>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-else-if="!isClient"
      class="card-body d-flex flex-column align-items-center justify-content-center"
      style="min-height: 400px"
    >
      <v-progress-circular color="primary" indeterminate size="48" />
      <p class="mt-2 text-medium-emphasis">Carregando gráfico...</p>
    </div>

    <!-- Conteúdo -->
    <div v-else class="card-body d-flex flex-column">
      <!-- Título -->
      <h5 v-if="dados.titulo" class="font-weight-bold mb-3 text-center">
        {{ dados.titulo }}
      </h5>

      <!-- Container do gráfico e legenda -->
      <div :class="contentContainerClasses">
        <!-- Legenda primeiro (top ou left) -->
        <div v-if="shouldShowLegendFirst && legendConfig" class="p-2">
          <div :class="legendConfig.containerClasses">
            <div
              v-for="(label, index) in dados.labels"
              :key="index"
              class="d-flex align-items-center gap-2 mb-1"
              :style="{ fontSize: legendConfig.itemFontSize }"
            >
              <span
                class="rounded-circle"
                :style="{
                  width: '12px',
                  height: '12px',
                  backgroundColor: dados.colors[index],
                  flexShrink: 0,
                }"
              />
              <span style="text-align: left">
                {{ label }} ({{ dados.series[index] }}%)
              </span>
            </div>
          </div>
        </div>

        <!-- Gráfico -->
        <div class="p-2" :style="{ width: `${size}px`, height: `${size}px`, margin: '0 auto' }">
          <VueApexCharts
            v-if="criarGraficoDonut"
            :height="size"
            :options="criarGraficoDonut.options"
            :series="criarGraficoDonut.series"
            type="donut"
            :width="size"
          />
        </div>

        <!-- Legenda depois (bottom ou right) -->
        <div v-if="!shouldShowLegendFirst && legendConfig" class="p-2">
          <div :class="legendConfig.containerClasses">
            <div
              v-for="(label, index) in dados.labels"
              :key="index"
              class="d-flex align-items-center gap-2 mb-1"
              :style="{ fontSize: legendConfig.itemFontSize }"
            >
              <span
                class="rounded-circle"
                :style="{
                  width: '12px',
                  height: '12px',
                  backgroundColor: dados.colors[index],
                  flexShrink: 0,
                }"
              />
              <span style="text-align: left">
                {{ label }} ({{ dados.series[index] }}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Legendas melhoradas - tema escuro */
.legend-item {
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.legend-item:hover {
  background: rgba(156, 78, 214, 0.2);
  transform: translateX(4px);
  border-color: rgba(156, 78, 214, 0.4);
}

.legend-dot {
  transition: all 0.2s ease;
}

.legend-item:hover .legend-dot {
  transform: scale(1.2);
}

.legend-text {
  color: #ffffff;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-x-4 {
  column-gap: 1rem;
}

.gap-y-2 {
  row-gap: 0.5rem;
}

.d-flex {
  display: flex;
}

.flex-column {
  flex-direction: column;
}

.flex-row {
  flex-direction: row;
}

.flex-wrap {
  flex-wrap: wrap;
}

.align-items-center {
  align-items: center;
}

.align-items-start {
  align-items: flex-start;
}

.justify-content-center {
  justify-content: center;
}

.w-100 {
  width: 100%;
}

.h-100 {
  height: 100%;
}

.text-center {
  text-align: center;
}

.rounded-circle {
  border-radius: 50%;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-3 {
  margin-bottom: 1rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.p-2 {
  padding: 0.5rem;
}

.font-weight-bold {
  font-weight: 700;
}

.text-muted {
  color: #6c757d;
}
</style>
