import type { BackendUser, User, UserRole } from '@/types'

/**
 * Utilitários para manipulação de dados de usuários
 */

/**
 * Gera as iniciais de um nome
 */
export function getInitials (name: string): string {
  const names = name.split(' ')
  if (names.length >= 2 && names[0]?.[0] && names[1]?.[0]) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

/**
 * Determina a role baseado no nome/email
 */
export function determineRole (name: string, email: string): UserRole {
  const nameLower = name.toLowerCase()
  const emailLower = email.toLowerCase()

  if (nameLower.includes('admin') || emailLower.includes('admin')) {
    return 'Admin'
  }
  if (nameLower.includes('gerente')) {
    return 'Gerente'
  }
  if (nameLower.includes('almoxarife')) {
    return 'Operador'
  }
  return 'Visualizador'
}

/**
 * Gera cor do avatar baseado no index
 */
export function getAvatarColor (index: number): string {
  const colors = ['primary', 'success', 'warning', 'error', 'info', 'secondary']
  return colors[index % colors.length] ?? 'primary'
}

/**
 * Retorna a cor baseado na role
 */
export function getRoleColor (role: UserRole): string {
  const colors: Record<UserRole, string> = {
    Admin: 'error',
    Gerente: 'warning',
    Operador: 'info',
    Visualizador: 'grey',
  }
  return colors[role]
}

/**
 * Retorna o ícone baseado na role
 */
export function getRoleIcon (role: UserRole): string {
  const icons: Record<UserRole, string> = {
    Admin: 'mdi-shield-crown',
    Gerente: 'mdi-account-tie',
    Operador: 'mdi-account-wrench',
    Visualizador: 'mdi-account-eye',
  }
  return icons[role]
}

/**
 * Converte BackendUser para User
 */
export function mapBackendToUser (backendUser: BackendUser, index: number): User {
  return {
    id: backendUser.id,
    nome: backendUser.nome,
    name: backendUser.nome,
    email: backendUser.email,
    role: determineRole(backendUser.nome, backendUser.email),
    status: 'active',
    avatarColor: getAvatarColor(index),
    initials: getInitials(backendUser.nome),
    lastAccess: new Date().toLocaleString('pt-BR'),
  }
}

/**
 * Calcula estatísticas de usuários
 */
export function calculateUserStats (users: User[]) {
  const activeUsers = users.filter((u: User) => u.status === 'active')
  const inactiveUsers = users.filter((u: User) => u.status === 'inactive')
  const adminUsers = users.filter((u: User) => u.role === 'Admin')

  return {
    activeUsers,
    inactiveUsers,
    adminUsers,
    totalUsers: users.length,
    activeUsersCount: activeUsers.length,
    inactiveUsersCount: inactiveUsers.length,
    adminCount: adminUsers.length,
  }
}

