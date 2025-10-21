import type { BackendUser, Department, User, UserRole } from '@/types'
import { computed, type ComputedRef } from 'vue'

/**
 * Composable para manipulação de dados de usuários
 */
export function useUser () {
  /**
   * Gera as iniciais de um nome
   */
  function getInitials (name: string): string {
    const names = name.split(' ')
    if (names.length >= 2 && names[0]?.[0] && names[1]?.[0]) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  /**
   * Determina a role baseado no nome/email
   */
  function determineRole (name: string, email: string): UserRole {
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
   * Determina o departamento baseado no nome
   */
  function determineDepartment (name: string): string {
    const nameLower = name.toLowerCase()
    if (nameLower.includes('admin')) {
      return 'TI'
    }
    if (nameLower.includes('gerente')) {
      return 'Gestão'
    }
    if (nameLower.includes('almoxarife')) {
      return 'Estoque'
    }
    return 'Geral'
  }

  /**
   * Gera cor do avatar baseado no index
   */
  function getAvatarColor (index: number): string {
    const colors = ['primary', 'success', 'warning', 'error', 'info', 'secondary']
    return colors[index % colors.length] ?? 'primary'
  }

  /**
   * Retorna a cor baseado na role
   */
  function getRoleColor (role: UserRole): string {
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
  function getRoleIcon (role: UserRole): string {
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
  function mapBackendToUser (backendUser: BackendUser, index: number): User {
    return {
      id: backendUser.id,
      nome: backendUser.nome,
      name: backendUser.nome,
      email: backendUser.email,
      role: determineRole(backendUser.nome, backendUser.email),
      department: determineDepartment(backendUser.nome),
      status: 'active',
      avatarColor: getAvatarColor(index),
      initials: getInitials(backendUser.nome),
      lastAccess: new Date().toLocaleString('pt-BR'),
    }
  }

  return {
    getInitials,
    determineRole,
    determineDepartment,
    getAvatarColor,
    getRoleColor,
    getRoleIcon,
    mapBackendToUser,
  }
}

/**
 * Composable para estatísticas de usuários
 */
export function useUserStats (users: ComputedRef<User[]> | { value: User[] }) {
  const activeUsers = computed(() => {
    return users.value.filter((u: User) => u.status === 'active')
  })

  const inactiveUsers = computed(() => {
    return users.value.filter((u: User) => u.status === 'inactive')
  })

  const adminUsers = computed(() => {
    return users.value.filter((u: User) => u.role === 'Admin')
  })

  const totalUsers = computed(() => users.value.length)
  const activeUsersCount = computed(() => activeUsers.value.length)
  const inactiveUsersCount = computed(() => inactiveUsers.value.length)
  const adminCount = computed(() => adminUsers.value.length)

  return {
    activeUsers,
    inactiveUsers,
    adminUsers,
    totalUsers,
    activeUsersCount,
    inactiveUsersCount,
    adminCount,
  }
}
