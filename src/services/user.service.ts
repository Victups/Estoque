import type { BackendUser } from '@/types'

import { api, ArrayResponse } from './api.config'

/**
 * Serviço de API para Usuários
 */
class UserServiceClass {
  private endpoint = '/usuarios'

  /**
   * Busca todos os usuários
   */
  async getAll (): Promise<BackendUser[]> {
    try {
      const response = await api.get(this.endpoint)
      return new ArrayResponse<BackendUser>(response.data).get()
    } catch {
      throw new Error('Erro ao buscar usuários')
    }
  }

  /**
   * Busca um usuário por ID
   */
  async getById (id: number): Promise<BackendUser | undefined> {
    const users = await this.getAll()
    return users.find((u: BackendUser) => u.id === id)
  }

  /**
   * Cria um novo usuário
   */
  async create (userData: Omit<BackendUser, 'id'>): Promise<BackendUser> {
    const users = await this.getAll()

    // Verificar se o email já existe
    const emailExists = users.some((u: BackendUser) => u.email === userData.email)
    if (emailExists) {
      throw new Error('Email já cadastrado')
    }

    // Gerar novo ID
    const newId: number = users.length > 0
      ? Math.max(...users.map((u: BackendUser) => u.id)) + 1
      : 1

    const newUser: BackendUser = {
      id: newId,
      nome: userData.nome,
      email: userData.email,
      senha: userData.senha,
      id_contato: userData.id_contato,
      role: userData.role || 'estoquista',
    }

    users.push(newUser)

    try {
      await api.put(this.endpoint, new ArrayResponse(users).toNestedArray())
      return newUser
    } catch {
      throw new Error('Erro ao criar usuário')
    }
  }

  /**
   * Atualiza um usuário existente
   */
  async update (id: number, updates: Partial<Omit<BackendUser, 'id'>>): Promise<BackendUser> {
    const users = await this.getAll()
    const userIndex = users.findIndex((u: BackendUser) => u.id === id)

    if (userIndex === -1) {
      throw new Error('Usuário não encontrado')
    }

    const existingUser = users[userIndex]
    if (!existingUser) {
      throw new Error('Usuário não encontrado')
    }

    const updatedUser: BackendUser = {
      id: existingUser.id,
      nome: updates.nome ?? existingUser.nome,
      email: updates.email ?? existingUser.email,
      senha: updates.senha ?? existingUser.senha,
      id_contato: updates.id_contato ?? existingUser.id_contato,
      role: updates.role ?? existingUser.role,
    }

    users[userIndex] = updatedUser

    try {
      await api.put(this.endpoint, new ArrayResponse(users).toNestedArray())
      return updatedUser
    } catch {
      throw new Error('Erro ao atualizar usuário')
    }
  }

  /**
   * Deleta um usuário
   */
  async delete (id: number): Promise<void> {
    const users = await this.getAll()
    const updatedUsers = users.filter((u: BackendUser) => u.id !== id)

    try {
      await api.put(this.endpoint, new ArrayResponse(updatedUsers).toNestedArray())
    } catch {
      throw new Error('Erro ao excluir usuário')
    }
  }

  /**
   * Verifica se um email já existe
   */
  async emailExists (email: string, excludeId?: number): Promise<boolean> {
    const users = await this.getAll()
    return users.some((u: BackendUser) =>
      u.email === email && u.id !== excludeId,
    )
  }
}

export const UserService = new UserServiceClass()
