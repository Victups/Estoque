import type {
  LocalizacaoApi,
  MovementDisplay,
  RegistroMovimentacaoApi,
  StockMovement,
} from '@/interfaces'

import { api } from './api.config'

type MovementType = StockMovement['tipo_movimento']

function toNumber (value?: string | number | null, fallback = 0): number {
  if (value === null || value === undefined) {
    return fallback
  }
  if (typeof value === 'number') {
    return value
  }
  const parsed = Number(value)
  return Number.isNaN(parsed) ? fallback : parsed
}

function formatLocationName (location?: LocalizacaoApi | null): string | undefined {
  if (!location) {
    return undefined
  }
  const parts = [location.deposito?.nome, location.corredor, location.prateleira, location.secao]
    .filter(Boolean)
  return parts.length > 0 ? parts.join(' - ') : undefined
}

function mapStockMovement (registro: RegistroMovimentacaoApi): StockMovement {
  const produto = registro.produto ?? registro.lote?.produto
  const usuario = registro.usuario ?? registro.createdBy
  const precoUnitario = registro.precoUnitario !== undefined && registro.precoUnitario !== null
    ? toNumber(registro.precoUnitario)
    : undefined
  const valorTotal = registro.valorTotal !== undefined && registro.valorTotal !== null
    ? toNumber(registro.valorTotal)
    : undefined

  return {
    id: registro.id,
    id_produto: produto?.id ?? 0,
    quantidade: toNumber(registro.quantidade),
    data_mov: registro.dataCriacao ?? registro.createdAt ?? new Date().toISOString(),
    id_usuario: usuario?.id ?? 0,
    observacao: registro.observacao ?? null,
    preco_unitario: precoUnitario,
    id_lote: registro.lote?.id ?? 0,
    usuario_log_id: registro.usuarioLogId ?? null,
    tipo_movimento: registro.tipoMovimento,
    id_localizacao_origem: registro.localizacaoOrigem?.id ?? null,
    id_localizacao_destino: registro.localizacaoDestino?.id ?? null,
    id_localizacao: registro.localizacao?.id ?? null,
    valor_total: valorTotal,
  }
}

function mapMovementDisplay (registro: RegistroMovimentacaoApi): MovementDisplay {
  const base = mapStockMovement(registro)
  const produto = registro.produto ?? registro.lote?.produto
  const usuario = registro.usuario ?? registro.createdBy

  return {
    ...base,
    produto_nome: produto?.nome,
    produto_codigo: produto?.codigo,
    usuario_nome: usuario?.nome,
    lote_codigo: registro.lote?.codigoLote,
    localizacao_origem_nome: formatLocationName(registro.localizacaoOrigem),
    localizacao_destino_nome: formatLocationName(registro.localizacaoDestino),
  }
}

class MovementServiceClass {
  private readonly endpoint = '/estoques'

  async getAll (): Promise<StockMovement[]> {
    const { data } = await api.get<RegistroMovimentacaoApi[]>(this.endpoint)
    return data.map(registro => mapStockMovement(registro))
  }

  async getAllEnriched (): Promise<MovementDisplay[]> {
    const { data } = await api.get<RegistroMovimentacaoApi[]>(this.endpoint)
    return data.map(registro => mapMovementDisplay(registro))
  }

  async getById (id: number): Promise<MovementDisplay> {
    const { data } = await api.get<RegistroMovimentacaoApi>(`${this.endpoint}/${id}`)
    return mapMovementDisplay(data)
  }

  async getByProduct (productId: number): Promise<MovementDisplay[]> {
    const movements = await this.getAllEnriched()
    return movements.filter(movement => movement.id_produto === productId)
  }

  async getByType (type: MovementType): Promise<MovementDisplay[]> {
    const movements = await this.getAllEnriched()
    return movements.filter(movement => movement.tipo_movimento === type)
  }

  async create (movementData: {
    id_produto: number
    id_lote: number
    id_usuario: number
    quantidade: number
    tipo_movimento: MovementType
    preco_unitario?: number
    observacao?: string
    id_localizacao?: number | null
    id_localizacao_origem?: number | null
    id_localizacao_destino?: number | null
    usuario_log_id?: number | null
  }): Promise<MovementDisplay> {
    const payload = {
      id_produto: movementData.id_produto,
      id_lote: movementData.id_lote,
      id_usuario: movementData.id_usuario,
      quantidade: movementData.quantidade,
      tipo_movimento: movementData.tipo_movimento,
      preco_unitario: movementData.preco_unitario,
      valor_total: movementData.preco_unitario === undefined
        ? undefined
        : Number((movementData.preco_unitario * movementData.quantidade).toFixed(2)),
      observacao: movementData.observacao,
      id_localizacao: movementData.id_localizacao ?? undefined,
      id_localizacao_origem: movementData.id_localizacao_origem ?? undefined,
      id_localizacao_destino: movementData.id_localizacao_destino ?? undefined,
      usuario_log_id: movementData.usuario_log_id ?? undefined,
    }

    const { data } = await api.post<RegistroMovimentacaoApi>(this.endpoint, payload)
    return mapMovementDisplay(data)
  }

  async update (id: number, updates: Partial<{
    observacao: string | null
    preco_unitario: number | null
    valor_total: number | null
    id_localizacao: number | null
    id_localizacao_origem: number | null
    id_localizacao_destino: number | null
    usuario_log_id: number | null
  }>): Promise<MovementDisplay> {
    const payload = {
      observacao: updates.observacao ?? undefined,
      preco_unitario: updates.preco_unitario ?? undefined,
      valor_total: updates.valor_total ?? undefined,
      id_localizacao: updates.id_localizacao ?? undefined,
      id_localizacao_origem: updates.id_localizacao_origem ?? undefined,
      id_localizacao_destino: updates.id_localizacao_destino ?? undefined,
      usuario_log_id: updates.usuario_log_id ?? undefined,
    }

    const { data } = await api.patch<RegistroMovimentacaoApi>(`${this.endpoint}/${id}`, payload)
    return mapMovementDisplay(data)
  }

  async delete (id: number): Promise<void> {
    await api.delete(`${this.endpoint}/${id}`)
  }
}

export const MovementService = new MovementServiceClass()
