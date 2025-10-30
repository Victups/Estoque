// Tipos de produtos

export interface Product {
  id: number
  nome: string
  codigo: string
  descricao: string
  id_unidade_medida: number
  id_marca: number
  id_categoria: number
  responsavel_cadastro: number
  data_cadastro: string
  usuario_log_id: number | null
  estoque_minimo: number
  is_perecivel: boolean
}

// Lote de produto
export interface ProductLote {
  id: number
  id_produto: number
  codigo_lote: string
  data_validade: string
  quantidade: number
  data_entrada: string
  responsavel_cadastro: number
  custo_unitario: number
  preco_venda: number
  usuario_log_id: number | null
  id_localizacao: number
}

// Marca
export interface Brand {
  id: number
  nome: string
}

// Unidade de medida
export type UnidadeAbreviacao = 'un' | 'kg' | 'L' | 'pac' | 'cx' | 'g' | 'ml'

export interface UnitMeasure {
  id: number
  descricao: string
  abreviacao: UnidadeAbreviacao
}


