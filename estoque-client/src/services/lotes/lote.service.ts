import type { LoteApi, ProductLote } from '@/interfaces'

import { api } from '../api.config'
import { API_ROUTES } from '../api.routes'

function toNumber (value: string | number | null | undefined, fallback = 0): number {
  if (value === null || value === undefined) {
    return fallback
  }
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isNaN(parsed) ? fallback : parsed
}

function mapLoteBase (lote: LoteApi): ProductLote {
  return {
  id: lote.id,
  id_produto: lote.produto?.id ?? 0,
  codigo_lote: lote.codigoLote ?? lote.codigo_lote ?? '',
  data_validade: lote.dataValidade ?? lote.data_validade ?? null,
  quantidade: toNumber(lote.quantidade, 0),
  data_entrada: lote.dataEntrada ?? lote.data_entrada ?? new Date().toISOString(),
  responsavel_cadastro: lote.responsavelCadastro?.id ?? lote.responsavel_cadastro ?? 0,
    custo_unitario: lote.custoUnitario === undefined
      ? (lote.custo_unitario === undefined ? undefined : toNumber(lote.custo_unitario, 0))
      : toNumber(lote.custoUnitario, 0),
  usuario_log_id: lote.usuarioLogId ?? lote.usuario_log_id ?? null,
  id_localizacao: lote.localizacao?.id ?? lote.id_localizacao ?? null,
  ativo: lote.ativo ?? true,
  }
}

export interface LoteEnriched extends ProductLote {
  produto_nome?: string
  produto_codigo?: string
  localizacao_nome?: string
}

function mapLoteEnriched (lote: LoteApi): LoteEnriched {
  const base = mapLoteBase(lote)
  const corredor = lote.localizacao?.corredor ?? ''
  const prateleira = lote.localizacao?.prateleira ?? ''
  const secao = lote.localizacao?.secao ?? ''
  const localizacaoNome = [corredor, prateleira, secao].filter(Boolean).join(' - ') || undefined

  return {
    ...base,
    produto_nome: lote.produto?.nome,
    produto_codigo: lote.produto?.codigo,
    localizacao_nome: localizacaoNome,
  }
}

export interface LoteComplete extends ProductLote {
  produto_nome?: string
  produto_codigo?: string
  localizacao_corredor?: string
  localizacao_prateleira?: string
  localizacao_secao?: string
  deposito_nome?: string
  endereco_completo?: string
  municipio_nome?: string
  municipio_bairro?: string
  uf_sigla?: string
  uf_nome?: string
  uf_id?: number
  localizacao_completa?: string
}

function mapLoteComplete (lote: LoteApi): LoteComplete {
  const base = mapLoteBase(lote)
  const endereco = lote.localizacao?.deposito?.endereco
  const municipio = endereco?.municipio
  const uf = municipio?.uf
  const enderecoCompleto = [
    endereco?.logradouro,
    endereco?.numero,
    endereco?.complemento,
  ].filter(Boolean).join(', ')

  const localizacaoCompleta = [
    lote.localizacao?.deposito?.nome,
    lote.localizacao?.corredor,
    lote.localizacao?.prateleira,
    lote.localizacao?.secao,
  ].filter(Boolean).join(' - ')

  return {
    ...base,
    produto_nome: lote.produto?.nome,
    produto_codigo: lote.produto?.codigo,
    localizacao_corredor: lote.localizacao?.corredor ?? undefined,
    localizacao_prateleira: lote.localizacao?.prateleira ?? undefined,
    localizacao_secao: lote.localizacao?.secao ?? undefined,
    deposito_nome: lote.localizacao?.deposito?.nome,
    endereco_completo: enderecoCompleto || undefined,
    municipio_nome: municipio?.nome,
    municipio_bairro: municipio?.bairro ?? undefined,
    uf_sigla: uf?.sigla,
    uf_nome: uf?.nome,
    uf_id: uf?.id,
    localizacao_completa: localizacaoCompleta || undefined,
  }
}

function cleanPayload<T extends Record<string, unknown>> (payload: T): T {
  const entries = Object.entries(payload).filter(([, value]) => value !== undefined && value !== null)
  return Object.fromEntries(entries) as T
}

type CreateLotePayload = {
  id_produto: number
  codigo_lote?: string
  data_validade?: string
  quantidade: number
  data_entrada: string
  responsavel_cadastro: number
  custo_unitario?: number
  usuario_log_id?: number
  id_localizacao?: number
  ativo?: boolean
}

