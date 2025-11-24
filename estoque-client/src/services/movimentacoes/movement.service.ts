import type {
  LocalizacaoApi,
  MovementDisplay,
  RegistroMovimentacaoApi,
  StockMovement,
} from '@/interfaces'

import { api } from '../api.config'
import { API_ROUTES } from '../api.routes'

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
  async getAll (): Promise<StockMovement[]> {
    const { data } = await api.get<RegistroMovimentacaoApi[]>(API_ROUTES.estoques.base)
    return data.map(registro => mapStockMovement(registro))
  }

  async getAllEnriched (): Promise<MovementDisplay[]> {
    const { data } = await api.get<RegistroMovimentacaoApi[]>(API_ROUTES.estoques.base)
    return data.map(registro => mapMovementDisplay(registro))
  }

  /**
   * Busca movimentações com filtros aplicados no backend
   */
  async getAllFiltered (filters?: {
    id_produto?: number
    tipo_movimento?: MovementType
    id_usuario?: number
    data_inicio?: string
    data_fim?: string
    quantidade_min?: number
    quantidade_max?: number
    busca?: string
    pagina?: number
    tamanho?: number
  }): Promise<MovementDisplay[] | { items: MovementDisplay[]; total: number; pagina: number; totalPaginas: number }> {
    const params = new URLSearchParams()
    
    if (filters?.id_produto) {
      params.append('id_produto', String(filters.id_produto))
    }
    if (filters?.tipo_movimento) {
      params.append('tipo_movimento', filters.tipo_movimento)
    }
    if (filters?.id_usuario) {
      params.append('id_usuario', String(filters.id_usuario))
    }
    if (filters?.data_inicio) {
      params.append('data_inicio', filters.data_inicio)
    }
    if (filters?.data_fim) {
      params.append('data_fim', filters.data_fim)
    }
    if (filters?.quantidade_min !== undefined) {
      params.append('quantidade_min', String(filters.quantidade_min))
    }
    if (filters?.quantidade_max !== undefined) {
      params.append('quantidade_max', String(filters.quantidade_max))
    }
    if (filters?.busca) {
      params.append('busca', filters.busca)
    }
    if (filters?.pagina) {
      params.append('pagina', String(filters.pagina))
    }
    if (filters?.tamanho) {
      params.append('tamanho', String(filters.tamanho))
    }

    const url = `${API_ROUTES.estoques.base}${params.toString() ? `?${params.toString()}` : ''}`
    const { data } = await api.get<RegistroMovimentacaoApi[] | { items: RegistroMovimentacaoApi[]; total: number; pagina: number; totalPaginas: number }>(url)
    
    // Verifica se é resposta paginada ou array simples
    if (Array.isArray(data)) {
      return data.map(registro => mapMovementDisplay(registro))
    }
    
    // Resposta paginada
    return {
      items: data.items.map(registro => mapMovementDisplay(registro)),
      total: data.total,
      pagina: data.pagina,
      totalPaginas: data.totalPaginas,
    }
  }

  async getById (id: number): Promise<MovementDisplay> {
    const { data } = await api.get<RegistroMovimentacaoApi>(API_ROUTES.estoques.byId(id))
    return mapMovementDisplay(data)
  }

  /**
   * @deprecated Use getAllFiltered({ id_produto }) instead
   */
  async getByProduct (productId: number): Promise<MovementDisplay[]> {
    const result = await this.getAllFiltered({ id_produto: productId })
    return Array.isArray(result) ? result : result.items
  }

  /**
   * @deprecated Use getAllFiltered({ tipo_movimento }) instead
   */
  async getByType (type: MovementType): Promise<MovementDisplay[]> {
    const result = await this.getAllFiltered({ tipo_movimento: type })
    return Array.isArray(result) ? result : result.items
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
      // valor_total agora é calculado automaticamente pelo backend
      observacao: movementData.observacao,
      id_localizacao: movementData.id_localizacao ?? undefined,
      id_localizacao_origem: movementData.id_localizacao_origem ?? undefined,
      id_localizacao_destino: movementData.id_localizacao_destino ?? undefined,
      usuario_log_id: movementData.usuario_log_id ?? undefined,
    }

    const { data } = await api.post<RegistroMovimentacaoApi>(API_ROUTES.estoques.base, payload)
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

    const { data } = await api.patch<RegistroMovimentacaoApi>(API_ROUTES.estoques.byId(id), payload)
    return mapMovementDisplay(data)
  }

  async delete (id: number): Promise<void> {
    await api.delete(API_ROUTES.estoques.byId(id))
  }
}

export const MovementService = new MovementServiceClass()

