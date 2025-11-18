import type { ContatoApi } from './contact.ts'

export interface FornecedorApi {
  id: number
  nome: string
  cnpj?: string | null
  contato?: ContatoApi
  ativo?: boolean
}
