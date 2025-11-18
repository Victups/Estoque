import type { ContatoApi } from './contact.ts'

export interface UsuarioBaseApi {
  id: number
  nome: string
}

export interface UsuarioApi extends UsuarioBaseApi {
  email: string
  senha: string
  contato?: ContatoApi
  idUf?: number | null
  ativo?: boolean
  role: string
}
