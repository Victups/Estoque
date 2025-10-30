import type { User } from '@/types'
import { calculateUserStats } from './user'

/**
 * Utilitários para cálculos e filtros de usuários
 */

/**
 * Filtra usuários por busca, role e status
 */
export function filterUsers (
  users: User[],
  search: string,
  filterRole: string,
  filterStatus: string,
): User[] {
  return users.filter((user: User) => {
    const roleMatch = filterRole === 'Todos' || user.role === filterRole
    const statusMatch = filterStatus === 'Todos' || user.status === filterStatus
    
    const searchLower = search.toLowerCase()
    const searchMatch = !search || 
      (user.name ?? '').toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)

    return roleMatch && statusMatch && searchMatch
  })
}

/**
 * Calcula estatísticas dos usuários
 */
export function getUserStats (users: User[]) {
  return calculateUserStats(users)
}

/**
 * Opções de filtro de role
 */
export const roleFilterOptions = ['Todos', 'Admin', 'Gerente', 'Operador', 'Visualizador']

/**
 * Opções de filtro de status
 */
export const statusFilterOptions = ['Todos', 'Ativo', 'Inativo']

/**
 * Headers da tabela de usuários
 */
export const userTableHeaders = [
  { title: '', key: 'avatar', sortable: false, width: '70px' },
  { title: 'Nome', key: 'name' },
  { title: 'Função', key: 'role' },
  { title: 'Status', key: 'status' },
  { title: 'Ações', key: 'actions', sortable: false, width: '180px' },
]

