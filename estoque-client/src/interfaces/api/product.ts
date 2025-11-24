import type { UnitMeasure } from '../produtos/produtos.ts'
import type { UsuarioApi, UsuarioBaseApi } from './user.ts'

export interface ProdutoLoteApi {
  id: number
  codigo_lote: string
  quantidade: string | number
  data_validade?: string | null
  localizacao?: {
    id: number
  } | null
}

export interface ProdutoFornecedorApi {
  id_fornecedor: number
  fornecedor?: {
    id: number
    nome: string
    cnpj?: string | null
  } | null
}

export interface ProdutoApi {
  id: number
  nome: string
  codigo: string
  descricao?: string | null
  unidadeMedida?: { id: number, descricao: string, abreviacao: string }
  marca?: { id: number, nome: string }
  categoria?: { id: number, nome: string }
  responsavelCadastro?: UsuarioBaseApi
  usuarioLog?: UsuarioBaseApi | null
  usuarioLogId?: number | null
  estoqueMinimo?: string | number | null
  isPerecivel?: boolean
  ativo?: boolean
  dataCadastro?: string
  createdAt?: string
  updatedAt?: string
  createdBy?: UsuarioApi | null
  updatedBy?: UsuarioApi | null
  lotes?: ProdutoLoteApi[]
  fornecedores?: ProdutoFornecedorApi[]
}

export interface CategoriaApi {
  id: number
  nome: string
}

export interface MarcaApi {
  id: number
  nome: string
}

export interface UnidadeApi {
  id: number
  descricao: string
  abreviacao: UnitMeasure['abreviacao']
}
