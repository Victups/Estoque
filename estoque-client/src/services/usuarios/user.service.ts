import type { BackendUser, Contact, ContatoApi, UsuarioApi } from '@/interfaces'

import { api } from '../api.config'
import { API_ROUTES } from '../api.routes'

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
  async getAll (): Promise<BackendUser[]> {
    const { data } = await api.get<UsuarioApi[]>(API_ROUTES.usuarios.base)
    return data.map(usuario => mapUsuario(usuario))
  }

  /**
   * Busca usuários com filtros e paginação aplicados no backend
   */
  async getAllFiltered (filters?: {
    busca?: string
    role?: 'admin' | 'gerente' | 'operador' | 'visualizador'
    status?: 'ativo' | 'inativo'
    pagina?: number
    tamanho?: number
  }): Promise<BackendUser[] | { items: BackendUser[]; total: number; pagina: number; totalPaginas: number }> {
    const params = new URLSearchParams()
    
    if (filters?.busca) {
      params.append('busca', filters.busca)
    }
    if (filters?.role) {
      params.append('role', filters.role)
    }
    if (filters?.status) {
      params.append('status', filters.status)
    }
    if (filters?.pagina) {
      params.append('pagina', String(filters.pagina))
    }
    if (filters?.tamanho) {
      params.append('tamanho', String(filters.tamanho))
    }

    const url = `${API_ROUTES.usuarios.base}${params.toString() ? `?${params.toString()}` : ''}`
    const { data } = await api.get<UsuarioApi[] | { items: UsuarioApi[]; total: number; pagina: number; totalPaginas: number }>(url)
    
    // Verifica se é resposta paginada ou array simples
    if (Array.isArray(data)) {
      return data.map(usuario => mapUsuario(usuario))
    }
    
    // Resposta paginada
    return {
      items: data.items.map(usuario => mapUsuario(usuario)),
      total: data.total,
      pagina: data.pagina,
      totalPaginas: data.totalPaginas,
    }
  }

  async getById (id: number): Promise<BackendUser> {
    const { data } = await api.get<UsuarioApi>(API_ROUTES.usuarios.byId(id))
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

    const { data } = await api.post<UsuarioApi>(API_ROUTES.usuarios.base, payload)
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

    const { data } = await api.patch<UsuarioApi>(API_ROUTES.usuarios.byId(id), payload)
    return mapUsuario(data)
  }

  async delete (id: number): Promise<void> {
    await api.delete(API_ROUTES.usuarios.byId(id))
  }

  async emailExists (email: string, excludeId?: number): Promise<boolean> {
    const users = await this.getAll()
    return users.some(user => user.email === email && user.id !== excludeId)
  }
}

export const UserService = new UserServiceClass()

