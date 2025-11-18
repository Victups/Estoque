import type { BackendUser, User, UserRole } from '@/interfaces'

/**
 * Utilitários para manipulação de dados de usuários
 */
export const userUtils = {
  /**
   * Gera as iniciais de um nome
   */
  getInitials (name: string): string {
    const names = name.split(' ')
    if (names.length >= 2 && names[0]?.[0] && names[1]?.[0]) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  },

  /**
   * Determina a role baseado no nome/email
   */
  determineRole (name: string, email: string): UserRole {
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
  },

  /**
   * Gera cor do avatar baseado no index
   */
  getAvatarColor (index: number): string {
    const colors = ['primary', 'success', 'warning', 'error', 'info', 'secondary']
    return colors[index % colors.length] ?? 'primary'
  },

  /**
   * Retorna a cor baseado na role
   */
  getRoleColor (role: UserRole): string {
    const colors: Record<UserRole, string> = {
      Admin: 'error',
      Gerente: 'warning',
      Operador: 'info',
      Visualizador: 'grey',
    }
    return colors[role]
  },

  /**
   * Retorna o ícone baseado na role
   */
  getRoleIcon (role: UserRole): string {
    const icons: Record<UserRole, string> = {
      Admin: 'mdi-shield-crown',
      Gerente: 'mdi-account-tie',
      Operador: 'mdi-account-wrench',
      Visualizador: 'mdi-account-eye',
    }
    return icons[role]
  },

  /**
   * Converte BackendUser para User
   */
  mapBackendToUser (backendUser: BackendUser, index: number): User {
    return {
      id: backendUser.id,
      nome: backendUser.nome,
      name: backendUser.nome,
      email: backendUser.email,
      role: this.determineRole(backendUser.nome, backendUser.email),
      status: 'active',
      avatarColor: this.getAvatarColor(index),
      initials: this.getInitials(backendUser.nome),
      lastAccess: new Date().toLocaleString('pt-BR'),
    }
  },
}

/**
 * Mixin para estatísticas de usuários
 */
export const userStatsMixin = {
  computed: {
    activeUsers () {
      return (this as any).users.filter((u: User) => u.status === 'active')
    },

    inactiveUsers () {
      return (this as any).users.filter((u: User) => u.status === 'inactive')
    },

    adminUsers () {
      return (this as any).users.filter((u: User) => u.role === 'Admin')
    },

    totalUsers (): number {
      return (this as any).users.length
    },

    activeUsersCount () {
      return this.activeUsers.length
    },

    inactiveUsersCount () {
      return this.inactiveUsers.length
    },

    adminCount () {
      return this.adminUsers.length
    },
  },
}
