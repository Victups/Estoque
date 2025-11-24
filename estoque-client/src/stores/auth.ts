import { defineStore } from 'pinia'

import { clearSession, getStoredUser } from '@/services/auth.storage'

export interface AuthState {
  userName: string | null
  userEmail: string | null
  ufId: number | null
  ufLabel: string | null
  isLoggedIn: boolean
  role: string | null
}

function deriveNameFromEmail (email: string | null): string | null {
  if (!email) {
    return null
  }
  const local = email.split('@')[0] ?? ''
  if (!local) {
    return null
  }
  return local
    .split(/[._-]/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const STORAGE_KEY = 'authState'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    userName: null,
    userEmail: null,
    ufId: null,
    ufLabel: null,
    isLoggedIn: false,
    role: null,
  }),
  getters: {
    displayName: (state): string | null => {
      return state.userName || deriveNameFromEmail(state.userEmail)
    },
  },
  actions: {
    loadFromStorage () {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) {
          const storedUser = getStoredUser()
          if (storedUser) {
            this.userEmail = storedUser.email
            this.userName = storedUser.nome ?? deriveNameFromEmail(storedUser.email)
            this.role = storedUser.role ?? null
            this.isLoggedIn = true
          }
          return
        }
        const data = JSON.parse(raw) as Partial<AuthState>
        this.userName = data.userName ?? null
        this.userEmail = data.userEmail ?? null
        this.ufId = data.ufId ?? null
        this.ufLabel = data.ufLabel ?? null
        this.isLoggedIn = Boolean(data.isLoggedIn)
        this.role = data.role ?? null

        if (!this.isLoggedIn) {
          const storedUser = getStoredUser()
          if (storedUser) {
            this.userEmail = storedUser.email
            this.userName = storedUser.nome ?? deriveNameFromEmail(storedUser.email)
            this.role = storedUser.role ?? null
            this.isLoggedIn = true
          }
        }
      } catch {
        // ignore
      }
    },
    privateSave () {
      const data: AuthState = {
        userName: this.userName,
        userEmail: this.userEmail,
        ufId: this.ufId,
        ufLabel: this.ufLabel,
        isLoggedIn: this.isLoggedIn,
        role: this.role,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    },
    setAuth (payload: { name?: string | null, email: string, ufId: number, ufLabel: string, role?: string | null }) {
      this.userEmail = payload.email
      this.userName = payload.name ?? deriveNameFromEmail(payload.email)
      this.ufId = payload.ufId
      this.ufLabel = payload.ufLabel
      this.role = payload.role ?? null
      this.isLoggedIn = true
      this.privateSave()
    },
    logout () {
      this.userName = null
      this.userEmail = null
      this.ufId = null
      this.ufLabel = null
      this.role = null
      this.isLoggedIn = false
      this.privateSave()
      clearSession()
    },
  },
})
