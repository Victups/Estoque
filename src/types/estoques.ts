// Movimentação de estoque

export type MovementType = 'entrada' | 'saida'

export interface StockMovement {
  id: number
  id_produto: number
  quantidade: number
  data_mov: string
  id_usuario: number
  observacao: string | null
  preco_unitario: number
  id_lote: number
  usuario_log_id: number | null
  tipo_movimento: MovementType
  id_localizacao_origem: number | null
  id_localizacao_destino: number | null
}

// UI Helper Type
export interface MovementDisplay extends StockMovement {
  produto_nome?: string
  produto_codigo?: string
  usuario_nome?: string
  lote_codigo?: string
  localizacao_origem_nome?: string
  localizacao_destino_nome?: string
}

export interface MovementRegistry {
  id: number
  id_lote: number
  id_produto: number
  id_usuario: number
  valor_total: number
  data_criacao: string
  usuario_log_id: number | null
  id_localizacao: number
}


