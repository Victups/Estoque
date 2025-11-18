import type { MovementType } from '../estoque/estoques.ts'
import type { LocalizacaoApi } from './location.ts'
import type { UsuarioBaseApi } from './user.ts'

export interface ProdutoResumoApi {
  id: number
  nome: string
  codigo: string
}

export interface LoteResumoApi {
  id: number
  codigoLote: string
  produto?: ProdutoResumoApi
  localizacao?: LocalizacaoApi
}

export interface RegistroMovimentacaoApi {
  id: number
  lote?: LoteResumoApi
  produto?: ProdutoResumoApi
  usuario?: UsuarioBaseApi
  createdBy?: UsuarioBaseApi
  quantidade: string | number
  tipoMovimento: MovementType
  valorTotal?: string | number | null
  precoUnitario?: string | number | null
  observacao?: string | null
  localizacao?: LocalizacaoApi | null
  localizacaoOrigem?: LocalizacaoApi | null
  localizacaoDestino?: LocalizacaoApi | null
  usuarioLogId?: number | null
  dataCriacao?: string
  createdAt?: string
}