export type CreateLoteInput = CreateLotePayload

/**
 * Serviço de API para Lotes de Produtos
 */
class LoteServiceClass {
  async getAll (): Promise<ProductLote[]> {
    const lotes = await this.fetchAll()
    return lotes.map(lote => mapLoteBase(lote))
  }

  async getAllEnriched (): Promise<LoteEnriched[]> {
    const lotes = await this.fetchAll()
    return lotes.map(lote => mapLoteEnriched(lote))
  }

  async getAllComplete (ufId?: number | null): Promise<LoteComplete[]> {
    const lotes = await this.fetchAll()
    return lotes
      .filter(lote => {
        if (ufId === undefined || ufId === null) {
          return true
        }
        return lote.localizacao?.deposito?.endereco?.municipio?.uf?.id === ufId
      })
      .map(lote => mapLoteComplete(lote))
  }

  async getById (id: number): Promise<ProductLote> {
    const { data } = await api.get<LoteApi>(API_ROUTES.lotes.byId(id))
    return mapLoteBase(data)
  }

  async getByProduct (productId: number): Promise<ProductLote[]> {
    const lotes = await this.getAll()
    return lotes.filter(lote => lote.id_produto === productId)
  }

  async getAvailableByProductFIFO (productId: number): Promise<ProductLote[]> {
    const lotes = await this.getByProduct(productId)
    const disponiveis = lotes.filter(lote => lote.quantidade > 0)
    return disponiveis.toSorted((a, b) => {
      const dataA = a.data_validade ? new Date(a.data_validade).getTime() : Number.MAX_SAFE_INTEGER
      const dataB = b.data_validade ? new Date(b.data_validade).getTime() : Number.MAX_SAFE_INTEGER
      return dataA - dataB
    })
  }

  async getByLocation (locationId: number): Promise<ProductLote[]> {
    const lotes = await this.getAll()
    return lotes.filter(lote => lote.id_localizacao === locationId)
  }

  async getExpiringSoon (days = 30): Promise<ProductLote[]> {
    const lotes = await this.getAll()
    const today = new Date()
    const limitDate = new Date()
    limitDate.setDate(today.getDate() + days)

    return lotes.filter(lote => {
      if (!lote.data_validade) {
        return false
      }
      const expiryDate = new Date(lote.data_validade)
      return expiryDate >= today && expiryDate <= limitDate
    })
  }

  async create (loteData: CreateLoteInput): Promise<ProductLote> {
    const payload: CreateLotePayload = cleanPayload({
      id_produto: loteData.id_produto,
      codigo_lote: loteData.codigo_lote?.trim() || undefined,
      data_validade: loteData.data_validade ?? undefined,
      quantidade: loteData.quantidade,
      data_entrada: loteData.data_entrada,
      responsavel_cadastro: loteData.responsavel_cadastro,
      custo_unitario: loteData.custo_unitario,
      usuario_log_id: loteData.usuario_log_id ?? undefined,
      id_localizacao: loteData.id_localizacao ?? undefined,
      ativo: loteData.ativo,
    })

    const { data } = await api.post<LoteApi>(API_ROUTES.lotes.base, payload)
    return mapLoteBase(data)
  }

  async update (id: number, updates: Partial<Omit<ProductLote, 'id'>>): Promise<ProductLote> {
    const payload = cleanPayload({
      id_produto: updates.id_produto,
      codigo_lote: updates.codigo_lote?.trim(),
      data_validade: updates.data_validade ?? undefined,
      quantidade: updates.quantidade,
      data_entrada: updates.data_entrada,
      responsavel_cadastro: updates.responsavel_cadastro,
      custo_unitario: updates.custo_unitario,
      usuario_log_id: updates.usuario_log_id,
      id_localizacao: updates.id_localizacao,
      ativo: updates.ativo,
    })

    const { data } = await api.patch<LoteApi>(API_ROUTES.lotes.byId(id), payload)
    return mapLoteBase(data)
  }

  async delete (id: number): Promise<void> {
    await api.delete(API_ROUTES.lotes.byId(id))
  }

  private async fetchAll (): Promise<LoteApi[]> {
    const { data } = await api.get<LoteApi[]>(API_ROUTES.lotes.base)
    return data
  }
}

export const LoteService = new LoteServiceClass()

