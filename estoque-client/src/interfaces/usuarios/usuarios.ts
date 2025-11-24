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

export interface UserProfile {
  id: number
  name: string
  email: string
  role: UserRole
  initials: string
  avatarColor: string
}

export interface NewUserForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: UserRole | ''
  tipo_contato: string
  valor_contato: string
  codigo_pais: string
  id_uf: number | null
  id_municipio: number | null
  logradouro: string
  numero: string
  complemento: string
  bairro: string
}
