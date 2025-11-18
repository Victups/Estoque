import type { Category, Product, ProductLote, StockMovement } from '@/interfaces'

/**
 * Utilitários para cálculos de estatísticas de estoque
 */

export interface StockStats {
  totalProducts: number
  totalStock: number
  totalValue: number
  productsNearExpiration: number
  lowStockProducts: number
}

/**
 * Calcula estatísticas gerais do estoque
 */
export function calculateStockStats (
  products: Product[],
  lotes: ProductLote[],
): StockStats {
  const today = new Date()
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

  const totalStock = lotes.reduce((sum, lote) => sum + (lote.quantidade || 0), 0)
  const totalValue = lotes.reduce((sum, lote) =>
    sum + ((lote.quantidade || 0) * (lote.custo_unitario ?? 0)), 0,
  )

  const productsNearExpiration = lotes.filter(lote => {
    if (!lote.data_validade) {
      return false
    }
    const expDate = new Date(lote.data_validade)
    if (Number.isNaN(expDate.getTime())) {
      return false
    }
    return expDate >= today && expDate <= thirtyDaysFromNow
  }).length

  const lowStockProducts = products.filter(product => {
    const productLotes = lotes.filter(l => l.id_produto === product.id)
    const totalQty = productLotes.reduce((sum, l) => sum + (l.quantidade || 0), 0)
    return totalQty < (product.estoque_minimo || 0)
  }).length

  return {
    totalProducts: products.length,
    totalStock,
    totalValue,
    productsNearExpiration,
    lowStockProducts,
  }
}

/**
 * Calcula produtos por categoria
 */
export function calculateProductsByCategory (
  products: Product[],
): Record<number, number> {
  const productsByCategory: Record<number, number> = {}

  for (const product of products) {
    const catId = product.id_categoria
    if (catId === null || catId === undefined) {
      continue
    }
    productsByCategory[catId] = (productsByCategory[catId] || 0) + 1
  }

  return productsByCategory
}

/**
 * Prepara dados para gráfico donut de produtos por categoria
 */
export function prepareDonutChartData (
  products: Product[],
  categories: Category[],
) {
  const productsByCategory = calculateProductsByCategory(products)
  const total = products.length

  if (total === 0) {
    return null
  }

  const labels = categories.map(cat => cat.nome)
  const values = categories.map(cat => productsByCategory[cat.id] || 0)
  const series = values.map(val => Number(((val / total) * 100).toFixed(1)))
  const colors = ['#7B2CBF', '#9C4ED6', '#B39DDB', '#26A69A', '#66BB6A', '#FFA726', '#EF5350']

  return {
    titulo: 'Distribuição de Produtos',
    labels,
    series,
    colors,
  }
}

/**
 * Retorna os últimos 7 dias formatados
 */
export function getLast7Days (): string[] {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    days.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }))
  }
  return days
}

/**
 * Prepara dados de movimentações para gráfico de barras
 */
export function prepareMovementsChartData (
  movements: StockMovement[],
) {
  const last7Days = getLast7Days()
  const entradas: number[] = Array.from({ length: 7 }, () => 0)
  const saidas: number[] = Array.from({ length: 7 }, () => 0)

  for (const mov of movements) {
    const movDate = new Date(mov.data_mov).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    })
    const dayIndex = last7Days.indexOf(movDate)

    if (dayIndex !== -1) {
      if (mov.tipo_movimento === 'entrada') {
        const prev = entradas[dayIndex] ?? 0
        entradas[dayIndex] = prev + (mov.quantidade || 0)
      } else if (mov.tipo_movimento === 'saida') {
        const prev = saidas[dayIndex] ?? 0
        saidas[dayIndex] = prev + (mov.quantidade || 0)
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
}

/**
 * Produto com informações de estoque
 */
export interface ProductWithStock {
  nome: string
  currentStock: number
  stockMin: number
  difference: number
}

/**
 * Retorna top 5 produtos com estoque baixo
 */
export function getTopLowStockProducts (
  products: Product[],
  lotes: ProductLote[],
  limit = 5,
): ProductWithStock[] {
  const productsWithStock = products
    .map(product => {
      const productLotes = lotes.filter(l => l.id_produto === product.id)
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
    .slice(0, limit)

  return productsWithStock
}

/**
 * Calcula valor em estoque por categoria
 */
export function calculateValueByCategory (
  products: Product[],
  categories: Category[],
  lotes: ProductLote[],
): Record<number, number> {
  const valueByCategory: Record<number, number> = {}

  for (const product of products) {
    const catId = product.id_categoria
    if (catId === null || catId === undefined) {
      continue
    }
    const productLotes = lotes.filter(l => l.id_produto === product.id)
    const totalValue = productLotes.reduce((sum, l) =>
      sum + ((l.quantidade || 0) * (l.custo_unitario ?? 0)), 0,
    )

    valueByCategory[catId] = (valueByCategory[catId] || 0) + totalValue
  }

  return valueByCategory
}

/**
 * Prepara dados para gráfico de valor por categoria
 */
export function prepareValueByCategoryChartData (
  products: Product[],
  categories: Category[],
  lotes: ProductLote[],
) {
  const valueByCategory = calculateValueByCategory(products, categories, lotes)

  return {
    categories: categories.map(cat => cat.nome),
    series: [{
      name: 'Valor em Estoque',
      data: categories.map(cat => valueByCategory[cat.id] || 0),
    }],
  }
}

/**
 * Prepara opções para gráfico de estoque baixo
 */
export function prepareLowStockChartOptions (
  products: ProductWithStock[],
) {
  return {
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
      categories: products.map(p => p.nome),
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
  }
}

/**
 * Prepara série para gráfico de estoque baixo
 */
export function prepareLowStockChartSeries (
  products: ProductWithStock[],
) {
  return [{
    name: 'Estoque Atual',
    data: products.map(p => p.currentStock),
  }]
}

/**
 * Prepara opções para gráfico de valor por categoria
 */
export function prepareValueChartOptions (
  categories: Category[],
) {
  return {
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
      categories: categories.map(c => c.nome),
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
  }
}
