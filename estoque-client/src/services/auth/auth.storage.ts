import type { BackendUser } from '@/interfaces'

const TOKEN_STORAGE_KEY = 'auth.token'
const USER_STORAGE_KEY = 'auth.user'

function isBrowser (): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

export function saveSession (token: string, user: BackendUser): void {
  if (!isBrowser()) {
    return
  }
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

export function clearSession (): void {
  if (!isBrowser()) {
    return
  }
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
}

export function getStoredToken (): string | null {
  if (!isBrowser()) {
    return null
  }
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function getStoredUser (): BackendUser | null {
  if (!isBrowser()) {
    return null
  }
  const raw = localStorage.getItem(USER_STORAGE_KEY)
  if (!raw) {
    return null
  }
  try {
    return JSON.parse(raw) as BackendUser
  } catch {
    return null
  }
}

export function setStoredUser (user: BackendUser): void {
  if (!isBrowser()) {
    return
  }
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

