import type { RoleBackend } from './auth'

// Entidades de usuário (UI e Backend)

export interface BackendUser {
  id: number
  nome: string
  email: string
  senha?: string
  id_contato: number
  role: RoleBackend
}

// UI Helper Types (não existem no banco)
export type UserRole = 'Admin' | 'Gerente' | 'Operador' | 'Visualizador'

export interface User {
  id: number
  nome: string
  name?: string // alias para compatibilidade
  email: string
  role: UserRole
  avatar?: string
  status?: 'active' | 'inactive'
  avatarColor?: string
  initials?: string
  lastAccess?: string
}


