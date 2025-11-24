import type { MovementDisplay, Product, ProductLote } from '@/interfaces'
import { defineStore } from 'pinia'
import { CategoryService, LoteService, MovementService, ProductService } from '@/services'

interface CacheItem<T> {
  data: T
  timestamp: number
}

// Cache de 5 minutos (300000ms)
const CACHE_DURATION = 5 * 60 * 1000

function isCacheValid (timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION
}

export const useDataCacheStore = defineStore('dataCache', {
  state: () => ({
    // Cache de produtos
    products: null as CacheItem<Product[]> | null,
    productsLoading: false,
    productsError: null as string | null,

    // Cache de lotes
    lotes: null as CacheItem<ProductLote[]> | null,
    lotesLoading: false,
    lotesError: null as string | null,

    // Cache de movimentações (usando MovementDisplay que é o tipo retornado por getAllEnriched)
    movements: null as CacheItem<MovementDisplay[]> | null,
    movementsLoading: false,
    movementsError: null as string | null,

    // Cache de categorias
    categories: null as CacheItem<any[]> | null,
    categoriesLoading: false,

    // Cache de localizações (por UF)
    locations: null as CacheItem<any[]> | null,
    locationsLoading: false,
    locationsUfId: null as number | null,
  }),

  getters: {
    hasValidProducts: (state) => {
      return state.products !== null && isCacheValid(state.products.timestamp)
    },
    hasValidLotes: (state) => {
      return state.lotes !== null && isCacheValid(state.lotes.timestamp)
    },
    hasValidMovements: (state) => {
      return state.movements !== null && isCacheValid(state.movements.timestamp)
    },
    hasValidCategories: (state) => {
      return state.categories !== null && isCacheValid(state.categories.timestamp)
    },
    hasValidLocations: (state) => {
      return state.locations !== null && isCacheValid(state.locations.timestamp)
    },
  },

  actions: {
    // ========== PRODUTOS ==========
    async fetchProducts (forceRefresh = false): Promise<Product[]> {
      // Se já tem dados válidos no cache e não é refresh forçado, retorna do cache
      if (!forceRefresh && this.hasValidProducts && this.products) {
        return this.products.data
      }

      this.productsLoading = true
      this.productsError = null

      try {
        const data = await ProductService.getAll()
        this.products = {
          data,
          timestamp: Date.now(),
        }
        return data
      } catch (error: any) {
        this.productsError = error?.message ?? 'Erro ao carregar produtos'
        throw error
      } finally {
        this.productsLoading = false
      }
    },

    getProducts (): Product[] | null {
      return this.products?.data ?? null
    },

    invalidateProducts () {
      this.products = null
      this.productsError = null
    },

    // ========== LOTES ==========
    async fetchLotes (forceRefresh = false): Promise<ProductLote[]> {
      if (!forceRefresh && this.hasValidLotes && this.lotes) {
        return this.lotes.data
      }

      this.lotesLoading = true
      this.lotesError = null

      try {
        const data = await LoteService.getAll()
        this.lotes = {
          data,
          timestamp: Date.now(),
        }
        return data
      } catch (error: any) {
        this.lotesError = error?.message ?? 'Erro ao carregar lotes'
        throw error
      } finally {
        this.lotesLoading = false
      }
    },

    getLotes (): ProductLote[] | null {
      return this.lotes?.data ?? null
    },

    invalidateLotes () {
      this.lotes = null
      this.lotesError = null
    },

    // ========== MOVIMENTAÇÕES ==========
    async fetchMovements (forceRefresh = false): Promise<MovementDisplay[]> {
      if (!forceRefresh && this.hasValidMovements && this.movements) {
        return this.movements.data
      }

      this.movementsLoading = true
      this.movementsError = null

      try {
        const data = await MovementService.getAllEnriched()
        this.movements = {
          data,
          timestamp: Date.now(),
        }
        return data
      } catch (error: any) {
        this.movementsError = error?.message ?? 'Erro ao carregar movimentações'
        throw error
      } finally {
        this.movementsLoading = false
      }
    },

    getMovements (): MovementDisplay[] | null {
      return this.movements?.data ?? null
    },

    invalidateMovements () {
      this.movements = null
      this.movementsError = null
    },

    // ========== CATEGORIAS ==========
    async fetchCategories (forceRefresh = false): Promise<any[]> {
      if (!forceRefresh && this.hasValidCategories && this.categories) {
        return this.categories.data
      }

      this.categoriesLoading = true

      try {
        const data = await CategoryService.getAll()
        this.categories = {
          data,
          timestamp: Date.now(),
        }
        return data
      } catch (error: any) {
        console.error('Erro ao carregar categorias:', error)
        throw error
      } finally {
        this.categoriesLoading = false
      }
    },

    getCategories (): any[] | null {
      return this.categories?.data ?? null
    },

    invalidateCategories () {
      this.categories = null
    },

    // ========== LOCALIZAÇÕES ==========
    async fetchLocations (ufId: number | null, forceRefresh = false): Promise<any[]> {
      // Se já tem dados válidos para a mesma UF e não é refresh forçado
      if (!forceRefresh && this.hasValidLocations && this.locations && this.locationsUfId === ufId) {
        return this.locations.data
      }

      this.locationsLoading = true

      try {
        const { LocationService } = await import('@/services')
        const data = await LocationService.getAllComplete(ufId ?? undefined)
        this.locations = {
          data,
          timestamp: Date.now(),
        }
        this.locationsUfId = ufId
        return data
      } catch (error: any) {
        console.error('Erro ao carregar localizações:', error)
        throw error
      } finally {
        this.locationsLoading = false
      }
    },

    getLocations (): any[] | null {
      return this.locations?.data ?? null
    },

    invalidateLocations () {
      this.locations = null
      this.locationsUfId = null
    },

    // ========== MÉTODOS GLOBAIS ==========
    invalidateAll () {
      this.invalidateProducts()
      this.invalidateLotes()
      this.invalidateMovements()
      this.invalidateCategories()
      this.invalidateLocations()
    },

    // Invalida apenas quando há mudanças que afetam múltiplos caches
    invalidateAfterMutation (type: 'product' | 'lote' | 'movement') {
      switch (type) {
        case 'product':
          this.invalidateProducts()
          this.invalidateLotes() // Lotes dependem de produtos
          break
        case 'lote':
          this.invalidateLotes()
          this.invalidateMovements() // Movimentações dependem de lotes
          break
        case 'movement':
          this.invalidateMovements()
          this.invalidateLotes() // Movimentações alteram lotes
          break
      }
    },
  },
})

