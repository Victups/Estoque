import type { BackendUser, Contact, ContatoApi, UsuarioApi } from '@/interfaces'

import { api } from './api.config'

function mapContact (contato: ContatoApi): Contact {
  return {
    id: contato.id,
    nome: contato.nome,
    valor: contato.valor ?? '',
    tipo_contato: contato.tipo_contato ?? 'outro',
    codigo_pais: contato.codigo_pais ?? null,
    data_criacao: contato.dataCriacao ?? new Date().toISOString(),
  }
}

function mapUsuario (usuario: UsuarioApi): BackendUser {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    id_contato: usuario.contato?.id ?? null,
    role: usuario.role as BackendUser['role'],
    id_uf: usuario.idUf ?? null,
    ativo: usuario.ativo,
    contato: usuario.contato ? mapContact(usuario.contato) : undefined,
  }
}

type CreateUsuarioPayload = {
  nome: string
  email: string
  senha: string
  id_contato?: number
  role?: string
  id_uf?: number
  ativo?: boolean
}

class UserServiceClass {
  private endpoint = '/usuarios'

  async getAll (): Promise<BackendUser[]> {
    const { data } = await api.get<UsuarioApi[]>(this.endpoint)
    return data.map(usuario => mapUsuario(usuario))
  }

  async getById (id: number): Promise<BackendUser> {
    const { data } = await api.get<UsuarioApi>(`${this.endpoint}/${id}`)
    return mapUsuario(data)
  }

  async create (userData: Omit<BackendUser, 'id'> & { senha: string }): Promise<BackendUser> {
    const payload: CreateUsuarioPayload = {
      nome: userData.nome,
      email: userData.email,
      senha: userData.senha,
      id_contato: userData.id_contato ?? undefined,
      role: userData.role ?? 'relatorios',
      id_uf: userData.id_uf ?? undefined,
      ativo: userData.ativo ?? true,
    }

    const { data } = await api.post<UsuarioApi>(this.endpoint, payload)
    return mapUsuario(data)
  }

  async update (id: number, updates: Partial<Omit<BackendUser, 'id'>>): Promise<BackendUser> {
    const payload = {
      nome: updates.nome,
      email: updates.email,
      senha: updates.senha,
      id_contato: updates.id_contato,
      role: updates.role,
      id_uf: updates.id_uf,
      ativo: updates.ativo,
    }

    const { data } = await api.patch<UsuarioApi>(`${this.endpoint}/${id}`, payload)
    return mapUsuario(data)
  }

  async delete (id: number): Promise<void> {
    await api.delete(`${this.endpoint}/${id}`)
  }

  async emailExists (email: string, excludeId?: number): Promise<boolean> {
    const users = await this.getAll()
    return users.some(user => user.email === email && user.id !== excludeId)
  }
}

export const UserService = new UserServiceClass()
