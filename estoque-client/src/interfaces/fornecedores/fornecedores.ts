import type { Contact, TipoContato } from '../shared/shared.ts'

export interface Supplier {
  id: number
  nome: string
  cnpj?: string | null
  id_contato?: number | null
  contato?: Contact
}

export interface SupplierFormData {
  id: number
  nome: string
  cnpj: string
  contato_id: number | null
  contato_nome: string
  contato_valor: string
  contato_tipo: TipoContato
}

export interface SupplierAddress {
  id_fornecedor: number
  id_endereco: number
  tipo_endereco: string
}

export interface ProductSupplier {
  id_produto: number
  id_fornecedor: number
  data_cadastro: string
  usuario_log_id: number | null
}
