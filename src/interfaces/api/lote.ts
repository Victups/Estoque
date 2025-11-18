import type { LocalizacaoApi } from './location.ts'

export interface LoteApi {
  id: number
  codigoLote?: string
  codigo_lote?: string
  dataValidade?: string | null
  data_validade?: string | null
  quantidade: string | number
  dataEntrada?: string
  data_entrada?: string
  responsavelCadastro?: { id: number }
  responsavel_cadastro?: number
  custoUnitario?: string | number | null
  custo_unitario?: string | number | null
  usuarioLogId?: number | null
  usuario_log_id?: number | null
  id_localizacao?: number | null
  localizacao?: LocalizacaoApi | null
  produto?: {
    id: number
    nome: string
    codigo: string
  }
  ativo?: boolean
}
