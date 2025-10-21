import { defineStore } from 'pinia'

interface AuthState {
  userName: string | null
  userEmail: string | null
  ufId: number | null
  ufLabel: string | null
  isLoggedIn: boolean
}

function deriveNameFromEmail (email: string | null): string | null {
  if (!email) return null
  const local = email.split('@')[0] ?? ''
  if (!local) return null
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
        if (!raw) return
        const data = JSON.parse(raw) as Partial<AuthState>
        this.userName = data.userName ?? null
        this.userEmail = data.userEmail ?? null
        this.ufId = data.ufId ?? null
        this.ufLabel = data.ufLabel ?? null
        this.isLoggedIn = Boolean(data.isLoggedIn)
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
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    },
    setAuth (payload: { name?: string | null, email: string, ufId: number, ufLabel: string }) {
      this.userEmail = payload.email
      this.userName = payload.name ?? deriveNameFromEmail(payload.email)
      this.ufId = payload.ufId
      this.ufLabel = payload.ufLabel
      this.isLoggedIn = true
      this.privateSave()
    },
    logout () {
      this.userName = null
      this.userEmail = null
      this.ufId = null
      this.ufLabel = null
      this.isLoggedIn = false
      this.privateSave()
    },
  },
})


