import type { RoleBackend } from '../auth/auth.ts'
import type { Contact } from '../shared/shared.ts'

export interface BackendUser {
  id: number
  nome: string
  email: string
  senha?: string
  id_contato?: number | null
  role: RoleBackend
  id_uf?: number | null
  ativo?: boolean
  contato?: Contact
}

export type UserRole = 'Admin' | 'Gerente' | 'Operador' | 'Visualizador'

export interface User {
  id: number
  nome: string
  name?: string
  email: string
  role: UserRole
  avatar?: string
  status?: 'active' | 'inactive'
  avatarColor?: string
  initials?: string
  lastAccess?: string
}
