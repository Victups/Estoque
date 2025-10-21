import type { Product } from '@/types'
import { defineStore } from 'pinia'

import { ProductService } from '@/services'

interface CachedProductsPage {
  items: Product[]
  totalPages: number
}

interface ProductsCacheData {
  cache: Record<string, CachedProductsPage>
  order: string[]
}

export type ProductsFilters = Partial<{
  nome: string
  categoria: string | number
  marca: string | number
}>

const CACHE_KEY = 'productsCache'
const MAX_PAGES = 5

function normalizeFilters (filters?: ProductsFilters): Record<string, string> {
  if (!filters) {
    return {}
  }
  return (Object.keys(filters) as (keyof ProductsFilters)[])
    .sort()
    .filter(k => filters[k] !== undefined && filters[k] !== '')
    .reduce((acc, k) => {
      acc[k as string] = String(filters[k] as unknown as string)
      return acc
    }, {} as Record<string, string>)
}

function getCacheKey (page: number, filters?: ProductsFilters): string {
  const norm = normalizeFilters(filters)
  const filterString = Object.entries(norm)
    .map(([k, v]) => `${k}=${v}`)
    .join(';')
  return `products:page=${page};${filterString}`
}

function loadCache (): ProductsCacheData {
  const raw = sessionStorage.getItem(CACHE_KEY)
  return raw ? JSON.parse(raw) as ProductsCacheData : { cache: {}, order: [] }
}

function saveCache (data: ProductsCacheData) {
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(data))
}

function getFromCache (page: number, filters?: ProductsFilters): CachedProductsPage | null {
  const key = getCacheKey(page, filters)
  const data = loadCache()
  const entry = data.cache[key]
  if (entry) {
    data.order = data.order.filter(k => k !== key)
    data.order.push(key)
    saveCache(data)
    return entry
  }
  return null
}

function saveToCache (page: number, filters: ProductsFilters | undefined, items: Product[], totalPages: number) {
  const key = getCacheKey(page, filters)
  const data = loadCache()
  const entry: CachedProductsPage = { items, totalPages }
  data.cache[key] = entry
  data.order = data.order.filter(k => k !== key)
  data.order.push(key)
  if (data.order.length > MAX_PAGES) {
    const oldestKey = data.order.shift()
    if (oldestKey) {
      delete data.cache[oldestKey]
    }
  }
  saveCache(data)
}

function getProductFromCacheById (id: number): Product | null {
  const cacheData = loadCache()
  for (const pageKey of Object.keys(cacheData.cache)) {
    const page = cacheData.cache[pageKey]
    const found = page?.items.find(product => product.id === id)
    if (found) {
      return found
    }
  }
  return null
}

export const useProductsCacheStore = defineStore('productsCache', {
  state: () => ({
    isLoading: false as boolean,
    error: null as string | null,
  }),
  actions: {
    async getProductsPage (page: number, filters?: ProductsFilters): Promise<CachedProductsPage> {
      const cached = getFromCache(page, filters)
      if (cached) {
        return cached
      }

      this.isLoading = true
      this.error = null
      try {
        const products = await ProductService.getAll()
        const pageSize = 20
        const norm = normalizeFilters(filters)
        const filtered = products.filter(p => {
          const byNome = !norm.nome || p.nome.toLowerCase().includes(norm.nome.toLowerCase())
          return byNome
        })
        const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
        const start = (page - 1) * pageSize
        const items = filtered.slice(start, start + pageSize)
        saveToCache(page, filters, items, totalPages)
        return { items, totalPages }
      } catch (error: any) {
        this.error = error?.message ?? 'Erro ao carregar produtos'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async getProductById (id: number): Promise<Product | undefined> {
      const cached = getProductFromCacheById(id)
      if (cached) {
        return cached
      }
      try {
        const products = await ProductService.getAll()
        return products.find(p => p.id === id)
      } catch {
        return undefined
      }
    },

    clearCache () {
      saveCache({ cache: {}, order: [] })
    },
  },
})
