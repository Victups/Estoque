import type { BackendUser } from '@/types'

import { UserService } from './user.service'

/**
 * Serviço de Autenticação
 *
 * ⚠️ ATENÇÃO: Este é um serviço MOCK para desenvolvimento/frontend
 * Em produção real, a autenticação seria feita no backend com:
 * - Hash de senhas (bcrypt, argon2, etc.)
 * - JWT tokens
 * - Sessões seguras
 * - Rate limiting
 */
class AuthServiceClass {
  /**
   * Realiza login verificando credenciais (MOCK)
   *
   * ⚠️ Em um sistema real, NUNCA comparar senhas no frontend!
   * Esta implementação é apenas para simular autenticação com db.json
   */
  async login (email: string, senha: string): Promise<BackendUser | null> {
    try {
      const users = await UserService.getAll()
      // ⚠️ MOCK: Comparação direta de senha (INSEGURO para produção)
      const user = users.find((u: BackendUser) =>
        u.email === email && u.senha === senha,
      )
      return user ?? null
    } catch {
      throw new Error('Erro ao realizar login')
    }
  }

  /**
   * Valida se o usuário está autenticado
   */
  isAuthenticated (): boolean {
    // TODO: Implementar lógica de verificação de token/sessão
    return !!localStorage.getItem('user')
  }

  /**
   * Salva os dados do usuário autenticado
   */
  setUser (user: BackendUser): void {
    localStorage.setItem('user', JSON.stringify(user))
  }

  /**
   * Obtém os dados do usuário autenticado
   */
  getUser (): BackendUser | null {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      return null
    }
    try {
      return JSON.parse(userStr) as BackendUser
    } catch {
      return null
    }
  }

  /**
   * Remove os dados do usuário (logout)
   */
  logout (): void {
    localStorage.removeItem('user')
  }
}

export const AuthService = new AuthServiceClass()
