export interface Product {
  id: number
  nome: string
  codigo: string
  descricao?: string
  id_unidade_medida: number
  id_marca?: number | null
  id_categoria?: number | null
  responsavel_cadastro: number
  data_cadastro?: string
  usuario_log_id?: number | null
  estoque_minimo: number
  is_perecivel: boolean
  ativo: boolean
}

export interface ProductFornecedorLink {
  id_fornecedor: number
  nome: string
  cnpj?: string | null
}

export interface ProductLoteResumo {
  id: number
  codigo_lote: string
  quantidade: number
  data_validade?: string | null
  id_localizacao?: number | null
}

export interface ProductDetail extends Product {
  categoria_nome?: string
  marca_nome?: string
  unidade_descricao?: string
  unidade_abreviacao?: UnidadeAbreviacao
  responsavel_nome?: string
  usuario_log_nome?: string
  criado_por_nome?: string
  atualizado_por_nome?: string
  created_at?: string
  updated_at?: string
  fornecedores?: ProductFornecedorLink[]
  lotes?: ProductLoteResumo[]
}

export interface ProductLote {
  id: number
  id_produto: number
  codigo_lote: string
  data_validade?: string | null
  quantidade: number
  data_entrada: string
  responsavel_cadastro: number
  custo_unitario?: number | null
  usuario_log_id?: number | null
  id_localizacao?: number | null
  ativo: boolean
}

export interface Brand {
  id: number
  nome: string
}

export type UnidadeAbreviacao = 'un' | 'kg' | 'L' | 'pac' | 'cx' | 'g' | 'ml'

export interface UnitMeasure {
  id: number
  descricao: string
  abreviacao: UnidadeAbreviacao
}
