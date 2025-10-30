// Fornecedores

export interface Supplier {
  id: number
  nome: string
  cnpj: string
  id_contato: number
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

export interface ProductAllergen {
  id: number
  nome: string
}


