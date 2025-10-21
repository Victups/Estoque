<script setup lang="ts">
  import { computed } from 'vue'
  import VueApexCharts from 'vue3-apexcharts'

  interface FilterOption {
    value: string
    label: string
  }

  interface FilterConfig {
    name: string
    label: string
    type: 'select' | 'text' | 'checkbox'
    options?: FilterOption[]
    placeholder?: string
  }

  interface DataItem {
    nome: string
    valor: number
    cor?: string
    [key: string]: any
  }

  interface StackedData {
    categories: string[]
    series: Array<{ name: string, data: number[] }>
    totalProcedimentosRegistrados?: number
  }

  interface ChartData {
    categorias?: DataItem[] | Record<string, DataItem[]>
    categories?: string[]
    series?: Array<{ name: string, data: number[] }>
    totalProcedimentosRegistrados?: number
  }

  interface Annotation {
    value: number
    text: string
  }

  interface Props {
    data: ChartData | null
    onChartClick?: (event: any, chartContext: any, config: any) => void
    annotation?: Annotation
    showLegend?: boolean
    legendMap?: Record<string, { name: string, color: string }>
    showFilter?: boolean
    xAxisTitle?: string
    yAxisTitle?: string
    chartOptionsOverride?: any
    minBarHeight?: number
    chartPadding?: number
    direction?: 'horizontal' | 'vertical'
    stacked?: boolean
    filtersConfig?: FilterConfig[]
    filtrosSelecionados?: Record<string, any>
    escalaLog?: boolean
    alturaFixa?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    showLegend: false,
    legendMap: () => ({}),
    showFilter: false,
    xAxisTitle: 'Quantidade de Registros',
    yAxisTitle: '',
    chartOptionsOverride: () => ({}),
    minBarHeight: 40,
    chartPadding: 50,
    direction: 'horizontal',
    stacked: false,
    filtrosSelecionados: () => ({}),
    escalaLog: false,
  })

  const emit = defineEmits<{
    filterChange: [filters: Record<string, any>]
  }>()

  // Dados filtrados
  const dadosFiltrados = computed(() => {
    if (!props.data) return []
    if (props.stacked) return Array.isArray(props.data.categories) ? props.data.categories : []

    let allItems: DataItem[] = []
    if (Array.isArray(props.data.categorias)) {
      allItems = props.data.categorias
    } else if (typeof props.data.categorias === 'object' && props.data.categorias !== null) {
      allItems = Object.values(props.data.categorias).flat()
    }

    if (!Array.isArray(allItems)) return []
    if (!props.filtersConfig || props.filtersConfig.length === 0) return allItems

    const itemsFiltrados = allItems.filter(item => {
      if (!item) return false
      return props.filtersConfig!.every(filtro => {
        const valor = props.filtrosSelecionados[filtro.name]
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

    if (props.filtrosSelecionados.mostrarTop10) {
      return [...itemsFiltrados]
        .sort((a, b) => (b.valor || 0) - (a.valor || 0))
        .slice(0, 10)
    }

    return itemsFiltrados
  })

  const labels = computed(() => {
    if (props.stacked && props.data?.categories) return props.data.categories
    return dadosFiltrados.value.map(item => {
      if (typeof item === 'string') return item
      return item?.nome || ''
    })
  })

  const valores = computed(() => dadosFiltrados.value.map(item => {
    if (typeof item === 'string') return 0
    return item?.valor || 0
  }))
  const cores = computed(() => dadosFiltrados.value.map(item => {
    if (typeof item === 'string') return '#000'
    return item?.cor || '#000'
  }))

  const chartHeight = computed(() => {
    if (props.alturaFixa && props.alturaFixa > 0) return props.alturaFixa
    const finalCount = props.stacked
      ? (props.data?.categories?.length || 0)
      : dadosFiltrados.value.length
    return Math.max(300, finalCount * props.minBarHeight + props.chartPadding)
  })

  // Opções base do gráfico
  const memoizedBaseOptions = computed(() => ({
    chart: {
      type: 'bar' as const,
      toolbar: { show: false },
      stacked: props.stacked,
      events: props.onChartClick
        ? {
          dataPointSelection: (event: any, chartContext: any, config: any) => {
            if (props.onChartClick) {
              props.onChartClick(event, chartContext, config)
            }
          },
        }
        : undefined,
    },
    plotOptions: {
      bar: {
        horizontal: props.direction === 'horizontal',
        borderRadius: 6,
        barHeight: '70%',
        distributed: !props.stacked,
      },
    },
    dataLabels: { enabled: false },
    grid: {
      show: true,
      borderColor: '#e0e0e0',
      strokeDashArray: 0,
      position: 'back',
    },
    legend: { show: props.stacked },
  }))

  // Eixo X
  const memoizedXAxis = computed(() => {
    const totalAtendimentos = (props.data && typeof props.data.totalProcedimentosRegistrados === 'number')
      ? props.data.totalProcedimentosRegistrados
      : null
    let maxVal: number | undefined

    if (!props.escalaLog) {
      if (totalAtendimentos && totalAtendimentos > 0) {
        maxVal = totalAtendimentos + (totalAtendimentos * 0.1)
      } else {
        const valorMaximo = Math.max(0, ...valores.value)
        maxVal = valorMaximo > 0 ? valorMaximo * 1.2 : 10
      }
    }

    return {
      categories: labels.value,
      ...(!props.escalaLog && { min: 0 }),
      max: maxVal,
      title: { text: props.direction === 'horizontal' ? props.xAxisTitle : props.yAxisTitle },
      ...(props.direction === 'horizontal' && props.escalaLog ? { logarithmic: true } : {}),
    }
  })

  // Eixo Y
  const memoizedYAxis = computed(() => ({
    title: { text: props.direction === 'horizontal' ? props.yAxisTitle : props.xAxisTitle },
    ...(props.direction === 'vertical' && props.escalaLog ? { logarithmic: true } : {}),
  }))

  // Tooltip
  const memoizedTooltip = computed(() => ({
    y: { formatter: (val: number) => `${val.toLocaleString()} registros` },
    shared: props.stacked,
    intersect: !props.stacked,
    followCursor: true,
  }))

  // Anotações
  const memoizedAnnotations = computed(() => ({
    xaxis: props.annotation
      ? [{
        x: props.annotation.value,
        borderColor: '#DC2626',
        borderWidth: 2,
        strokeDashArray: 6,
        label: {
          text: props.annotation.text,
          position: 'top',
          style: {
            color: '#DC2626',
            fontWeight: 'bold',
            background: 'transparent',
          },
        },
      }]
      : [],
  }))

  // Opções finais mescladas
  const finalChartOptions = computed(() => {
    const base = {
      ...memoizedBaseOptions.value,
      xaxis: memoizedXAxis.value,
      yaxis: memoizedYAxis.value,
      tooltip: memoizedTooltip.value,
      annotations: memoizedAnnotations.value,
      colors: props.stacked ? undefined : cores.value,
    }

    const override = props.chartOptionsOverride

    return {
      ...base,
      ...override,
      chart: { ...base.chart, ...override.chart },
      plotOptions: { ...base.plotOptions, ...override.plotOptions },
      xaxis: { ...base.xaxis, ...override.xaxis },
      yaxis: { ...base.yaxis, ...override.yaxis },
      grid: { ...base.grid, ...override.grid },
      tooltip: { ...base.tooltip, ...override.tooltip },
      legend: { ...base.legend, ...override.legend },
      annotations: { ...base.annotations, ...override.annotations },
      colors: props.stacked ? override.colors : base.colors,
    }
  })

  // Séries do gráfico
  const chartSeries = computed(() => {
    if (props.stacked && props.data?.series) return props.data.series
    return [{ name: 'Quantidade de Registros', data: valores.value }]
  })

  // Handler de mudança de filtro
  function handleFilterChange (filterName: string, value: any) {
    emit('filterChange', {
      ...props.filtrosSelecionados,
      [filterName]: value,
    })
  }
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Filtros -->
    <div
      v-if="showFilter && filtersConfig && filtersConfig.length > 0"
      class="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-4 mb-4 items-end"
    >
      <div
        v-for="filtro in filtersConfig"
        :key="filtro.name"
        class="flex flex-col"
      >
        <!-- Label (exceto para checkbox) -->
        <label
          v-if="filtro.type !== 'checkbox'"
          class="block text-sm font-medium text-gray-700 mb-1"
          :for="`filtro-${filtro.name}`"
        >
          {{ filtro.label }}
        </label>

        <!-- Select (Vuetify) -->
        <v-select
          v-if="filtro.type === 'select'"
          :id="`filtro-${filtro.name}`"
          density="compact"
          hide-details
          item-title="label"
          item-value="value"
          :items="filtro.options"
          :model-value="filtrosSelecionados[filtro.name]"
          variant="outlined"
          @update:model-value="(val) => handleFilterChange(filtro.name, val)"
        />

        <!-- Text Input (Vuetify) -->
        <v-text-field
          v-else-if="filtro.type === 'text'"
          :id="`filtro-${filtro.name}`"
          density="compact"
          hide-details
          :model-value="filtrosSelecionados[filtro.name] || ''"
          :placeholder="filtro.placeholder"
          variant="outlined"
          @update:model-value="(val) => handleFilterChange(filtro.name, val)"
        />

        <!-- Checkbox (Vuetify) -->
        <div v-else-if="filtro.type === 'checkbox'" class="flex items-center h-full pt-7">
          <v-checkbox
            :id="filtro.name"
            density="compact"
            hide-details
            :label="filtro.label"
            :model-value="filtrosSelecionados[filtro.name] || false"
            @update:model-value="(val) => handleFilterChange(filtro.name, val)"
          />
        </div>
      </div>
    </div>

    <!-- Gráfico -->
    <div class="flex-grow" :style="{ height: `${chartHeight}px` }">
      <VueApexCharts
        height="100%"
        :options="finalChartOptions"
        :series="chartSeries"
        type="bar"
      />
    </div>

    <!-- Legenda customizada -->
    <div v-if="showLegend && !stacked" class="mt-4 mb-1">
      <div
        class="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600"
      >
        <div
          v-for="(item, key) in legendMap"
          :key="key"
          class="flex items-center"
        >
          <span
            class="w-4 h-4 rounded mr-2 inline-block flex-shrink-0"
            :style="{ backgroundColor: item.color }"
          />
          <span>{{ item.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Classes utility (Tailwind-like) */
.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.flex-wrap {
  flex-wrap: wrap;
}

.flex-grow {
  flex-grow: 1;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.grid {
  display: grid;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.gap-x-6 {
  column-gap: 1.5rem;
}

.gap-y-4 {
  row-gap: 1rem;
}

.gap-6 {
  gap: 1.5rem;
}

.items-end {
  align-items: flex-end;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.h-full {
  height: 100%;
}

.h-4 {
  height: 1rem;
}

.w-4 {
  width: 1rem;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.mt-4 {
  margin-top: 1rem;
}

.pt-7 {
  padding-top: 1.75rem;
}

.block {
  display: block;
}

.inline-block {
  display: inline-block;
}

.rounded {
  border-radius: 0.25rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.font-medium {
  font-weight: 500;
}

.text-gray-700 {
  color: rgb(55 65 81);
}

.text-gray-600 {
  color: rgb(75 85 99);
}

@media (min-width: 768px) {
  .md\:grid-cols-5 {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}
</style>
