import type { BackendUser } from '@/interfaces'

import { api } from './api.config'
import { clearSession, getStoredToken, getStoredUser, saveSession } from './auth.storage'

interface LoginResponse {
  access_token: string
  user: BackendUser
}

class AuthServiceClass {
  async login (email: string, senha: string): Promise<BackendUser> {
    const { data } = await api.post<LoginResponse>('/auth/login', {
      email: email.trim().toLowerCase(),
      senha,
    })

    saveSession(data.access_token, data.user)
    return data.user
  }

  isAuthenticated (): boolean {
    return !!getStoredToken()
  }

  getToken (): string | null {
    return getStoredToken()
  }

  getUser (): BackendUser | null {
    return getStoredUser()
  }

  logout (): void {
    clearSession()
  }
}

export const AuthService = new AuthServiceClass()
