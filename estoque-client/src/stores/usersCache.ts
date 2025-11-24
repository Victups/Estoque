import type { User } from '@/interfaces'
import { defineStore } from 'pinia'
import { UfService, UserService } from '@/services'

interface CacheItem<T> {
  data: T
  timestamp: number
}

// Cache de 5 minutos (300000ms)
const CACHE_DURATION = 5 * 60 * 1000

function isCacheValid (timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION
}

export const useUsersCacheStore = defineStore('usersCache', {
  state: () => ({
    // Cache de usuários
    users: null as CacheItem<User[]> | null,
    usersLoading: false,
    usersError: null as string | null,

    // Cache de UFs
    ufs: null as CacheItem<any[]> | null,
    ufsLoading: false,
    ufsError: null as string | null,
  }),

  getters: {
    hasValidUsers: (state) => {
      return state.users !== null && isCacheValid(state.users.timestamp)
    },
    hasValidUfs: (state) => {
      return state.ufs !== null && isCacheValid(state.ufs.timestamp)
    },
  },

  actions: {
    // ========== USUÁRIOS ==========
    async fetchUsers (forceRefresh = false): Promise<User[]> {
      if (!forceRefresh && this.hasValidUsers && this.users) {
        return this.users.data
      }

      this.usersLoading = true
      this.usersError = null

      try {
        const data = await UserService.getAll()
        this.users = {
          data,
          timestamp: Date.now(),
        }
        return data
      } catch (error: any) {
        this.usersError = error?.message ?? 'Erro ao carregar usuários'
        throw error
      } finally {
        this.usersLoading = false
      }
    },

    getUsers (): User[] | null {
      return this.users?.data ?? null
    },

    invalidateUsers () {
      this.users = null
      this.usersError = null
    },

    // ========== UFs ==========
    async fetchUfs (forceRefresh = false): Promise<any[]> {
      if (!forceRefresh && this.hasValidUfs && this.ufs) {
        return this.ufs.data
      }

      this.ufsLoading = true
      this.ufsError = null

      try {
        const data = await UfService.getAll()
        this.ufs = {
          data,
          timestamp: Date.now(),
        }
        return data
      } catch (error: any) {
        this.ufsError = error?.message ?? 'Erro ao carregar UFs'
        throw error
      } finally {
        this.ufsLoading = false
      }
    },

    getUfs (): any[] | null {
      return this.ufs?.data ?? null
    },

    invalidateUfs () {
      this.ufs = null
      this.ufsError = null
    },

    // Invalida cache de usuários quando há mudanças
    invalidateAfterUserMutation () {
      this.invalidateUsers()
    },
  },
})

